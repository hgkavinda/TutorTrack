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
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-rose-50 text-rose-700 border-rose-200';

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
        <StudentPageHeader eyebrow="Attendance Tracking" title="මගේ පැමිණීම" description="මාසික පන්ති පැමිණීමේ වාර්තාව සහ ඉතිහාසය." />

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-xs font-semibold">{error}</div>}
        {!data && !error && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-xs font-medium">Loading attendance records...</div>}

        {data && <>
            {/* ── This Month summary card ── */}
            <section className="app-card p-5 sm:p-6 border border-slate-200 bg-white">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">මේ මාසය</h2>
                        <p className="text-xs sm:text-sm font-semibold text-blue-700">
                            {monthLabel(currentMonth)}{hasSessions ? ` · ${currentRecords.length} sessions` : ''}
                        </p>
                    </div>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">All Batches</span>
                </div>

                {/* Empty state — no sessions yet */}
                {!hasSessions ? (
                    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-lg font-bold">
                            📅
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">No classes recorded yet this month</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                                Your attendance will appear here once the first {monthLabel(currentMonth)} session is marked.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Progress ring + counts */
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative h-28 w-28 shrink-0">
                            <svg className="h-28 w-28 -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
                                <circle cx="56" cy="56" r="44" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                                <circle cx="56" cy="56" r="44" fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" strokeDasharray="276.5" strokeDashoffset={276.5 * (1 - currentRate / 100)} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-extrabold text-slate-900">{currentRate}%</span>
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Attendance</span>
                            </div>
                        </div>
                        <div className="grid w-full sm:w-auto flex-1 grid-cols-2 gap-3">
                            <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-center">
                                <p className="text-xs font-semibold text-emerald-700">Present (පැමිණි)</p>
                                <p className="mt-1 text-2xl font-extrabold text-slate-900">{currentPresent}</p>
                            </div>
                            <div className="rounded-xl bg-rose-50 border border-rose-200/80 p-3.5 text-center">
                                <p className="text-xs font-semibold text-rose-700">Absent (නොපැමිණි)</p>
                                <p className="mt-1 text-2xl font-extrabold text-slate-900">{currentAbsent}</p>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* ── Attendance History ── */}
            <section className="app-card p-5 sm:p-6 space-y-4 border border-slate-200 bg-white">
                <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">පැමිණීමේ ඉතිහාසය</h2>
                    <p className="text-xs sm:text-sm font-semibold text-blue-700">Select a class to view its session records</p>
                </div>

                {/* Class selector cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.enrolledClasses.map((classItem) => {
                        const active = String(classItem._id) === String(activeClassId);
                        return (
                            <button
                                key={classItem._id}
                                onClick={() => setSelectedClass(classItem._id)}
                                className={`group w-full rounded-xl border p-3.5 text-left transition-all ${
                                    active
                                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                                        : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-blue-200 hover:bg-slate-100'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold leading-snug">{classItem.className}</p>
                                        <p className={`mt-0.5 text-xs ${active ? 'text-blue-700 font-semibold' : 'text-slate-600'}`}>
                                            {classItem.location || `Grade ${classItem.grade}`} · {classItem.day}
                                        </p>
                                    </div>
                                    <span className={`text-lg font-bold ${active ? 'text-blue-600' : 'text-slate-400'}`}>›</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Month-by-month records */}
                <div className="space-y-4 pt-2">
                    {monthKeys.map((month) => {
                        const records = recordsByMonth[month] || [];
                        const present = records.filter((record) => record.status === 'Present').length;
                        return (
                            <div key={month} className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{monthLabel(month)}</h3>
                                    {records.length > 0 && (
                                        <span className="text-xs font-semibold text-slate-600">{present}/{records.length} attended</span>
                                    )}
                                </div>

                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                                    {records.length ? (
                                        <div className="divide-y divide-slate-100">
                                            {records.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record) => {
                                                const recordDate = new Date(record.date);
                                                return (
                                                    <div key={record._id} className="flex items-center justify-between gap-3 p-3.5">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border border-blue-100 bg-blue-50/70">
                                                                <span className="text-[10px] font-bold uppercase text-blue-700">{recordDate.toLocaleString('en', { month: 'short' })}</span>
                                                                <span className="text-base font-extrabold leading-tight text-slate-900">{recordDate.getDate()}</span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-xs text-slate-900">{recordDate.toLocaleDateString('en', { weekday: 'long' })}</p>
                                                                <p className="text-[11px] text-slate-500">Regular Class Session</p>
                                                                {record.note && <p className="mt-0.5 text-xs text-slate-600">{record.note}</p>}
                                                            </div>
                                                        </div>
                                                        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${statusClass(record.status)}`}>
                                                            {record.status}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-5 text-center text-xs text-slate-500">
                                            No recorded classes for this month.
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {!data.enrolledClasses.length && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 text-xs">
                        You are not enrolled in an active class.
                    </div>
                )}
            </section>
        </>}
    </div>;
};

export default StudentAttendance;
