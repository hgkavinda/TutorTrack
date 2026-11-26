import { useEffect, useState } from 'react';
import api from '../api/client';
import StudentPageHeader from '../components/StudentPageHeader';

const CATEGORIES = [
    { id: 'all', label: 'සියල්ල · All', types: null },
    { id: 'weekly', label: 'සතිපතා · Weekly', types: ['Weekly Test'] },
    { id: 'monthly', label: 'මාසික · Monthly', types: ['Monthly Exam'] },
    { id: 'term', label: 'වාර විභාග · Term', types: ['Term Exam'] },
    { id: 'other', label: 'වෙනත් · Others', types: ['Model Paper', 'Revision Test', 'Assignment'] },
];

const EXAM_TYPE_LABELS = {
    'Weekly Test': 'සතිපතා පරීක්ෂණය · Weekly Test',
    'Monthly Exam': 'මාසික විභාගය · Monthly Exam',
    'Term Exam': 'වාර විභාගය · Term Exam',
    'Model Paper': 'ආදර්ශ ප්‍රශ්න පත්‍රය · Model Paper',
    'Revision Test': 'පුනරීක්ෂණ පරීක්ෂණය · Revision Test',
    Assignment: 'පැවරුම · Assignment',
};

const STATUS_LABELS = {
    Absent: { text: 'පැමිණ නැත (Absent)', tone: 'bg-rose-50 text-rose-700 border-rose-200' },
    Excused: { text: 'නිදහස් කර ඇත (Excused)', tone: 'bg-amber-50 text-amber-800 border-amber-200' },
    Pending: { text: 'සකසමින් පවතී (Pending)', tone: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const dateText = (value) =>
    value
        ? new Date(value).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '';

const scoreTone = (percentage) => {
    if (percentage >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (percentage >= 50) return 'text-blue-700 bg-blue-50 border-blue-300';
    if (percentage >= 35) return 'text-amber-800 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
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

const RatingCard = ({ rating, latestSubjectResult }) => {
    const gradeMeta = getGradeMeta(rating.ratingGrade);
    const ratingDiff = Number(rating.change || 0);
    const avgScore = Math.round(rating.components?.recentPerformance ?? rating.overallRating ?? 0);

    return (
        <article className="app-card p-4 sm:p-6 text-slate-900 border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold leading-snug text-slate-900 truncate">
                        සමස්ත ප්‍රගතිය
                    </h2>
                    <p className="text-xs font-semibold text-blue-700 truncate">
                        {rating.subject} · Grade {rating.grade}
                    </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold ${gradeMeta.pillClass}`}>
                    {gradeMeta.label}
                </span>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-black tracking-tight text-blue-600">
                            {rating.overallRating}
                        </span>
                        <span className="text-sm font-bold text-slate-400">/ 100</span>
                    </div>
                    <span
                        className={`inline-flex items-center justify-center rounded-xl border px-3 py-1 text-sm sm:text-lg font-black shadow-2xs ${gradeMeta.badgeClass}`}
                    >
                        Grade {rating.ratingGrade}
                    </span>
                </div>
            </div>

            {/* Visual Grade Scale Bar (F -> S -> C -> B -> A) */}
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
                            left: `${Math.max(2, Math.min(98, Number(rating.overallRating) || 0))}%`,
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

            {/* 3 Perfectly Aligned Side-by-Side Tiles (Mobile & Desktop) */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-3 sm:p-3.5 text-center">
                    <p className="text-lg sm:text-2xl font-black text-slate-900 leading-none">{avgScore}%</p>
                    <p className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-700 leading-tight">සාමාන්‍යය</p>
                    <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-500 leading-tight">Avg Marks</p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-3 sm:p-3.5 text-center">
                    <p className="text-lg sm:text-2xl font-black text-slate-900 leading-none">
                        {latestSubjectResult?.gradeRank && latestSubjectResult?.cohortSize
                            ? `${latestSubjectResult.gradeRank}/${latestSubjectResult.cohortSize}`
                            : '—'}
                    </p>
                    <p className="mt-1.5 text-[11px] sm:text-xs font-bold text-slate-700 leading-tight">ස්ථානය</p>
                    <p className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-500 leading-tight">
                        {latestSubjectResult?.gradeRank && latestSubjectResult?.cohortSize
                            ? `ළමුන් ${latestSubjectResult.cohortSize}න් ${latestSubjectResult.gradeRank}`
                            : 'Class Rank'}
                    </p>
                </div>

                <div
                    className={`rounded-xl border px-2 py-3 sm:p-3.5 text-center ${
                        ratingDiff > 0
                            ? 'bg-emerald-50/80 border-emerald-200'
                            : ratingDiff < 0
                            ? 'bg-rose-50/80 border-rose-200'
                            : 'bg-slate-50 border-slate-200'
                    }`}
                >
                    <p
                        className={`text-lg sm:text-2xl font-black leading-none ${
                            ratingDiff > 0
                                ? 'text-emerald-700'
                                : ratingDiff < 0
                                ? 'text-rose-700'
                                : 'text-slate-800'
                        }`}
                    >
                        {ratingDiff > 0 ? `+${ratingDiff}` : ratingDiff < 0 ? `${ratingDiff}` : '0'}
                    </p>
                    <p
                        className={`mt-1.5 text-[11px] sm:text-xs font-bold leading-tight ${
                            ratingDiff > 0
                                ? 'text-emerald-800'
                                : ratingDiff < 0
                                ? 'text-rose-800'
                                : 'text-slate-700'
                        }`}
                    >
                        {ratingDiff > 0 ? 'වැඩිවී ඇත ▲' : ratingDiff < 0 ? 'අඩුවී ඇත ▼' : 'ස්ථාවරයි'}
                    </p>
                    <p
                        className={`mt-0.5 text-[10px] sm:text-[11px] font-medium leading-tight ${
                            ratingDiff > 0
                                ? 'text-emerald-700/80'
                                : ratingDiff < 0
                                ? 'text-rose-700/80'
                                : 'text-slate-500'
                        }`}
                    >
                        පසුගිය විභාගයට
                    </p>
                </div>
            </div>
        </article>
    );
};

const ResultCard = ({ result }) => {
    const typeText = EXAM_TYPE_LABELS[result.exam?.type] || result.exam?.type || 'Exam';
    const statusInfo = STATUS_LABELS[result.resultStatus] || {
        text: result.resultStatus,
        tone: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    return (
        <article className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 sm:p-5 transition hover:border-blue-200 hover:bg-white">
            <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                        {typeText}
                    </span>
                    <h3 className="mt-1.5 text-sm sm:text-lg font-bold leading-snug text-slate-900">
                        {result.exam?.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                        {result.exam?.subject} · {dateText(result.exam?.examDate)}
                    </p>
                </div>

                {result.resultStatus === 'Completed' ? (
                    <div
                        className={`flex h-9 sm:h-10 shrink-0 items-center justify-center rounded-xl border px-3 py-1 ${scoreTone(
                            result.percentage
                        )}`}
                    >
                        <span className="text-xs sm:text-sm font-black">{result.percentage}%</span>
                    </div>
                ) : (
                    <span className={`shrink-0 rounded-xl border px-2.5 py-1 text-[11px] sm:text-xs font-bold ${statusInfo.tone}`}>
                        {statusInfo.text}
                    </span>
                )}
            </div>

            {result.resultStatus === 'Completed' && (
                <div className="mt-3.5 grid grid-cols-3 gap-2 sm:gap-2.5">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-2 py-2.5 sm:p-3 text-center">
                        <p className="text-sm sm:text-base font-black text-blue-950 leading-none">
                            {result.marksObtained}/{result.exam?.totalMarks}
                        </p>
                        <p className="mt-1.5 text-[11px] font-bold text-blue-700 leading-tight">ලකුණු</p>
                        <p className="text-[10px] font-medium text-blue-600/80 leading-tight">Marks</p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 px-2 py-2.5 sm:p-3 text-center">
                        <p className="text-sm sm:text-base font-black text-slate-900 leading-none">
                            {result.performanceGrade || result.ratingGrade || '—'}
                        </p>
                        <p className="mt-1.5 text-[11px] font-bold text-slate-700 leading-tight">සාමාර්ථය</p>
                        <p className="text-[10px] font-medium text-slate-400 leading-tight">Grade</p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 px-2 py-2.5 sm:p-3 text-center">
                        <p className="text-sm sm:text-base font-black text-slate-900 leading-none">
                            {result.gradeRank && result.cohortSize
                                ? `${result.gradeRank}/${result.cohortSize}`
                                : '—'}
                        </p>
                        <p className="mt-1.5 text-[11px] font-bold text-slate-700 leading-tight">ස්ථානය</p>
                        <p className="text-[10px] font-medium text-slate-400 leading-tight">Rank</p>
                    </div>
                </div>
            )}

            {result.remarks && (
                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                    <p className="text-xs font-bold text-blue-800">👨‍🏫 ගුරුතුමාගේ සටහන (Teacher&apos;s Note):</p>
                    <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                        {result.remarks}
                    </p>
                </div>
            )}
        </article>
    );
};

const StudentResults = () => {
    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

    const [year, setYear] = useState(currentYear);
    const [data, setData] = useState(null);
    const [activeCategoryId, setActiveCategoryId] = useState('all');
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/student-portal/results?year=${year}`)
            .then((response) => {
                setError('');
                setData(response.data.data);
            })
            .catch((requestError) =>
                setError(requestError.response?.data?.error || 'Failed to load results')
            );
    }, [year]);

    const sortedResults = [...(data?.results || [])].sort(
        (a, b) => new Date(b.exam?.examDate) - new Date(a.exam?.examDate)
    );

    const selectedCategory =
        CATEGORIES.find((cat) => cat.id === activeCategoryId) || CATEGORIES[0];

    const visibleResults = selectedCategory.types
        ? sortedResults.filter((r) => selectedCategory.types.includes(r.exam?.type))
        : sortedResults;

    const categoryCount = (category) =>
        category.types
            ? sortedResults.filter((r) => category.types.includes(r.exam?.type)).length
            : sortedResults.length;

    return (
        <div className="animate-fade-in space-y-6">
            <StudentPageHeader
                eyebrow="Examination Results"
                title="මගේ ප්‍රතිඵල"
                description="ඔබගේ සියලුම විභාග ලකුණු, පන්තියේ ස්ථානය සහ ප්‍රගති වාර්තාව."
            >
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 shadow-xs">
                    <span className="text-xs font-bold text-slate-500">වර්ෂය · Year:</span>
                    <select
                        aria-label="Select academic year"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
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
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
                    {error}
                </div>
            )}
            {!data && !error && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs font-medium text-slate-500">
                    Loading examination results...
                </div>
            )}

            {data && (
                <>
                    {/* Overall Subject Progress Cards */}
                    {data.ratings.length > 0 && (
                        <section
                            className={`grid grid-cols-1 gap-5 ${
                                data.ratings.length > 1 ? 'lg:grid-cols-2' : ''
                            }`}
                        >
                            {data.ratings.map((rating) => {
                                const latestSubjectResult = sortedResults.find(
                                    (r) =>
                                        r.resultStatus === 'Completed' &&
                                        r.exam?.subject === rating.subject
                                );
                                return (
                                    <RatingCard
                                        key={rating._id}
                                        rating={rating}
                                        latestSubjectResult={latestSubjectResult}
                                    />
                                );
                            })}
                        </section>
                    )}

                    {/* Unified All Exam Results Section */}
                    <section className="app-card p-4 sm:p-6 space-y-4 border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-base sm:text-lg font-bold leading-snug text-slate-900">
                                විභාග ලකුණු වාර්තාව
                            </h2>
                            <p className="text-xs font-semibold text-blue-700">
                                Examination Marks & Class Rankings
                            </p>
                        </div>

                        {/* Category Filter Tabs */}
                        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                            {CATEGORIES.map((category) => {
                                const active = category.id === activeCategoryId;
                                const count = categoryCount(category);
                                return (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => setActiveCategoryId(category.id)}
                                        className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition ${
                                            active
                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                                                : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <span>{category.label}</span>
                                        <span
                                            className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ${
                                                active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-200 text-slate-700'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {visibleResults.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {visibleResults.map((result) => (
                                    <ResultCard key={result._id} result={result} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-9 text-center flex flex-col items-center justify-center">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-xl font-bold mb-2.5">
                                    📝
                                </div>
                                <p className="text-sm sm:text-base font-extrabold text-slate-900">
                                    {activeCategoryId === 'all'
                                        ? `${year} වර්ෂය සඳහා තවම විභාග ප්‍රතිඵල නිකුත් කර නැත`
                                        : 'මෙම කාණ්ඩයේ විභාග ප්‍රතිඵල තවම නිකුත් කර නැත'}
                                </p>
                                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 max-w-sm">
                                    ගුරුතුමා විසින් විභාග ලකුණු ප්‍රසිද්ධ කළ පසු ඔබගේ ප්‍රතිඵල සහ පන්තියේ ස්ථානය මෙහි දිස්වේ.
                                </p>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default StudentResults;
