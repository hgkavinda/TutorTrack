import { useEffect, useState } from 'react';
import api from '../api/client';
import StudentPageHeader from '../components/StudentPageHeader';

const PAGE_SIZE = 6;

const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`;

const monthName = (value) => {
    if (!value) return '';
    const [year, month] = value.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
    });
};

const dateText = (value) =>
    value
        ? new Date(value).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '';

const getConcessionLabel = (type) => {
    if (type === 'Half') return 'Half Card · අර්ධ ගාස්තු කාඩ්පත';
    if (type === 'Free') return 'Free Card · නිදහස් කාඩ්පත';
    if (type === 'Custom') return 'විශේෂ ගාස්තු සහනය · Custom Concession';
    return '';
};

const getDueDetails = (invoice) => {
    const progress = invoice.paymentProgress || {};
    if (progress.rule === 'AfterSessions') {
        if (progress.sessionsRemaining > 0) {
            return {
                si: `තව පන්ති දින ${progress.sessionsRemaining}කින් මෙම මාසයේ ගාස්තු ගෙවිය යුතු වේ.`,
                en: `Fee becomes due after ${progress.sessionsRemaining} more class${
                    progress.sessionsRemaining === 1 ? '' : 'es'
                }`,
            };
        }
        return {
            si: 'මෙම මාසයේ පන්ති ගාස්තුව දැන් ගෙවිය යුතුයි.',
            en: 'Monthly class fee is now due for payment',
        };
    }

    if (!invoice.dueDate) {
        return {
            si: 'මෙම මාසයේ පන්ති ගාස්තුව ගෙවීමට ඇත.',
            en: 'Monthly class fee pending',
        };
    }

    const due = new Date(invoice.dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((due - today) / 86400000);

    if (days > 0) {
        return {
            si: `තව දින ${days}කින් ගාස්තු ගෙවිය යුතුයි (${dateText(due)}).`,
            en: `Due in ${days} day${days === 1 ? '' : 's'}`,
        };
    }
    if (days === 0) {
        return {
            si: 'අද දින පන්ති ගාස්තුව ගෙවිය යුතුයි.',
            en: 'Payment is due today',
        };
    }
    return {
        si: `ගෙවිය යුතු දිනය ඉක්මවා දින ${Math.abs(days)}ක් ගතවී ඇත.`,
        en: `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`,
    };
};

const StudentFees = () => {
    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

    const [year, setYear] = useState(currentYear);
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        api.get(`/student-portal/fees?year=${year}`)
            .then((response) => {
                if (!active) return;
                setError('');
                setData(response.data.data);
            })
            .catch((requestError) => {
                if (!active) return;
                setError(requestError.response?.data?.error || 'Failed to load fees');
            });
        return () => {
            active = false;
        };
    }, [year]);

    const invoices = data?.invoices || [];
    const summary = data?.summary || {
        total: 0,
        paid: 0,
        outstanding: 0,
        counts: { Paid: 0, Unpaid: 0, Waived: 0 },
    };

    const due = invoices.filter((invoice) => invoice.status === 'Unpaid');
    const history = invoices.filter(
        (invoice) => invoice.status === 'Paid' || invoice.status === 'Waived'
    );

    const settledMonthsCount =
        Number(summary.counts?.Paid || 0) + Number(summary.counts?.Waived || 0);
    const hasDue = Number(summary.outstanding || 0) > 0 || due.length > 0;

    const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const visibleHistory = history.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
        <div className="animate-fade-in space-y-6">
            <StudentPageHeader
                eyebrow="Fees & Payments"
                title="පන්ති ගාස්තු"
                description="මාසික පන්ති ගාස්තු සහ පසුගිය ගෙවීම් ඉතිහාසය."
            >
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500">වර්ෂය · Year:</span>
                    <select
                        aria-label="Select academic year"
                        value={year}
                        onChange={(e) => {
                            setYear(Number(e.target.value));
                            setPage(1);
                        }}
                        className="border-none bg-transparent py-0.5 pr-1 text-sm font-extrabold text-slate-900 outline-none focus:ring-0 cursor-pointer"
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </StudentPageHeader>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-xs font-semibold">
                    {error}
                </div>
            )}
            {!data && !error && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-xs font-medium">
                    Loading class fees...
                </div>
            )}

            {data && (
                <>
                    {/* ── 1. Compact 3-Column Summary Card (Mobile & Desktop Aligned) ── */}
                    <section className="app-card p-4 sm:p-6 border border-slate-200 bg-white space-y-4">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold leading-snug text-slate-900">
                                    ගාස්තු සාරාංශය · {year}
                                </h2>
                                <p className="text-xs font-semibold text-blue-700">
                                    Annual Fee Summary
                                </p>
                            </div>
                            <span
                                className={`shrink-0 rounded-full border px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold ${
                                    hasDue
                                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                }`}
                            >
                                {hasDue ? 'ගෙවීමට ඇත · Pending' : '✓ සියල්ල ගෙවා ඇත'}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <div
                                className={`rounded-xl border px-2 py-3 sm:p-4 text-center ${
                                    hasDue
                                        ? 'bg-rose-50/80 border-rose-200'
                                        : 'bg-emerald-50/80 border-emerald-200'
                                }`}
                            >
                                <p
                                    className={`text-base sm:text-2xl font-black leading-none whitespace-nowrap ${
                                        hasDue ? 'text-rose-700' : 'text-emerald-700'
                                    }`}
                                >
                                    {money(summary.outstanding)}
                                </p>
                                <p
                                    className={`mt-1.5 text-[11px] sm:text-xs font-bold leading-tight ${
                                        hasDue ? 'text-rose-800' : 'text-emerald-800'
                                    }`}
                                >
                                    ගෙවීමට ඇති
                                </p>
                                <p
                                    className={`mt-0.5 text-[10px] sm:text-[11px] font-medium leading-tight ${
                                        hasDue ? 'text-rose-700/80' : 'text-emerald-700/80'
                                    }`}
                                >
                                    Due Amount
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-3 sm:p-4 text-center">
                                <p className="text-base sm:text-2xl font-black text-slate-900 leading-none whitespace-nowrap">
                                    {money(summary.paid)}
                                </p>
                                <p className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-700 leading-tight">
                                    ගෙවූ මුදල
                                </p>
                                <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-500 leading-tight">
                                    Total Paid
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-3 sm:p-4 text-center">
                                <p className="text-base sm:text-2xl font-black text-slate-900 leading-none">
                                    {settledMonthsCount}
                                </p>
                                <p className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-700 leading-tight">
                                    ගෙවූ මාස
                                </p>
                                <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-500 leading-tight">
                                    Settled Months
                                </p>
                            </div>
                        </div>

                        {/* Clean single-line confirmation when there are no pending fees (zero duplicate big empty card) */}
                        {due.length === 0 && (
                            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-emerald-800">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
                                    ✓
                                </span>
                                <p className="text-xs sm:text-sm font-semibold leading-snug">
                                    දැනට ගෙවීමට හිඟ පන්ති ගාස්තු කිසිවක් නොමැත (No pending fees).
                                </p>
                            </div>
                        )}
                    </section>

                    {/* ── 2. Pending / Due Invoices Card (Shown whenever student has Unpaid fees) ── */}
                    {due.length > 0 && (
                        <section className="app-card p-4 sm:p-6 space-y-4 border border-slate-200 bg-white">
                            <div className="border-b border-slate-100 pb-3">
                                <h2 className="text-base sm:text-lg font-bold leading-snug text-slate-900">
                                    ගෙවීමට ඇති පන්ති ගාස්තු
                                </h2>
                                <p className="text-xs font-semibold text-blue-700">
                                    Pending & Upcoming Payments
                                </p>
                            </div>

                            <div className="space-y-3.5">
                                {due.map((invoice) => {
                                    const progress = invoice.paymentProgress || {};
                                    const reached = progress.sessionsRemaining === 0;
                                    const dueInfo = getDueDetails(invoice);
                                    const completed = Math.min(
                                        progress.completedSessions || 0,
                                        progress.targetSessions || 4
                                    );
                                    const target = progress.targetSessions || 4;

                                    return (
                                        <div
                                            key={invoice._id}
                                            className={`rounded-2xl border p-4 sm:p-5 transition ${
                                                reached
                                                    ? 'border-rose-200 bg-rose-50/40'
                                                    : 'border-slate-200 bg-slate-50/60'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                                                            reached
                                                                ? 'border-rose-200 bg-rose-100 text-rose-800'
                                                                : 'border-blue-200 bg-blue-50 text-blue-700'
                                                        }`}
                                                    >
                                                        {reached
                                                            ? 'ගෙවිය යුතුයි · Payment Due'
                                                            : 'ඉදිරි ගෙවීම · Upcoming'}
                                                    </span>
                                                    <h3 className="mt-2 text-base sm:text-lg font-bold text-slate-900 leading-snug">
                                                        {monthName(invoice.billingMonth)}
                                                    </h3>
                                                    <p className="mt-0.5 text-xs font-medium text-slate-600">
                                                        {invoice.assignedClass?.className || 'Mathematics'}
                                                        {invoice.assignedClass?.location
                                                            ? ` · ${invoice.assignedClass.location}`
                                                            : ''}
                                                    </p>
                                                </div>
                                                <p
                                                    className={`shrink-0 text-xl sm:text-2xl font-black whitespace-nowrap ${
                                                        reached ? 'text-rose-600' : 'text-slate-900'
                                                    }`}
                                                >
                                                    {money(invoice.balance || invoice.amount)}
                                                </p>
                                            </div>

                                            {progress.rule === 'AfterSessions' && (
                                                <div className="mt-3.5">
                                                    <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                                                        <span>පැවැත්වූ පන්ති දින · Classes held</span>
                                                        <span className="font-bold">
                                                            {completed} / {target}
                                                        </span>
                                                    </div>
                                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                reached ? 'bg-rose-500' : 'bg-blue-600'
                                                            }`}
                                                            style={{
                                                                width: `${Math.min(
                                                                    100,
                                                                    (completed / target) * 100
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div
                                                className={`mt-3.5 rounded-xl border p-3 ${
                                                    reached
                                                        ? 'border-rose-200 bg-rose-50 text-rose-900'
                                                        : 'border-blue-200 bg-blue-50/80 text-blue-900'
                                                }`}
                                            >
                                                <p className="text-xs sm:text-sm font-bold leading-snug">
                                                    {dueInfo.si}
                                                </p>
                                                <p className="mt-0.5 text-[11px] font-medium opacity-80">
                                                    {dueInfo.en}
                                                    {progress.nextClassDate && progress.sessionsRemaining > 0
                                                        ? ` · Next class: ${dateText(progress.nextClassDate)}`
                                                        : ''}
                                                </p>
                                            </div>

                                            {invoice.concessionType && invoice.concessionType !== 'Full' && (
                                                <p className="mt-2.5 text-xs font-semibold text-blue-700">
                                                    🎟️ {getConcessionLabel(invoice.concessionType)}
                                                    {invoice.concessionReason
                                                        ? ` · ${invoice.concessionReason}`
                                                        : ''}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* ── 3. Settled Payment History ── */}
                    <section className="app-card p-4 sm:p-6 space-y-3.5 sm:space-y-4 border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold leading-snug text-slate-900">
                                    පසුගිය ගෙවීම් ඉතිහාසය
                                </h2>
                                <p className="text-xs font-semibold text-blue-700">
                                    Payment History
                                </p>
                            </div>
                            {totalPages > 1 && (
                                <span className="text-xs font-semibold text-slate-500">
                                    Page {safePage} of {totalPages}
                                </span>
                            )}
                        </div>

                        {visibleHistory.length > 0 ? (
                            <>
                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-xs">
                                    {visibleHistory.map((invoice) => {
                                        const isPaid = invoice.status === 'Paid';
                                        return (
                                            <div
                                                key={invoice._id}
                                                className="flex items-center justify-between gap-2.5 sm:gap-3.5 p-3 sm:p-4 hover:bg-slate-50/70 transition"
                                            >
                                                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
                                                    <span
                                                        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xs font-black ${
                                                            isPaid
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                : 'border-blue-200 bg-blue-50 text-blue-700'
                                                        }`}
                                                    >
                                                        {isPaid ? '✓' : 'FREE'}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-900 leading-tight">
                                                            {monthName(invoice.billingMonth)}
                                                        </p>
                                                        <p className="mt-0.5 text-xs font-medium text-slate-600 truncate">
                                                            {invoice.assignedClass?.className || 'Mathematics'}
                                                        </p>
                                                        <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                                            {isPaid && invoice.paymentDate
                                                                ? `ගෙවූ දිනය: ${dateText(invoice.paymentDate)}`
                                                                : !isPaid
                                                                ? 'Free Card · නිදහස් කාඩ්පත'
                                                                : 'ගෙවා ඇත'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="text-sm sm:text-base font-black text-slate-900 whitespace-nowrap">
                                                        {isPaid
                                                            ? money(invoice.paidAmount || invoice.amount)
                                                            : 'Rs. 0'}
                                                    </p>
                                                    <span
                                                        className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                                                            isPaid
                                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                                : 'border-blue-200 bg-blue-50 text-blue-700'
                                                        }`}
                                                    >
                                                        {isPaid ? '✓ Paid' : 'Free Card'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-2">
                                        <button
                                            type="button"
                                            disabled={safePage <= 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            ← Previous
                                        </button>
                                        <span className="text-xs font-semibold text-slate-500">
                                            {(safePage - 1) * PAGE_SIZE + 1}–
                                            {Math.min(safePage * PAGE_SIZE, history.length)} / {history.length}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={safePage >= totalPages}
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            Next →
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-8 text-center text-xs sm:text-sm font-medium text-slate-500">
                                {year} වර්ෂය සඳහා පසුගිය ගෙවීම් සටහන් වී නැත (No payment history recorded).
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default StudentFees;
