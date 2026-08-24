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
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';

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
        {!data && !error && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Loading attendance...</div>}

        {data && <>
            <section className="app-card p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div><h2 className="student-section-heading">මේ මාසය · This Month</h2><p className="student-section-copy">{monthLabel(currentMonth)} · {currentRecords.length} sessions</p></div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">All classes</span>
                </div>
                <div className="flex items-center gap-5">
                    <div className="relative h-28 w-28 shrink-0">
                        <svg className="h-28 w-28 -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
                            <circle cx="56" cy="56" r="44" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                            <circle cx="56" cy="56" r="44" fill="none" stroke="#2563eb" strokeWidth="10" strokeLinecap="round" strokeDasharray="276.5" strokeDashoffset={276.5 * (1 - currentRate / 100)} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold text-slate-900">{currentRate}%</span><span className="text-[10px] font-medium text-slate-500">Attendance</span></div>
                    </div>
                    <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><p className="text-xs font-medium">Present</p><p className="mt-1 text-2xl font-bold">{currentPresent}</p></div>
                        <div className="rounded-xl bg-rose-50 p-3 text-rose-700"><p className="text-xs font-medium">Absent</p><p className="mt-1 text-2xl font-bold">{currentAbsent}</p></div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div><h2 className="student-section-heading student-section-heading--on-dark">පැමිණීමේ ඉතිහාසය · Attendance History</h2><p className="student-section-copy">Select a class to view its records.</p></div>

                <div className="grid grid-cols-2 gap-2" aria-label={activeClass ? `Classes. Selected ${activeClass.className}` : 'Classes'}>
                    {data.enrolledClasses.map((classItem) => {
                        const active = String(classItem._id) === String(activeClassId);
                        return <button key={classItem._id} onClick={() => setSelectedClass(classItem._id)} className={`w-full rounded-xl border px-3 py-3 text-left transition ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}><p className="text-sm font-semibold leading-snug">{classItem.className}</p><p className={`mt-1 text-xs ${active ? 'text-blue-100' : 'text-slate-500'}`}>{classItem.location || `Grade ${classItem.grade}`}</p><p className={`mt-1 text-xs ${active ? 'text-blue-100' : 'text-slate-500'}`}>{classItem.day}{classItem.startTime ? ` · ${classItem.startTime}` : ''}</p></button>;
                    })}
                </div>

                <div className="space-y-4">
                    {monthKeys.map((month) => {
                        const records = recordsByMonth[month] || [];
                        const present = records.filter((record) => record.status === 'Present').length;
                        return <section key={month}>
                            <div className="mb-2 flex items-center justify-between px-1"><h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{monthLabel(month)}</h3>{records.length > 0 && <span className="text-xs font-normal text-slate-500">{present}/{records.length} present</span>}</div>
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.025)]">
                                {records.length ? <div className="divide-y divide-slate-100">{records.sort((a, b) => new Date(b.date) - new Date(a.date)).map((record) => {
                                    const recordDate = new Date(record.date);
                                    return <div key={record._id} className="flex items-center justify-between gap-3 p-4"><div className="flex min-w-0 items-center gap-3"><div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100"><span className="text-[10px] font-semibold uppercase text-slate-500">{recordDate.toLocaleString('en', { month: 'short' })}</span><span className="text-lg font-bold leading-5 text-slate-900">{recordDate.getDate()}</span></div><div className="min-w-0"><p className="font-semibold text-slate-800">{recordDate.toLocaleDateString('en', { weekday: 'long' })}</p><p className="text-xs text-slate-500">Scheduled class</p>{record.note && <p className="mt-1 text-xs text-slate-500">{record.note}</p>}</div></div><span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(record.status)}`}>{record.status}</span></div>;
                                })}</div> : <div className="p-6 text-center text-sm text-slate-500">No completed classes recorded this month.</div>}
                            </div>
                        </section>;
                    })}
                </div>
                {!data.enrolledClasses.length && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">You are not enrolled in an active class.</div>}
            </section>
        </>}
    </div>;
};

export default StudentAttendance;
