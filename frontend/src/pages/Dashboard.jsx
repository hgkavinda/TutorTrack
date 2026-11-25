import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Icon from '../components/Icon';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const res = await api.get('/dashboard');
                setStats(res.data.data);
            } catch {
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (loading) {
        return <div className="app-card flex min-h-56 items-center justify-center text-blue-600">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="app-card border-red-200 bg-red-50 p-4 text-red-700">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="page-eyebrow">ගුරු මධ්‍යස්ථානය</p>
                <h1 className="page-title mt-1">සුබ දවසක්!</h1>
                <p className="page-copy mt-2">අද පන්ති සහ පාලන කටයුතු එකම තැනකින් කළමනාකරණය කරන්න.</p>
            </div>

            {/* Quick Actions (Unified Brand Theme) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    ['Mark Attendance', '/attendance', 'attendance'],
                    ['Collect Fees', '/fees', 'fees'],
                    ['Enter Marks', '/marks', 'marks'],
                    ['Add Student', '/students', 'students'],
                ].map(([label, path, icon]) => (
                    <Link
                        key={label}
                        to={path}
                        className="flex items-center gap-3 rounded-2xl bg-blue-600 p-4 text-white shadow-sm transition hover:bg-blue-700 active:scale-[.99]"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                            <Icon name={icon} size={19} />
                        </span>
                        <span className="text-sm font-bold">{label}</span>
                    </Link>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="app-card flex items-center gap-3 p-4 sm:p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon name="students" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500">මුළු සිසුන් (Students)</p>
                        <p className="text-2xl font-black text-slate-800">{stats?.totalStudents ?? 0}</p>
                    </div>
                </div>

                <div className="app-card flex items-center gap-3 p-4 sm:p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Icon name="classes" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500">සක්‍රීය පන්ති (Classes)</p>
                        <p className="text-2xl font-black text-slate-800">{stats?.totalClasses ?? 0}</p>
                    </div>
                </div>

                <div className="app-card flex items-center gap-3 p-4 sm:p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Icon name="fees" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500">මේ මස එකතු වූ මුදල්</p>
                        <p className="text-xl sm:text-2xl font-black text-emerald-700">
                            Rs. {(stats?.monthlyRevenue?.collected ?? 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="app-card flex items-center gap-3 p-4 sm:p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <Icon name="fees" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500">හිඟ ගාස්තු (Due Fees)</p>
                        <p className="text-xl sm:text-2xl font-black text-rose-700">
                            Rs. {(stats?.monthlyRevenue?.outstanding ?? 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Announcements & Today's Classes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Announcements */}
                <div className="app-card p-5 lg:col-span-2 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Recent Announcements</h2>
                        <Link to="/announcements" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All →</Link>
                    </div>
                    {!stats?.recentAnnouncements || stats.recentAnnouncements.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4">No recent announcements.</p>
                    ) : (
                        <div className="space-y-4">
                            {stats.recentAnnouncements.map((ann) => (
                                <div key={ann._id} className="border-l-4 border-blue-500 py-2 pl-4">
                                    <h3 className="font-semibold text-gray-800">{ann.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">{new Date(ann.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Today's Classes & Schedules */}
                <div className="app-card p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
                                {stats?.todaysClasses && stats.todaysClasses.length > 0 ? "අද පන්ති (Today's Classes)" : "ඉදිරි පන්ති (Upcoming Batches)"}
                            </h2>
                            <Link to="/classes" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                                All Classes →
                            </Link>
                        </div>
                        {stats?.todaysClasses && stats.todaysClasses.length > 0 ? (
                            <div className="space-y-3">
                                {stats.todaysClasses.map((cls) => (
                                    <div key={cls._id} className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-3.5">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">{cls.className}</h3>
                                            <p className="text-xs font-semibold text-blue-700 mt-0.5">{cls.startTime} - {cls.endTime} · {cls.location || 'Hall A'}</p>
                                        </div>
                                        <Link to={`/attendance?class=${cls._id}`} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700">
                                            Mark Attendance
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : stats?.upcomingClasses && stats.upcomingClasses.length > 0 ? (
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-slate-500 mb-2">අද දින පන්ති නොමැත. ඉදිරි පන්ති මෙන්න:</p>
                                {stats.upcomingClasses.map((cls) => (
                                    <div key={cls._id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm">{cls.className}</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">{cls.day} · {cls.startTime} - {cls.endTime}</p>
                                        </div>
                                        <Link to={`/attendance?class=${cls._id}`} className="rounded-lg bg-slate-200/80 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition">
                                            Attendance
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm py-6 text-center">තවම පන්ති සකස් කර නොමැත.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Students Table */}
            <div className="app-card overflow-hidden p-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Recently Added Students</h2>
                    <Link to="/students" className="text-sm text-blue-600 hover:text-blue-800 font-medium">Manage Students →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                <th className="px-4 py-3 font-medium rounded-tl-lg">ID</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Class</th>
                                <th className="px-4 py-3 font-medium">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {!stats?.recentStudents || stats.recentStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center text-gray-400 text-sm">No students found.</td>
                                </tr>
                            ) : (
                                stats.recentStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">{student.studentId}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{student.fullName}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {student.assignedClass?.className || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{new Date(student.joinedDate).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
