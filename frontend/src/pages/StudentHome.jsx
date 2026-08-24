import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StudentPageHeader from '../components/StudentPageHeader';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const StudentHome = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response = await api.get('/student-portal/dashboard');
                setData(response.data.data);
            } catch (requestError) {
                setError(requestError.response?.data?.error || 'Failed to load dashboard');
            }
        };
        loadDashboard();
    }, []);

    if (error) return <div className="app-card border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;
    if (!data) return <div className="app-card p-10 text-center text-slate-500">Loading your dashboard...</div>;

    const primaryRating = data.ratings[0];
    const latestResult = data.latestResults[0];

    return (
        <div className="animate-fade-in space-y-6">
            <StudentPageHeader title={`Welcome, ${data.student.fullName}`} description={`Student ID: ${data.student.studentId} · Grade: ${data.student.grade} · Academic Year: ${data.student.academicYear}`}>
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">Active</div>
            </StudentPageHeader>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                <section className="app-card p-5 lg:col-span-2 sm:p-6">
                    <p className="text-sm font-bold text-blue-700">ඔබේ ප්‍රගතිය · Your Performance</p>
                    {primaryRating ? (
                        <>
                            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                                <div className="flex items-baseline gap-2">
                                    <p className="text-5xl font-bold tracking-tight text-blue-600">{primaryRating.overallRating}</p>
                                    <p className="text-2xl font-bold text-blue-600">{primaryRating.ratingGrade}</p>
                                </div>
                                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${primaryRating.change >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    {primaryRating.change >= 0 ? '+' : ''}{primaryRating.change} since last exam
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">{primaryRating.ratingStatus} · {primaryRating.subject}</p>
                            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {[
                                    ['Recent', primaryRating.components?.recentPerformance],
                                    ['Position', primaryRating.components?.gradePosition],
                                    ['Improvement', primaryRating.components?.improvement],
                                    ['Consistency', primaryRating.components?.consistency],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                                        <p className="text-xs font-medium text-slate-500">{label}</p>
                                        <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="py-8">
                            <p className="text-xl font-bold text-slate-900">Rating not available yet</p>
                            <p className="mt-2 text-sm text-slate-500">Your rating will appear after the first exam is published.</p>
                        </div>
                    )}
                </section>

                <section className="app-card p-5">
                    <p className="text-base font-bold text-slate-700">පැමිණීම · Attendance</p>
                    <p className="mt-2 text-4xl font-bold text-blue-600">{data.attendance.attendanceRate}%</p>
                    <p className="mt-1 text-sm text-slate-500">{data.attendance.totalEligibleSessions} completed sessions</p>
                    <div className="mt-5 grid grid-cols-2 gap-2 text-center">
                        <div className="rounded-xl bg-emerald-50 p-3">
                            <p className="text-xl font-bold text-emerald-700">{data.attendance.counts.Present}</p>
                            <p className="text-xs font-medium text-slate-500">Present</p>
                        </div>
                        <div className="rounded-xl bg-red-50 p-3">
                            <p className="text-xl font-bold text-red-700">{data.attendance.counts.Absent}</p>
                            <p className="text-xs font-medium text-slate-500">Absent</p>
                        </div>
                    </div>
                    <Link to="/student/attendance" className="mt-4 block text-center text-sm font-bold text-blue-600">View attendance</Link>
                </section>

                <section className="app-card p-5">
                    <p className="text-base font-bold text-slate-700">ගෙවීම් · Fees To Pay</p>
                    <p className={`mt-2 text-3xl font-bold ${data.fees.outstanding > 0 ? 'text-red-700' : 'text-emerald-700'}`}>{money(data.fees.outstanding)}</p>
                    <p className="mt-1 text-xs text-slate-500">{data.fees.counts.Unpaid} unpaid | {data.fees.counts.Waived} free/waived</p>
                    <div className="mt-5 rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">Paid this academic year</p>
                        <p className="font-bold text-slate-900">{money(data.fees.paid)}</p>
                    </div>
                    <Link to="/student/fees" className="mt-4 block text-center text-sm font-bold text-blue-600">View fees</Link>
                </section>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section className="app-card p-5">
                    <div className="flex items-center justify-between">
                        <h2 className="student-section-heading">නවතම ප්‍රතිඵලය · Latest Result</h2>
                        <Link to="/student/results" className="text-sm font-semibold text-blue-600">All Results</Link>
                    </div>
                    {latestResult ? (
                        <div className="mt-4">
                            <p className="font-bold text-slate-900">{latestResult.exam?.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{latestResult.exam?.type} | {latestResult.exam?.subject} | {new Date(latestResult.exam?.examDate).toLocaleDateString()}</p>
                            {latestResult.resultStatus === 'Completed' ? (
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    <div className="rounded-xl bg-blue-50 p-3"><p className="text-xs text-blue-600">Marks</p><p className="font-bold text-blue-900">{latestResult.marksObtained}/{latestResult.exam?.totalMarks}</p></div>
                                    <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Rank</p><p className="font-bold text-slate-900">{latestResult.gradeRank}/{latestResult.cohortSize}</p></div>
                                    <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">Rating</p><p className="font-bold text-slate-900">{latestResult.overallRating}</p></div>
                                </div>
                            ) : <p className="mt-4 text-sm font-semibold text-slate-500">{latestResult.resultStatus}</p>}
                        </div>
                    ) : <p className="mt-4 text-sm text-slate-500">No published results yet.</p>}
                </section>

                <section className="app-card p-5">
                    <h2 className="student-section-heading">මගේ පන්ති · My Classes</h2>
                    <div className="mt-4 space-y-2">
                        {data.classes.length ? data.classes.map((classItem) => (
                            <div key={classItem._id} className="rounded-xl border border-slate-200 p-3">
                                <p className="font-semibold text-slate-900">{classItem.className}</p>
                                <p className="text-xs text-slate-500">{classItem.subject} | {classItem.location || 'Location not set'} | {classItem.day}</p>
                            </div>
                        )) : <p className="text-sm text-slate-500">No active classes.</p>}
                    </div>
                </section>
            </div>

            <section className="app-card p-5">
                <h2 className="student-section-heading">දැනුම්දීම් · Latest Announcements</h2>
                <div className="mt-4 space-y-3">
                    {data.announcements.length ? data.announcements.map((announcement) => (
                        <div key={announcement._id} className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                            <p className="font-semibold text-slate-900">{announcement.title}</p>
                            <p className="mt-1 text-sm text-slate-600">{announcement.message}</p>
                            <p className="mt-2 text-xs text-slate-500">{announcement.targetClass?.className || 'All classes'} | {new Date(announcement.createdAt).toLocaleDateString()}</p>
                        </div>
                    )) : <p className="text-sm text-slate-500">No announcements.</p>}
                </div>
            </section>
        </div>
    );
};

export default StudentHome;
