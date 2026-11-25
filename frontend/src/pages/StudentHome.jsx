import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StudentPageHeader from '../components/StudentPageHeader';
import TeacherHeroBanner from '../components/TeacherHeroBanner';
import Icon from '../components/Icon';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

const toSafeHref = (raw) => {
    if (!raw) return '#';
    const trimmed = String(raw).trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const getGradeMeta = (grade) => {
    if (grade === 'A') {
        return {
            label: 'විශිෂ්ට මට්ටම 🌟',
            pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300',
        };
    }
    if (grade === 'B') {
        return {
            label: 'ඉතා හොඳ මට්ටම',
            pillClass: 'bg-blue-50 text-blue-700 border-blue-200',
            badgeClass: 'bg-blue-50 text-blue-700 border-blue-300',
        };
    }
    if (grade === 'C') {
        return {
            label: 'හොඳ මට්ටම',
            pillClass: 'bg-amber-50 text-amber-800 border-amber-200',
            badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
        };
    }
    if (grade === 'S' || grade === 'D') {
        return {
            label: 'සාමාන්‍ය මට්ටම',
            pillClass: 'bg-orange-50 text-orange-800 border-orange-200',
            badgeClass: 'bg-orange-50 text-orange-800 border-orange-300',
        };
    }
    return {
        label: 'අවධානය යොමු කරන්න',
        pillClass: 'bg-rose-50 text-rose-700 border-rose-200',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-300',
    };
};

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

    if (error) {
        return (
            <div className="app-card border-rose-200 bg-rose-50 p-5 text-rose-700 text-sm font-semibold rounded-2xl">
                {error}
            </div>
        );
    }
    if (!data) {
        return (
            <div className="app-card p-12 text-center text-slate-500 text-sm font-medium">
                Loading your student dashboard...
            </div>
        );
    }

    const primaryRating = data.ratings?.[0];
    const latestResult = data.latestResults?.[0];
    const materials = data.materials || [];
    const gradeMeta = primaryRating ? getGradeMeta(primaryRating.ratingGrade) : null;
    const ratingDiff = Number(primaryRating?.change || 0);
    const avgScore = Math.round(primaryRating?.components?.recentPerformance ?? primaryRating?.overallRating ?? 0);

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

            {/* ROW 1: Core Student KPIs (Rating, Attendance, Fees) */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
                {/* 1. Performance / Rating */}
                <section className="app-card p-5 lg:col-span-2 sm:p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">ඔබේ ප්‍රගතිය</h2>
                                <p className="text-xs font-bold text-blue-700">Performance & Rating</p>
                            </div>
                            {primaryRating && gradeMeta && (
                                <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${gradeMeta.pillClass}`}>
                                    {gradeMeta.label}
                                </span>
                            )}
                        </div>

                        {primaryRating && gradeMeta ? (
                            <>
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-4xl sm:text-5xl font-black tracking-tight text-blue-600">
                                                {primaryRating.overallRating}
                                            </p>
                                            <span className="text-sm font-bold text-slate-400">/ 100</span>
                                        </div>
                                        <span className={`inline-flex items-center justify-center rounded-xl border px-3 py-1 text-base sm:text-lg font-black shadow-2xs ${gradeMeta.badgeClass}`}>
                                            Grade {primaryRating.ratingGrade}
                                        </span>
                                    </div>
                                    <span className="text-xs sm:text-sm font-bold text-slate-500">
                                        {primaryRating.subject}
                                    </span>
                                </div>

                                {/* Kid-Friendly Grade Scale Bar (F -> S -> C -> B -> A) */}
                                <div className="mt-4 px-0.5">
                                    <div className="relative">
                                        <div className="flex h-2.5 w-full overflow-hidden rounded-full">
                                            <div className="flex-1 bg-rose-400" />
                                            <div className="flex-1 bg-orange-400" />
                                            <div className="flex-1 bg-amber-400" />
                                            <div className="flex-1 bg-sky-400" />
                                            <div className="flex-1 bg-emerald-500" />
                                        </div>
                                        <div
                                            className="absolute top-1/2 -mt-2 h-4 w-2.5 rounded-full bg-slate-900 border-2 border-white shadow-sm"
                                            style={{
                                                left: `${Math.max(2, Math.min(98, Number(primaryRating.overallRating) || 0))}%`,
                                                transform: 'translateX(-50%)',
                                            }}
                                        />
                                    </div>
                                    <div className="mt-1.5 flex justify-between text-[11px] font-extrabold text-slate-500">
                                        <span className="w-1/5 text-center">F</span>
                                        <span className="w-1/5 text-center">S</span>
                                        <span className="w-1/5 text-center">C</span>
                                        <span className="w-1/5 text-center">B</span>
                                        <span className="w-1/5 text-center">A</span>
                                    </div>
                                </div>

                                {/* 3 Clear Student-Friendly Summary Tiles */}
                                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                                        <p className="text-[11px] font-bold text-slate-500">ලකුණු සාමාන්‍යය</p>
                                        <p className="mt-0.5 text-lg font-black text-slate-900">{avgScore}%</p>
                                        <p className="text-[11px] font-medium text-slate-500">මෑත විභාග ලකුණු</p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                                        <p className="text-[11px] font-bold text-slate-500">පන්තියේ ස්ථානය</p>
                                        {latestResult?.gradeRank && latestResult?.cohortSize ? (
                                            <>
                                                <p className="mt-0.5 text-lg font-black text-slate-900">
                                                    {latestResult.gradeRank} / {latestResult.cohortSize}
                                                </p>
                                                <p className="text-[11px] font-medium text-slate-500">
                                                    ළමුන් {latestResult.cohortSize}න් {latestResult.gradeRank} වැනියා
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="mt-0.5 text-lg font-black text-slate-900">—</p>
                                                <p className="text-[11px] font-medium text-slate-500">ඊළඟ විභාගයෙන් පසු</p>
                                            </>
                                        )}
                                    </div>

                                    <div
                                        className={`rounded-xl border p-3 ${
                                            ratingDiff > 0
                                                ? 'bg-emerald-50/70 border-emerald-200'
                                                : ratingDiff < 0
                                                ? 'bg-rose-50/70 border-rose-200'
                                                : 'bg-slate-50 border-slate-200'
                                        }`}
                                    >
                                        <p className="text-[11px] font-bold text-slate-500">කලින් විභාගයට වඩා</p>
                                        {ratingDiff > 0 ? (
                                            <>
                                                <p className="mt-0.5 text-base font-black text-emerald-800">
                                                    ▲ ලකුණු {ratingDiff}ක් වැඩිවී ඇත
                                                </p>
                                                <p className="text-[11px] font-semibold text-emerald-700">ප්‍රගතිය ඉහළට</p>
                                            </>
                                        ) : ratingDiff < 0 ? (
                                            <>
                                                <p className="mt-0.5 text-base font-black text-rose-800">
                                                    ▼ ලකුණු {Math.abs(ratingDiff)}ක් අඩුවී ඇත
                                                </p>
                                                <p className="text-[11px] font-semibold text-rose-700">තව උත්සාහ කරමු</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="mt-0.5 text-base font-black text-slate-800">ස්ථාවරයි</p>
                                                <p className="text-[11px] font-medium text-slate-500">එකම මට්ටමක පවතී</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-7 text-center flex flex-col items-center justify-center">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-2xl font-bold mb-3 shadow-xs">
                                    ★
                                </div>
                                <p className="text-base font-extrabold text-slate-900">තවම Rating එකක් සකස් කර නැත</p>
                                <p className="mt-1 text-sm font-medium text-slate-500 max-w-sm">
                                    පළමු විභාගයේ ප්‍රතිඵල නිකුත් වූ පසු ඔබගේ ලකුණු සහ ප්‍රගතිය මෙහි සටහන් වේ.
                                </p>
                            </div>
                        )}
                    </div>
                    <Link
                        to="/student/results"
                        className="mt-4 block text-center text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline pt-2 border-t border-slate-100"
                    >
                        View all results →
                    </Link>
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
                    <Link
                        to="/student/attendance"
                        className="mt-4 block text-center text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline pt-2 border-t border-slate-100"
                    >
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
                            <p
                                className={`mt-0.5 text-3xl sm:text-4xl font-black ${
                                    data.fees.outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'
                                }`}
                            >
                                {money(data.fees.outstanding)}
                            </p>
                        </div>
                        <div className="mt-3.5 rounded-xl bg-slate-50 border border-slate-200 p-3">
                            <p className="text-xs font-semibold text-slate-500">Paid this academic year</p>
                            <p className="text-base font-extrabold text-slate-900 mt-0.5">{money(data.fees.paid)}</p>
                        </div>
                    </div>
                    <Link
                        to="/student/fees"
                        className="mt-4 block text-center text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline pt-2 border-t border-slate-100"
                    >
                        View fees history →
                    </Link>
                </section>
            </div>

            {/* ROW 2: Latest Exam Result & Enrolled Classes Schedule */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* 4. Latest Result */}
                <section className="app-card p-5 sm:p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">නවතම ප්‍රතිඵලය</h2>
                            <p className="text-xs font-bold text-blue-700">Latest Examination Result</p>
                        </div>
                        <Link to="/student/results" className="text-sm font-bold text-blue-600 hover:text-blue-800">
                            All Results →
                        </Link>
                    </div>
                    {latestResult ? (
                        <div className="mt-4">
                            <p className="font-extrabold text-slate-900 text-lg">{latestResult.exam?.name}</p>
                            <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600">
                                {latestResult.exam?.type} · {latestResult.exam?.subject} ·{' '}
                                {new Date(latestResult.exam?.examDate).toLocaleDateString()}
                            </p>
                            {latestResult.resultStatus === 'Completed' ? (
                                <div className="mt-3.5 grid grid-cols-3 gap-2.5">
                                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center">
                                        <p className="text-xs font-bold text-blue-700">Marks</p>
                                        <p className="font-extrabold text-slate-900 text-base mt-0.5">
                                            {latestResult.marksObtained}/{latestResult.exam?.totalMarks}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                                        <p className="text-xs font-bold text-slate-600">Rank</p>
                                        <p className="font-extrabold text-slate-900 text-base mt-0.5">
                                            {latestResult.gradeRank}/{latestResult.cohortSize}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
                                        <p className="text-xs font-bold text-slate-600">Rating</p>
                                        <p className="font-extrabold text-slate-900 text-base mt-0.5">
                                            {latestResult.overallRating}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm font-semibold text-slate-600">{latestResult.resultStatus}</p>
                            )}
                        </div>
                    ) : (
                        <p className="mt-4 text-sm font-medium text-slate-500">
                            තවම විභාග ප්‍රතිඵල නිකුත් කර නැත (No published results yet).
                        </p>
                    )}
                </section>

                {/* 5. My Classes & Schedule */}
                <section className="app-card p-5 sm:p-6">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">මගේ පන්ති සහ කාලසටහන</h2>
                        <p className="text-xs font-bold text-blue-700">Enrolled Batches & Schedule</p>
                    </div>
                    <div className="mt-4 space-y-3">
                        {data.classes.length ? (
                            data.classes.map((classItem) => (
                                <div
                                    key={classItem._id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 hover:bg-blue-50/40 hover:border-blue-200 transition"
                                >
                                    <div>
                                        <p className="font-extrabold text-sm sm:text-base text-slate-900">
                                            {classItem.className}
                                        </p>
                                        <p className="text-xs font-medium text-slate-600 mt-0.5">
                                            {classItem.subject} · {classItem.location || 'Main Hall'}
                                        </p>
                                    </div>
                                    <span className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 shrink-0">
                                        <span>📅</span>
                                        <span>
                                            {classItem.day}s · {classItem.startTime} - {classItem.endTime}
                                        </span>
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm font-medium text-slate-500">No active classes enrolled.</p>
                        )}
                    </div>
                </section>
            </div>

            {/* ROW 3: Study Materials / Tutes */}
            <section className="app-card p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">පාඩම් නිබන්ධන</h2>
                        <p className="text-xs font-bold text-blue-700">Study Materials & Tutes</p>
                    </div>
                    {materials.length > 0 && (
                        <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-extrabold text-blue-700">
                            {materials.length}
                        </span>
                    )}
                </div>

                {materials.length > 0 ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                        {materials.map((mat) => (
                            <div
                                key={mat._id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/40"
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 mt-0.5">
                                        <Icon name="materials" size={18} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold text-slate-900">
                                            {mat.title}
                                        </p>
                                        <p className="line-clamp-1 text-xs font-medium text-slate-600 mt-0.5">
                                            {mat.description}
                                        </p>
                                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                                            {mat.assignedClass?.className} ·{' '}
                                            {new Date(mat.createdAt || mat.uploadDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={toSafeHref(mat.fileUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-blue-700"
                                >
                                    <span>Open</span>
                                    <span>↗</span>
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-7 text-center flex flex-col items-center justify-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-2.5">
                            <Icon name="materials" size={20} />
                        </span>
                        <p className="text-sm font-extrabold text-slate-800">තවම නිබන්ධන එක් කර නැත</p>
                        <p className="mt-1 text-xs font-medium text-slate-500 max-w-xs">
                            ගුරුතුමා විසින් පන්තියට අදාළ Tutes සහ ප්‍රශ්න පත්‍ර එක් කළ විට මෙහි දිස්වේ.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default StudentHome;
