import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StudentPageHeader from '../components/StudentPageHeader';
import TeacherHeroBanner from '../components/TeacherHeroBanner';
import Icon from '../components/Icon';

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

    if (error) return <div className="app-card border-rose-200 bg-rose-50 p-5 text-rose-700 text-sm font-semibold rounded-2xl">{error}</div>;
    if (!data) return <div className="app-card p-12 text-center text-slate-500 text-sm font-medium">Loading your student dashboard...</div>;

    const primaryRating = data.ratings[0];
    const latestResult = data.latestResults[0];

    return (
        <div className="animate-fade-in space-y-6">
            <TeacherHeroBanner />
            <StudentPageHeader
                eyebrow="Student Overview"
                title={`Welcome, ${data.student.fullName}`}
                description={`Student ID: ${data.student.studentId} · Grade ${data.student.grade} · Academic Year ${data.student.academicYear}`}
            >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Student
                </span>
            </StudentPageHeader>

            {/* Latest Notice Alert Banner (Only shown if announcements exist) */}
            {data.announcements && data.announcements.length > 0 && (
                <div className="flex items-start gap-3.5 rounded-2xl border border-blue-200/90 bg-blue-50/70 p-4 shadow-xs">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs mt-0.5">
                        <Icon name="announce" size={17} />
                    </span>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                                අලුත්ම නිවේදනය · {data.announcements[0].targetClass?.className || 'සියලුම පන්ති (All Classes)'}
                            </span>
                            <span className="text-[11px] font-mono font-semibold text-slate-500">
                                {new Date(data.announcements[0].createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base mt-0.5">
                            {data.announcements[0].title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                            {data.announcements[0].message}
                        </p>
                    </div>
                </div>
            )}

            {/* Next Scheduled Session Highlight */}
            {data.classes && data.classes.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-4 sm:p-5 text-white shadow-md">
                    <div className="flex items-center gap-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold backdrop-blur-xs border border-white/15">
                            📅
                        </span>
                        <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-300">
                                මීළඟ පන්තිය · Next Scheduled Session
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                                {data.classes[0].className}
                            </h3>
                            <p className="text-xs text-blue-200/90 font-medium mt-0.5">
                                {data.classes[0].day}s · {data.classes[0].startTime} - {data.classes[0].endTime} · {data.classes[0].location || 'Main Hall / Online'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Active Batch
                        </span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
                {/* 1. Performance / Rating */}
                <section className="app-card p-5 lg:col-span-2 sm:p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">ඔබේ ප්‍රගතිය</h2>
                                <p className="text-xs font-bold text-blue-700">Performance & Rating</p>
                            </div>
                            {primaryRating && (
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${primaryRating.change >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                    {primaryRating.change >= 0 ? '+' : ''}{primaryRating.change} since last test
                                </span>
                            )}
                        </div>

                        {primaryRating ? (
                            <>
                                <div className="mt-4 flex flex-wrap items-baseline gap-3">
                                    <p className="text-5xl font-extrabold tracking-tight text-blue-600">{primaryRating.overallRating}</p>
                                    <p className="text-2xl font-bold text-slate-800">Grade {primaryRating.ratingGrade}</p>
                                </div>
                                <p className="mt-1 text-sm font-semibold text-slate-600">{primaryRating.ratingStatus} · {primaryRating.subject}</p>
                                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                    {[
                                        ['Recent', primaryRating.components?.recentPerformance],
                                        ['Position', primaryRating.components?.gradePosition],
                                        ['Improvement', primaryRating.components?.improvement],
                                        ['Consistency', primaryRating.components?.consistency],
                                    ].map(([label, value]) => (
                                        <div key={label} className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                                            <p className="text-xs font-semibold text-slate-500">{label}</p>
                                            <p className="mt-0.5 text-lg font-extrabold text-slate-900">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="py-7 text-center flex flex-col items-center justify-center">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-2xl font-bold mb-3 shadow-xs">
                                    ★
                                </div>
                                <p className="text-base font-extrabold text-slate-900">තවම Rating එකක් සකස් කර නැත</p>
                                <p className="mt-1 text-sm font-medium text-slate-500 max-w-sm">පළමු විභාගයේ ප්‍රතිඵල නිකුත් වූ පසු ඔබගේ ලකුණු සහ ප්‍රගතිය මෙහි සටහන් වේ.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. Attendance */}
                <section className="app-card p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">පැමිණීම</h2>
                            <p className="text-xs font-bold text-blue-700">Attendance Summary</p>
                        </div>
                        <div className="mt-4 flex items-baseline justify-between">
                            <p className="text-4xl sm:text-5xl font-black text-slate-900">{data.attendance.attendanceRate}%</p>
                            <span className="text-sm font-bold text-slate-600">{data.attendance.totalEligibleSessions} sessions</span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2.5 text-center">
                            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                                <p className="text-xl sm:text-2xl font-black text-emerald-800">{data.attendance.counts.Present}</p>
                                <p className="text-xs font-bold text-emerald-700 mt-0.5">Present (පැමිණි)</p>
                            </div>
                            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3">
                                <p className="text-xl sm:text-2xl font-black text-rose-800">{data.attendance.counts.Absent}</p>
                                <p className="text-xs font-bold text-rose-700 mt-0.5">Absent (නොපැමිණි)</p>
                            </div>
                        </div>
                    </div>
                    <Link to="/student/attendance" className="mt-4 block text-center text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline pt-2 border-t border-slate-100">
                        View attendance details →
                    </Link>
                </section>

                {/* 3. Fees */}
                <section className="app-card p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">පන්ති ගාස්තු</h2>
                            <p className="text-xs font-bold text-blue-700">Fees Status</p>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ගෙවීමට ඇති මුදල (Due):</p>
                            <p className={`mt-0.5 text-3xl sm:text-4xl font-black ${data.fees.outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {money(data.fees.outstanding)}
                            </p>
                        </div>
                        <div className="mt-3.5 rounded-xl bg-slate-50 border border-slate-200 p-3">
                            <p className="text-xs font-semibold text-slate-500">Paid this academic year</p>
                            <p className="text-base font-extrabold text-slate-900 mt-0.5">{money(data.fees.paid)}</p>
                        </div>
                    </div>
                    <Link to="/student/fees" className="mt-4 block text-center text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline pt-2 border-t border-slate-100">
                        View fees history →
                    </Link>
                </section>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* 4. Latest Result */}
                <section className="app-card p-5 sm:p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">නවතම ප්‍රතිඵලය</h2>
                            <p className="text-xs font-bold text-blue-700">Latest Examination Result</p>
                        </div>
                        <Link to="/student/results" className="text-sm font-bold text-blue-600 hover:text-blue-800">All Results →</Link>
                    </div>
                    {latestResult ? (
                        <div className="mt-4">
                            <p className="font-extrabold text-slate-900 text-lg">{latestResult.exam?.name}</p>
                            <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600">{latestResult.exam?.type} · {latestResult.exam?.subject} · {new Date(latestResult.exam?.examDate).toLocaleDateString()}</p>
                            {latestResult.resultStatus === 'Completed' ? (
                                <div className="mt-3.5 grid grid-cols-3 gap-2.5">
                                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center">
                                        <p className="text-xs font-bold text-blue-700">Marks</p>
                                        <p className="font-extrabold text-slate-900 text-base mt-0.5">{latestResult.marksObtained}/{latestResult.exam?.totalMarks}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                                        <p className="text-xs font-bold text-slate-600">Rank</p>
                                        <p className="font-extrabold text-slate-900 text-base mt-0.5">{latestResult.gradeRank}/{latestResult.cohortSize}</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                                        <p className="text-xs font-bold text-slate-600">Rating</p>
                                        <p className="font-extrabold text-slate-900 text-base mt-0.5">{latestResult.overallRating}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm font-semibold text-slate-600">{latestResult.resultStatus}</p>
                            )}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm font-medium text-slate-500">තවම විභාග ප්‍රතිඵල නිකුත් කර නැත (No published results yet).</p>
                    )}
                </section>

                {/* 5. My Classes */}
                <section className="app-card p-5 sm:p-6">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">මගේ පන්ති</h2>
                        <p className="text-xs font-bold text-blue-700">Enrolled Batches</p>
                    </div>
                    <div className="mt-4 space-y-3">
                        {data.classes.length ? data.classes.map((classItem) => (
                            <div key={classItem._id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 hover:bg-blue-50/50 hover:border-blue-300 transition">
                                <p className="font-extrabold text-sm sm:text-base text-slate-900">{classItem.className}</p>
                                <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">{classItem.subject} · {classItem.location || 'Location not set'} · {classItem.day}s</p>
                            </div>
                        )) : (
                            <p className="text-sm font-medium text-slate-500">No active classes enrolled.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default StudentHome;
