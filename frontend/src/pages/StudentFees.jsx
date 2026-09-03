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
        <StudentPageHeader  title="පන්ති ගෙවීම් - Class Fees" description="ඉදිරි ගෙවීම් සහ ඔබගේ පසුගිය ගෙවීම්.">
            <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Year</label>
                <input aria-label="Select year" type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(event.target.value)} className="student-control w-24" />
            </div>
        </StudentPageHeader>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {!data && !error && <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center text-slate-400">Loading class fees...</div>}

        {data && <>
            <section className="app-card p-5 sm:p-6 space-y-4">
                <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-cyan-400">මෙම මාසයට අදාල ගෙවීමට ඇති මුදල</h2>
                    
                </div>
                {due.length ? due.map((invoice) => {
                    const progress = invoice.paymentProgress;
                    const reached = progress.sessionsRemaining === 0;
                    return <div key={invoice._id} className={`rounded-2xl border p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] ${reached ? 'border-rose-500/25 bg-rose-950/20' : 'border-white/10 bg-white/5'}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{reached ? 'Payment due' : 'Upcoming payment'}</p><h3 className="mt-1 text-lg font-extrabold text-white">{invoice.assignedClass?.className}</h3><p className="text-sm text-slate-400">{monthName(invoice.billingMonth)} | {invoice.assignedClass?.location || 'Location not set'}</p></div>
                            <p className={`text-xl font-extrabold ${reached ? 'text-rose-400' : 'text-cyan-400'}`}>{money(invoice.amount)}</p>
                        </div>

                        {progress.rule === 'AfterSessions' && <div className="mt-5">
                            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-400"><span>Classes completed</span><span>{Math.min(progress.completedSessions, progress.targetSessions)} of {progress.targetSessions}</span></div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-white/5 border border-white/5"><div className={`h-full rounded-full bg-gradient-to-r ${reached ? 'from-rose-500 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]'}`} style={{ width: `${Math.min(100, (progress.completedSessions / progress.targetSessions) * 100)}%` }} /></div>
                        </div>}

                        <div className={`mt-4 rounded-xl p-3 text-sm font-bold border ${reached ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'}`}>
                            <p>{dueMessage(invoice)}</p>
                            {progress.nextClassDate && progress.sessionsRemaining > 0 && <p className="mt-1 text-xs font-medium text-slate-400">Next class: {dateText(progress.nextClassDate)}{invoice.assignedClass?.startTime ? ` at ${invoice.assignedClass.startTime}` : ''}</p>}
                        </div>
                        {invoice.concessionType !== 'Full' && <p className="mt-3 text-xs text-cyan-400 font-semibold">{invoice.concessionType} card applied{invoice.concessionReason ? ` | ${invoice.concessionReason}` : ''}</p>}
                    </div>;
                }) : <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 text-center"><div className="text-3xl font-extrabold text-emerald-400">OK</div><h3 className="mt-2 font-bold text-white">පන්ති ගාස්තු ගෙවා ඇත.</h3><p className="mt-1 text-sm text-emerald-300">No class fees are currently waiting for payment.</p></div>}
            </section>

            <section className="app-card p-5 sm:p-6 space-y-4">
                <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-cyan-400">පසුගිය ගෙවීම් </h2>
                    <p className="student-section-copy mt-1">Months already paid or covered by a free card.</p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5 divide-y divide-white/5 shadow-md">
                    {history.length ? history.map((invoice) => <div key={invoice._id} className="flex items-center justify-between gap-4 p-4">
                        <div className="flex items-center gap-3"><span className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold border ${invoice.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20'}`}>{invoice.status === 'Paid' ? 'Paid' : 'Free'}</span><div><p className="font-bold text-white">{monthName(invoice.billingMonth)}</p><p className="text-xs text-slate-400">{invoice.assignedClass?.className}{invoice.paymentDate ? ` | Paid ${dateText(invoice.paymentDate)}` : ' | Free card'}</p></div></div>
                        <div className="text-right"><p className="font-extrabold text-white">{invoice.status === 'Waived' ? 'Free' : money(invoice.paidAmount)}</p><p className="text-xs font-bold text-emerald-400">{invoice.status}</p></div>
                    </div>) : <div className="p-8 text-center text-slate-400">No payment history for {year}.</div>}
                </div>
            </section>
        </>}
    </div>;
};

export default StudentFees;
