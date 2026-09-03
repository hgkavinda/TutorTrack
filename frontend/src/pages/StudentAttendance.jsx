import { useEffect, useState } from 'react';
import api from '../api/client';
import StudentPageHeader from '../components/StudentPageHeader';

const monthKey = (value) => {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
const monthLabel = (value) => {
    const [year, month] = value.split('-').map(Number);
    return new Date(year, month - 1).toLocaleString('en', { month: 'long', year: 'numeric' });
};
const statusClass = (status) => status === 'Present'
    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
    : 'bg-rose-500/10 text-rose-300 border border-rose-500/20';

const StudentAttendance = () => {
    const year = new Date().getFullYear();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [data, setData] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/student-portal/attendance?year=${year}`)
            .then((response) => { setError(''); setData(response.data.data); })
            .catch((requestError) => setError(requestError.response?.data?.error || 'Failed to load attendance'));
    }, [year]);

    const activeClassId = selectedClass || data?.enrolledClasses[0]?._id || '';
    const currentRecords = data?.history.filter((record) => monthKey(record.date) === currentMonth) || [];
    const currentPresent = currentRecords.filter((record) => record.status === 'Present').length;
    const currentAbsent = currentRecords.filter((record) => record.status === 'Absent').length;
    const currentRate = currentRecords.length ? Number(((currentPresent / currentRecords.length) * 100).toFixed(1)) : 0;
    const hasSessions = currentRecords.length > 0;

    const selectedRecords = data?.history.filter((record) => String(record.assignedClass?._id) === String(activeClassId)) || [];
    const recordsByMonth = selectedRecords.reduce((groups, record) => {
        const key = monthKey(record.date);
        if (!groups[key]) groups[key] = [];
        groups[key].push(record);
        return groups;
    }, {});
    const monthKeys = [...new Set([currentMonth, ...Object.keys(recordsByMonth)])].sort().reverse();
    const activeClass = data?.enrolledClasses.find((item) => String(item._id) === String(activeClassId));

    return <div className="animate-fade-in space-y-6">
        <StudentPageHeader  title="මගේ පැමිණීම - My Attendance " />

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {!data && !error && <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center text-slate-400">Loading attendance...</div>}

        {data && <>
            {/* ── This Month summary card ── */}
            <section className="app-card p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-cyan-400">මේ මාසය · This Month</h2>
                        <p className="student-section-copy mt-1">
                            {monthLabel(currentMonth)}{hasSessions ? ` · ${currentRecords.length} sessions` : ''}
                        </p>
                    </div>
                    <span className="rounded-full bg-white/10 border border-white/5 px-3 py-1 text-xs font-semibold text-slate-300">All classes</span>
                </div>

                {/* Empty state — no sessions yet */}
                {!hasSessions ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/3 px-6 py-8 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10">
                            <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-slate-300">No classes yet this month</p>
                            <p className="mt-1 text-sm text-slate-500">
                                Your attendance will show up here once your first {monthLabel(currentMonth)} class is marked.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Progress ring + counts */
                    <div className="flex items-center gap-5">
                        <div className="relative h-28 w-28 shrink-0">
                            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
                                <circle cx="56" cy="56" r="44" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="10" />
                                <circle cx="56" cy="56" r="44" fill="none" stroke="#22d3ee" strokeWidth="10" strokeLinecap="round" strokeDasharray="276.5" strokeDashoffset={276.5 * (1 - currentRate / 100)} className="drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-extrabold text-white">{currentRate}%</span>
                                <span className="text-[10px] font-medium text-slate-400">Attendance</span>
                            </div>
                        </div>
                        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/15 p-3 text-emerald-300">
                                <p className="text-xs font-medium">Present</p>
                                <p className="mt-1 text-2xl font-extrabold text-white">{currentPresent}</p>
                            </div>
                            <div className="rounded-xl bg-rose-500/10 border border-rose-500/15 p-3 text-rose-300">
                                <p className="text-xs font-medium">Absent</p>
                                <p className="mt-1 text-2xl font-extrabold text-white">{currentAbsent}</p>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* ── Attendance History ── */}
            <section className="app-card p-5 sm:p-6 space-y-5 mt-4">
                <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-cyan-400">පැමිණීමේ ඉතිහාසය · Attendance History</h2>
                    <p className="student-section-copy mt-1">Tap a class to view its records.</p>
                </div>

                {/* Class selector cards */}
                <div className="grid grid-cols-2 gap-2" aria-label={activeClass ? `Classes. Selected ${activeClass.className}` : 'Classes'}>
                    {data.enrolledClasses.map((classItem) => {
                        const active = String(classItem._id) === String(activeClassId);
                        return (
                            <button
                                key={classItem._id}
                                onClick={() => setSelectedClass(classItem._id)}
                                className={`group w-full rounded-xl border px-3 py-3 text-left transition-all ${
                                    active
                                        ? 'border-cyan-400/60 bg-cyan-500/15 shadow-[0_0_12px_rgba(6,182,212,0.15)] text-white'
                                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold leading-snug">{classItem.className}</p>
                                        <p className={`mt-1 text-xs ${active ? 'text-cyan-200' : 'text-slate-400'}`}>
                                            {classItem.location || `Grade ${classItem.grade}`}
                                        </p>
                                        <p className={`mt-0.5 text-xs ${active ? 'text-cyan-200' : 'text-slate-400'}`}>
                                            {classItem.day}{classItem.startTime ? ` · ${classItem.startTime}` : ''}
                                        </p>
                                    </div>
                                    {/* Chevron arrow */}
                                    <span className={`mt-0.5 shrink-0 text-base leading-none transition-transform ${active ? 'translate-x-0.5 text-cyan-300' : 'text-slate-600'}`}>›</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Month-by-month records */}
                <div className="space-y-1">
                    {monthKeys.map((month, index) => {
                        const records = recordsByMonth[month] || [];
                        const present = records.filter((record) => record.status === 'Present').length;
                        return (
                            <section key={month}>
                                {/* Visual divider between month groups (skip before the first) */}
                                {index > 0 && (
                                    <div className="my-4 flex items-center gap-3">
                                        <div className="h-px flex-1 bg-white/8" />
                                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">↑ {monthLabel(monthKeys[index - 1])}</span>
                                        <div className="h-px flex-1 bg-white/8" />
                                    </div>
                                )}

                                <div className="mb-2 flex items-center justify-between px-1">
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{monthLabel(month)}</h3>
                                    {records.length > 0 && (
                                        <span className="text-xs font-normal text-slate-400">{present}/{records.length} present</span>
                                    )}
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5 shadow-md">
                                    {records.length ? (
                                        <div className="divide-y divide-white/5">
                                            {records.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record) => {
                                                const recordDate = new Date(record.date);
                                                return (
                                                    <div key={record._id} className="flex items-center justify-between gap-3 p-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5">
                                                                <span className="text-[10px] font-semibold uppercase text-slate-400">{recordDate.toLocaleString('en', { month: 'short' })}</span>
                                                                <span className="text-lg font-extrabold leading-5 text-white">{recordDate.getDate()}</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-100">{recordDate.toLocaleDateString('en', { weekday: 'long' })}</p>
                                                                <p className="text-xs text-slate-400">Scheduled class</p>
                                                                {record.note && <p className="mt-1 text-xs text-slate-400">{record.note}</p>}
                                                            </div>
                                                        </div>
                                                        <span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${statusClass(record.status)}`}>
                                                            {record.status}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-sm text-slate-400">
                                            Your classes for this month haven't started yet.
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {!data.enrolledClasses.length && (
                    <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center text-slate-400">
                        You are not enrolled in an active class.
                    </div>
                )}
            </section>
        </>}
    </div>;
};

export default StudentAttendance;
