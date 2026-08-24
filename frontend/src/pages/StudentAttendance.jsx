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
        <StudentPageHeader eyebrow="ඉගෙනුම් වාර්තාව" title="මගේ පැමිණීම · My Attendance" description="ඔබේ පැමිණීමේ සාරාංශය සහ පන්ති ඉතිහාසය." />

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
        {!data && !error && <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center text-slate-400">Loading attendance...</div>}

        {data && <>
            <section className="app-card p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div><h2 className="student-section-heading">මේ මාසය · This Month</h2><p className="student-section-copy">{monthLabel(currentMonth)} · {currentRecords.length} sessions</p></div>
                    <span className="rounded-full bg-white/10 border border-white/5 px-3 py-1 text-xs font-semibold text-slate-300">All classes</span>
                </div>
                <div className="flex items-center gap-5">
                    <div className="relative h-28 w-28 shrink-0">
                        <svg className="h-28 w-28 -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
                            <circle cx="56" cy="56" r="44" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="10" />
                            <circle cx="56" cy="56" r="44" fill="none" stroke="#22d3ee" strokeWidth="10" strokeLinecap="round" strokeDasharray="276.5" strokeDashoffset={276.5 * (1 - currentRate / 100)} className="drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-extrabold text-white">{currentRate}%</span><span className="text-[10px] font-medium text-slate-400">Attendance</span></div>
                    </div>
                    <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/15 p-3 text-emerald-300"><p className="text-xs font-medium">Present</p><p className="mt-1 text-2xl font-extrabold text-white">{currentPresent}</p></div>
                        <div className="rounded-xl bg-rose-500/10 border border-rose-500/15 p-3 text-rose-300"><p className="text-xs font-medium">Absent</p><p className="mt-1 text-2xl font-extrabold text-white">{currentAbsent}</p></div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div><h2 className="student-section-heading student-section-heading--on-dark">පැමිණීමේ ඉතිහාසය · Attendance History</h2><p className="student-section-copy">Select a class to view its records.</p></div>

                <div className="grid grid-cols-2 gap-2" aria-label={activeClass ? `Classes. Selected ${activeClass.className}` : 'Classes'}>
                    {data.enrolledClasses.map((classItem) => {
                        const active = String(classItem._id) === String(activeClassId);
                        return <button key={classItem._id} onClick={() => setSelectedClass(classItem._id)} className={`w-full rounded-xl border px-3 py-3 text-left transition ${active ? 'border-cyan-500 bg-cyan-500/20 text-white' : 'border-white/10 bg-white/5 text-slate-300'}`}><p className="text-sm font-semibold leading-snug">{classItem.className}</p><p className={`mt-1 text-xs ${active ? 'text-cyan-200' : 'text-slate-400'}`}>{classItem.location || `Grade ${classItem.grade}`}</p><p className={`mt-1 text-xs ${active ? 'text-cyan-200' : 'text-slate-400'}`}>{classItem.day}{classItem.startTime ? ` · ${classItem.startTime}` : ''}</p></button>;
                    })}
                </div>

                <div className="space-y-4">
                    {monthKeys.map((month) => {
                        const records = recordsByMonth[month] || [];
                        const present = records.filter((record) => record.status === 'Present').length;
                        return <section key={month}>
                            <div className="mb-2 flex items-center justify-between px-1"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{monthLabel(month)}</h3>{records.length > 0 && <span className="text-xs font-normal text-slate-400">{present}/{records.length} present</span>}</div>
                            <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5 divide-y divide-white/5 shadow-md">
                                {records.length ? <div className="divide-y divide-white/5">{records.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record) => {
                                    const recordDate = new Date(record.date);
                                    return <div key={record._id} className="flex items-center justify-between gap-3 p-4"><div className="flex min-w-0 items-center gap-3"><div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-white/5 bg-white/5"><span className="text-[10px] font-semibold uppercase text-slate-400">{recordDate.toLocaleString('en', { month: 'short' })}</span><span className="text-lg font-extrabold leading-5 text-white">{recordDate.getDate()}</span></div><div className="min-w-0"><p className="font-bold text-slate-100">{recordDate.toLocaleDateString('en', { weekday: 'long' })}</p><p className="text-xs text-slate-400">Scheduled class</p>{record.note && <p className="mt-1 text-xs text-slate-400">{record.note}</p>}</div></div><span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${statusClass(record.status)}`}>{record.status}</span></div>;
                                })}</div> : <div className="p-6 text-center text-sm text-slate-400">No completed classes recorded this month.</div>}
                            </div>
                        </section>;
                    })}
                </div>
                {!data.enrolledClasses.length && <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center text-slate-400">You are not enrolled in an active class.</div>}
            </section>
        </>}
    </div>;
};

export default StudentAttendance;
