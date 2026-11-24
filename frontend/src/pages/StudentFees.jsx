import { useEffect, useState } from 'react';
import api from '../api/client';
import StudentPageHeader from '../components/StudentPageHeader';

const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`;
const monthName = (value) => {
    const [year, month] = value.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('en', { month: 'long', year: 'numeric' });
};
const dateText = (value) => value ? new Date(value).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const dueMessage = (invoice) => {
    const progress = invoice.paymentProgress;
    if (progress.rule === 'AfterSessions') {
        if (progress.sessionsRemaining > 0) {
            return `Fee becomes due after ${progress.sessionsRemaining} more class${progress.sessionsRemaining === 1 ? '' : 'es'}`;
        }
        return 'Payment is now due';
    }
    const due = new Date(invoice.dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((due - today) / 86400000);
    if (days > 0) return `Due in ${days} day${days === 1 ? '' : 's'} | ${dateText(due)}`;
    if (days === 0) return 'Payment is due today';
    return `Payment overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
};

const StudentFees = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/student-portal/fees?year=${year}`)
            .then((response) => setData(response.data.data))
            .catch((requestError) => setError(requestError.response?.data?.error || 'Failed to load fees'));
    }, [year]);

    const due = data?.invoices.filter((invoice) => invoice.status === 'Unpaid') || [];
    const history = data?.invoices.filter((invoice) => invoice.status === 'Paid' || invoice.status === 'Waived') || [];

    return <div className="animate-fade-in space-y-6">
        <StudentPageHeader eyebrow="Fees & Invoices" title="පන්ති ගාස්තු" description="ඉදිරි ගෙවීම් සහ පසුගිය ගෙවීම් ඉතිහාසය.">
            <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Year</label>
                <input aria-label="Select year" type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(event.target.value)} className="student-control w-24" />
            </div>
        </StudentPageHeader>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-xs font-semibold">{error}</div>}
        {!data && !error && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-xs font-medium">Loading class fees...</div>}

        {data && <>
            <section className="app-card p-5 sm:p-6 space-y-4 border border-slate-200 bg-white">
                <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">ගෙවීමට ඇති පන්ති ගාස්තු</h2>
                    <p className="text-xs sm:text-sm font-semibold text-blue-700">Pending & Due Invoices</p>
                </div>
                {due.length ? due.map((invoice) => {
                    const progress = invoice.paymentProgress;
                    const reached = progress.sessionsRemaining === 0;
                    return (
                        <div key={invoice._id} className={`rounded-xl border p-4 sm:p-5 transition ${reached ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-slate-50/60'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${reached ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {reached ? 'Payment Due' : 'Upcoming Payment'}
                                    </span>
                                    <h3 className="mt-2 text-lg sm:text-xl font-bold text-slate-900">{invoice.assignedClass?.className}</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">{monthName(invoice.billingMonth)} · {invoice.assignedClass?.location || 'Location not set'}</p>
                                </div>
                                <p className={`text-2xl font-black ${reached ? 'text-rose-600' : 'text-slate-900'}`}>{money(invoice.amount)}</p>
                            </div>

                            {progress.rule === 'AfterSessions' && (
                                <div className="mt-4">
                                    <div className="mb-1.5 flex justify-between text-xs sm:text-sm font-semibold text-slate-700">
                                        <span>Classes completed:</span>
                                        <span>{Math.min(progress.completedSessions, progress.targetSessions)} of {progress.targetSessions}</span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                                        <div className={`h-full rounded-full ${reached ? 'bg-rose-500' : 'bg-blue-600'}`} style={{ width: `${Math.min(100, (progress.completedSessions / progress.targetSessions) * 100)}%` }} />
                                    </div>
                                </div>
                            )}

                            <div className={`mt-3.5 rounded-xl p-3 text-xs sm:text-sm font-semibold border ${reached ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                                <p>{dueMessage(invoice)}</p>
                                {progress.nextClassDate && progress.sessionsRemaining > 0 && (
                                    <p className="mt-1 text-xs text-slate-600">Next class: {dateText(progress.nextClassDate)}{invoice.assignedClass?.startTime ? ` at ${invoice.assignedClass.startTime}` : ''}</p>
                                )}
                            </div>
                            {invoice.concessionType !== 'Full' && (
                                <p className="mt-2 text-xs sm:text-sm text-blue-700 font-semibold">{invoice.concessionType} card applied{invoice.concessionReason ? ` · ${invoice.concessionReason}` : ''}</p>
                            )}
                        </div>
                    );
                }) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 text-center">
                        <div className="h-12 w-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold mb-2">✓</div>
                        <h3 className="font-extrabold text-base text-emerald-950">පන්ති ගාස්තු සම්පූර්ණයෙන්ම ගෙවා ඇත</h3>
                        <p className="mt-1 text-xs sm:text-sm text-emerald-700 font-medium">No class fees are currently pending for payment.</p>
                    </div>
                )}
            </section>

            <section className="app-card p-5 sm:p-6 space-y-4 border border-slate-200 bg-white">
                <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">පසුගිය ගෙවීම් ඉතිහාසය</h2>
                    <p className="text-xs sm:text-sm font-semibold text-blue-700">Payment receipts and settled months</p>
                </div>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-xs">
                    {history.length ? history.map((invoice) => (
                        <div key={invoice._id} className="flex items-center justify-between gap-3 p-4">
                            <div className="flex items-center gap-3">
                                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold border ${invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {invoice.status === 'Paid' ? '✓' : 'Free'}
                                </span>
                                <div>
                                    <p className="font-bold text-sm text-slate-900">{monthName(invoice.billingMonth)}</p>
                                    <p className="text-xs text-slate-500">{invoice.assignedClass?.className}{invoice.paymentDate ? ` · Paid ${dateText(invoice.paymentDate)}` : ' · Free card'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-extrabold text-base text-slate-900">{invoice.status === 'Waived' ? 'Free' : money(invoice.paidAmount)}</p>
                                <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">{invoice.status}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="p-6 text-center text-xs text-slate-500">No payment history recorded for {year}.</div>
                    )}
                </div>
            </section>
        </>}
    </div>;
};

export default StudentFees;
