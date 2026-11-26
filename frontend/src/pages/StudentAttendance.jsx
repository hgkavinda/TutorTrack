import { useEffect, useState } from 'react';
import api from '../api/client';
import StudentPageHeader from '../components/StudentPageHeader';

const MONTH_OPTIONS = [
    { value: 'all', label: 'All Months · සියලුම මාස' },
    { value: '01', label: 'January · ජනවාරි' },
    { value: '02', label: 'February · පෙබරවාරි' },
    { value: '03', label: 'March · මාර්තු' },
    { value: '04', label: 'April · අප්‍රේල්' },
    { value: '05', label: 'May · මැයි' },
    { value: '06', label: 'June · ජූනි' },
    { value: '07', label: 'July · ජූලි' },
    { value: '08', label: 'August · අගෝස්තු' },
    { value: '09', label: 'September · සැප්තැම්බර්' },
    { value: '10', label: 'October · ඔක්තෝබර්' },
    { value: '11', label: 'November · නොවැම්බර්' },
    { value: '12', label: 'December · දෙසැම්බර්' },
];

const PAGE_SIZE = 6;
const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const getMonthPart = (value) => {
    const date = new Date(value);
    return String(date.getMonth() + 1).padStart(2, '0');
};

const formatPeriodTitle = (year, monthValue) => {
    if (monthValue === 'all') return `${year} වාර්ෂික සාරාංශය · Full Year`;
    const date = new Date(year, Number(monthValue) - 1, 1);
    const enMonth = date.toLocaleString('en-US', { month: 'long' });
    return `${enMonth} ${year}`;
};

const StudentAttendance = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthCode = String(now.getMonth() + 1).padStart(2, '0');
    const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthCode);
    const [selectedClass, setSelectedClass] = useState('all');
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        api.get(`/student-portal/attendance?year=${selectedYear}`)
            .then((response) => {
                if (!active) return;
                const payload = response.data.data;
                setError('');
                setData(payload);

                // If viewing current year on initial load and current calendar month has no sessions yet,
                // smartly select the latest month that has recorded classes so parents don't land on an empty screen.
                const records = payload?.history || [];
                if (records.length > 0) {
                    const hasCurrentMonth = records.some(
                        (r) => getMonthPart(r.date) === currentMonthCode
                    );
                    if (!hasCurrentMonth && selectedYear === currentYear) {
                        const latestDate = records
                            .slice()
                            .sort((a, b) => new Date(b.date) - new Date(a.date))[0]?.date;
                        if (latestDate) {
                            setSelectedMonth(getMonthPart(latestDate));
                        }
                    }
                }
            })
            .catch((requestError) => {
                if (!active) return;
                setError(requestError.response?.data?.error || 'Failed to load attendance');
            });
        return () => {
            active = false;
        };
    }, [selectedYear, currentYear, currentMonthCode]);

    const enrolledClasses = data?.enrolledClasses || [];
    const hasMultipleClasses = enrolledClasses.length > 1;

    // Filter & sort newest first
    const filteredRecords = (data?.history || [])
        .filter((record) => {
            if (hasMultipleClasses && selectedClass !== 'all') {
                if (String(record.assignedClass?._id) !== String(selectedClass)) return false;
            }
            if (selectedMonth !== 'all') {
                if (getMonthPart(record.date) !== selectedMonth) return false;
            }
            return true;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalSessions = filteredRecords.length;
    const presentCount = filteredRecords.filter((r) => r.status === 'Present').length;
    const absentCount = filteredRecords.filter((r) => r.status === 'Absent').length;
    const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    // Clean pagination so the page never stretches endlessly even on "All Months"
    const totalPages = Math.max(1, Math.ceil(totalSessions / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const visibleRecords = filteredRecords.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    const ringStrokeColor =
        attendanceRate >= 80 ? '#10b981' : attendanceRate >= 60 ? '#2563eb' : '#f43f5e';

    const handleMonthChange = (value) => {
        setSelectedMonth(value);
        setPage(1);
    };

    const handleYearChange = (value) => {
        setSelectedYear(Number(value));
        setSelectedMonth('all');
        setPage(1);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <StudentPageHeader
                eyebrow="Attendance Tracking"
                title="මගේ පැමිණීම"
                description="මාසික සහ වාර්ෂික පන්ති පැමිණීමේ වාර්තාව."
            >
                <div className="grid w-full grid-cols-[106px_1fr] gap-2 sm:flex sm:w-auto sm:items-center">
                    <div className="flex items-center justify-between gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-2 sm:px-3 sm:py-1.5 shadow-xs">
                        <span className="text-[11px] sm:text-xs font-semibold text-slate-500">Year:</span>
                        <select
                            aria-label="Select academic year"
                            value={selectedYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="border-none bg-transparent py-0 pr-0.5 text-xs sm:text-sm font-extrabold text-slate-900 outline-none focus:ring-0 cursor-pointer"
                        >
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2.5 py-2 sm:px-3 sm:py-1.5 shadow-xs">
                        <span className="shrink-0 text-[11px] sm:text-xs font-semibold text-slate-500">Month:</span>
                        <select
                            aria-label="Select month"
                            value={selectedMonth}
                            onChange={(e) => handleMonthChange(e.target.value)}
                            className="w-full min-w-0 truncate border-none bg-transparent py-0 pr-1 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:ring-0 cursor-pointer"
                        >
                            {MONTH_OPTIONS.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </StudentPageHeader>

            {/* Optional class switcher ONLY if enrolled in more than 1 class */}
            {data && hasMultipleClasses && (
                <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedClass('all');
                            setPage(1);
                        }}
                        className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition ${
                            selectedClass === 'all'
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        සියලුම පන්ති · All Classes
                    </button>
                    {enrolledClasses.map((classItem) => {
                        const active = String(classItem._id) === String(selectedClass);
                        return (
                            <button
                                key={classItem._id}
                                type="button"
                                onClick={() => {
                                    setSelectedClass(classItem._id);
                                    setPage(1);
                                }}
                                className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition ${
                                    active
                                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {classItem.className}
                            </button>
                        );
                    })}
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-xs font-semibold">
                    {error}
                </div>
            )}
            {!data && !error && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-xs font-medium">
                    Loading attendance records...
                </div>
            )}

            {data && (
                <>
                    {/* ── 1. Summary Overview Card ── */}
                    <section className="app-card p-4 sm:p-6 border border-slate-200 bg-white">
                        <div className="mb-4 sm:mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold leading-snug text-slate-900">
                                    පැමිණීමේ සාරාංශය · {formatPeriodTitle(selectedYear, selectedMonth)}
                                </h2>
                                <p className="text-xs font-semibold text-blue-700">
                                    {enrolledClasses.length === 1
                                        ? enrolledClasses[0].className
                                        : 'Attendance Summary'}
                                </p>
                            </div>
                        </div>

                        {totalSessions === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-7 sm:px-6 sm:py-8 text-center">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 text-lg font-bold">
                                    📅
                                </div>
                                <div>
                                    <p className="text-sm sm:text-base font-bold text-slate-800">
                                        මෙම කාලසීමාව තුළ පන්ති පැමිණීම සටහන් වී නැත
                                    </p>
                                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                                        වෙනත් මාසයක් බැලීමට ඉහළ <span className="font-semibold text-slate-700">Month</span> මෙනුවෙන් තෝරන්න.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                {/* Clean Spacious Progress Ring */}
                                <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0">
                                    <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={RING_RADIUS}
                                            fill="none"
                                            stroke="#e2e8f0"
                                            strokeWidth="10"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={RING_RADIUS}
                                            fill="none"
                                            stroke={ringStrokeColor}
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={RING_CIRCUMFERENCE}
                                            strokeDashoffset={RING_CIRCUMFERENCE * (1 - attendanceRate / 100)}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 leading-none">
                                            {attendanceRate}%
                                        </span>
                                        <span className="mt-1 text-[11px] font-semibold text-slate-500">
                                            පැමිණීම
                                        </span>
                                    </div>
                                </div>

                                {/* 3 Compact Side-by-Side Summary Tiles (3-col on mobile AND desktop) */}
                                <div className="grid w-full flex-1 grid-cols-3 gap-2 sm:gap-3">
                                    <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-3 sm:p-4 text-center">
                                        <p className="text-xl sm:text-3xl font-black text-slate-900 leading-none">
                                            {totalSessions}
                                        </p>
                                        <p className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-700 leading-tight">
                                            මුළු දින
                                        </p>
                                        <p className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                                            Total Days
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 px-2 py-3 sm:p-4 text-center">
                                        <p className="text-xl sm:text-3xl font-black text-emerald-700 leading-none">
                                            {presentCount}
                                        </p>
                                        <p className="mt-1.5 text-[11px] sm:text-xs font-bold text-emerald-800 leading-tight">
                                            පැමිණි
                                        </p>
                                        <p className="text-[10px] sm:text-[11px] font-medium text-emerald-700/80">
                                            Present
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-rose-50/80 border border-rose-200 px-2 py-3 sm:p-4 text-center">
                                        <p className="text-xl sm:text-3xl font-black text-rose-700 leading-none">
                                            {absentCount}
                                        </p>
                                        <p className="mt-1.5 text-[11px] sm:text-xs font-bold text-rose-800 leading-tight">
                                            නොපැමිණි
                                        </p>
                                        <p className="text-[10px] sm:text-[11px] font-medium text-rose-700/80">
                                            Absent
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ── 2. Direct Session List (Only rendered when there are sessions, zero duplicate headers) ── */}
                    {totalSessions > 0 && (
                        <section className="app-card p-4 sm:p-6 space-y-3.5 sm:space-y-4 border border-slate-200 bg-white">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold leading-snug text-slate-900">
                                        පන්ති පැවැත්වූ දිනයන්
                                    </h2>
                                    <p className="text-xs font-semibold text-blue-700">
                                        Class Session Log
                                    </p>
                                </div>
                                {totalPages > 1 && (
                                    <span className="text-xs font-semibold text-slate-500">
                                        Page {safePage} of {totalPages}
                                    </span>
                                )}
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-xs">
                                {visibleRecords.map((record) => {
                                    const recordDate = new Date(record.date);
                                    const isPresent = record.status === 'Present';
                                    const classTitle =
                                        record.assignedClass?.className ||
                                        enrolledClasses[0]?.className ||
                                        'Mathematics';
                                    const classLocation =
                                        record.assignedClass?.location ||
                                        enrolledClasses[0]?.location ||
                                        '';

                                    return (
                                        <div
                                            key={record._id}
                                            className="flex items-center justify-between gap-2.5 sm:gap-3.5 p-3 sm:p-4 hover:bg-slate-50/70 transition"
                                        >
                                            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
                                                <div
                                                    className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 flex-col items-center justify-center rounded-xl border ${
                                                        isPresent
                                                            ? 'border-blue-100 bg-blue-50/80 text-blue-700'
                                                            : 'border-rose-100 bg-rose-50/70 text-rose-700'
                                                    }`}
                                                >
                                                    <span className="text-[10px] font-bold uppercase leading-none">
                                                        {recordDate.toLocaleString('en-US', {
                                                            month: 'short',
                                                        })}
                                                    </span>
                                                    <span className="mt-0.5 text-base font-black leading-tight text-slate-900">
                                                        {recordDate.getDate()}
                                                    </span>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 leading-tight">
                                                        {recordDate.toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                        })}
                                                    </p>
                                                    <p className="mt-0.5 text-xs font-medium text-slate-600 leading-snug">
                                                        {classTitle}
                                                        {classLocation ? (
                                                            <span className="text-slate-400"> · {classLocation}</span>
                                                        ) : null}
                                                    </p>
                                                    {record.note && (
                                                        <p className="mt-0.5 text-xs font-medium text-blue-700">
                                                            සටහන: {record.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full border px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold ${
                                                    isPresent
                                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                        : 'border-rose-200 bg-rose-50 text-rose-700'
                                                }`}
                                            >
                                                {isPresent ? '✓ Present' : '✕ Absent'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Compact Pagination (only appears when All Months has > 6 sessions) */}
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
                                        දිනයන් {(safePage - 1) * PAGE_SIZE + 1}–
                                        {Math.min(safePage * PAGE_SIZE, totalSessions)} / {totalSessions}
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
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentAttendance;
