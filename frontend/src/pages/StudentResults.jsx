import { useEffect, useState } from 'react';
import api from '../api/client';
import StudentPageHeader from '../components/StudentPageHeader';

const categories = [
    { label: 'Weekly Tests', types: ['Weekly Test'] },
    { label: 'Monthly Exams', types: ['Monthly Exam'] },
    { label: 'Term Exams', types: ['Term Exam'] },
    { label: 'Others', types: ['Model Paper', 'Revision Test', 'Assignment'] },
];

const dateText = (value) => new Date(value).toLocaleDateString('en', {
    day: 'numeric', month: 'short', year: 'numeric',
});
const scoreTone = (percentage) => {
    if (percentage >= 75) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (percentage >= 50) return 'text-blue-700 bg-blue-50 border-blue-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
};

const ResultCard = ({ result, featured = false }) => (
    <article className="app-card p-4 sm:p-5 border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <span className="inline-flex rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-700">{result.exam?.type}</span>
                <h3 className={`${featured ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} mt-1.5 font-extrabold leading-snug text-slate-900`}>{result.exam?.name}</h3>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500">{result.exam?.subject} · {dateText(result.exam?.examDate)}</p>
            </div>
            {result.resultStatus === 'Completed'
                ? <div className={`flex h-10 min-w-18 shrink-0 items-center justify-center rounded-xl border px-3 py-1.5 ${scoreTone(result.percentage)}`}><span className="text-sm font-black">{result.percentage}%</span></div>
                : <span className="shrink-0 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600">{result.resultStatus}</span>}
        </div>
        {result.resultStatus === 'Completed' && <div className="mt-4 grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-center"><p className="text-xs font-bold text-blue-700">Marks</p><p className="mt-0.5 text-base font-black text-blue-950">{result.marksObtained}/{result.exam?.totalMarks}</p></div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center"><p className="text-xs font-semibold text-slate-500">Grade</p><p className="mt-0.5 text-base font-black text-slate-900">{result.performanceGrade || '—'}</p></div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center"><p className="text-xs font-semibold text-slate-500">Position</p><p className="mt-0.5 text-base font-black text-slate-900">{result.gradeRank ? `${result.gradeRank}/${result.cohortSize}` : '—'}</p></div>
        </div>}
        {result.remarks && <div className="mt-3.5 rounded-xl bg-slate-50 border border-slate-200 p-3"><p className="text-xs font-bold text-slate-600">Teacher feedback:</p><p className="mt-0.5 text-sm font-medium text-slate-800 leading-relaxed">{result.remarks}</p></div>}
    </article>
);

const MetricTile = ({ title, visual, text, rawValue, techDesc }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showTech, setShowTech] = useState(false);

    return (
        <div 
            className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex flex-col cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <p className="text-xs font-bold text-slate-700">{title}</p>
            <div className="mt-2.5 mb-2.5 h-8 w-full flex items-center">
                {visual}
            </div>
            <p className="text-xs text-slate-500 leading-snug flex-1">{text}</p>

            {isExpanded && (
                <div 
                    className="mt-3 pt-3 border-t border-slate-200 animate-fade-in text-left" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 uppercase tracking-wide font-bold">Value</span>
                        <span className="text-sm font-extrabold text-slate-900">{rawValue}</span>
                    </div>
                    <button 
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        onClick={(e) => { e.stopPropagation(); setShowTech(!showTech); }}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        How is this calculated?
                    </button>
                    {showTech && (
                        <div className="mt-2 text-xs text-slate-600 leading-relaxed p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
                            {techDesc}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const RatingCard = ({ rating }) => {
    const [showProvisional, setShowProvisional] = useState(false);

    const getGradeTone = (grade) => {
        if (['A', 'B'].includes(grade)) return 'bg-emerald-50 text-emerald-700 border-emerald-300';
        if (['C', 'S', 'D'].includes(grade)) return 'bg-amber-50 text-amber-700 border-amber-300';
        return 'bg-rose-50 text-rose-700 border-rose-300';
    };

    const pos = Math.round(rating.components?.gradePosition || 0);
    const imp = Math.round(rating.components?.improvement || 50);
    const con = Math.round(rating.components?.consistency || 0);
    const rec = Math.round(rating.components?.recentPerformance || 0);

    const isSteady = con >= 70;

    return (
        <article className="app-card p-5 sm:p-6 text-slate-900 border border-slate-200 bg-white">
            <div>
                <p className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">Overall Rating · {rating.subject}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-600">
                    <span className="font-bold">Grade {rating.grade}</span>
                    <span>·</span>
                    {rating.ratingStatus === 'Provisional' ? (
                        <div className="relative">
                            <button onClick={() => setShowProvisional(!showProvisional)} className="border-b border-dashed border-slate-400 hover:text-slate-900 transition-colors pb-0.5 font-semibold text-blue-600">
                                Provisional
                            </button>
                            {showProvisional && (
                                <div className="absolute top-full left-0 mt-2 w-72 z-20 rounded-xl bg-white border border-slate-200 p-3.5 shadow-xl animate-fade-in">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-xs text-slate-700 leading-relaxed font-medium">This rating updates automatically as more exams are published this year.</p>
                                        <button onClick={() => setShowProvisional(false)} className="text-slate-400 hover:text-slate-700 p-0.5 shrink-0 font-bold">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="font-semibold">{rating.ratingStatus}</span>
                    )}
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">{rating.overallRating}</span>
                        <span className="text-sm font-semibold text-slate-400">/ 100</span>
                    </div>
                    <span className={`inline-flex min-w-[36px] items-center justify-center rounded-xl border px-3 py-1 text-lg font-black shadow-xs ${getGradeTone(rating.ratingGrade)}`}>
                        {rating.ratingGrade}
                    </span>
                </div>
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${rating.change >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-rose-50 text-rose-700 border border-rose-300'}`}>
                    <span>{rating.change >= 0 ? '▲' : '▼'}</span>
                    <span>{Math.abs(rating.change)} pts vs last test</span>
                </div>
            </div>

            <div className="mt-5 mb-2 relative px-1">
                <div className="flex h-2 w-full overflow-hidden rounded-full opacity-90">
                    <div className="flex-1 bg-rose-500"></div>
                    <div className="flex-1 bg-orange-500"></div>
                    <div className="flex-1 bg-amber-400"></div>
                    <div className="flex-1 bg-lime-400"></div>
                    <div className="flex-1 bg-emerald-500"></div>
                </div>
                <div className="absolute top-1/2 -mt-2 h-4 w-2 rounded-full bg-slate-900 border-2 border-white shadow-xs" style={{ left: `${Math.max(0, Math.min(100, rating.overallRating))}%`, transform: 'translateX(-50%)' }}></div>
                <div className="mt-2 flex justify-between px-1 text-xs font-bold text-slate-500">
                    <span className="w-1/5 text-center">E/F</span>
                    <span className="w-1/5 text-center">S</span>
                    <span className="w-1/5 text-center">C</span>
                    <span className="w-1/5 text-center">B</span>
                    <span className="w-1/5 text-center">A</span>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <MetricTile 
                    title="Current Level"
                    text="Weighted average of your recent tests."
                    rawValue={`${rec} / 100`}
                    techDesc="Weighted average of your last 5 exams. Recent exams carry higher weight."
                    visual={
                        <div className="flex items-end gap-1 h-full w-full">
                            {[20, 35, 50, 75, 100].map((h, i) => (
                                <div key={i} className="bg-blue-600 rounded-t-[2px] flex-1" style={{ height: `${h}%`, opacity: 0.3 + (i * 0.175) }}></div>
                            ))}
                        </div>
                    }
                />
                <MetricTile 
                    title="Class Standing"
                    text={`Ahead of ${pos}% of your batch.`}
                    rawValue={`${pos} percentile`}
                    techDesc="Percentile ranking relative to classmates in this subject/grade."
                    visual={
                        <div className="w-full h-1.5 bg-slate-200 rounded-full relative">
                            <div className="absolute top-1/2 -mt-1.5 h-3 w-3 bg-blue-600 border border-white rounded-full shadow-xs" style={{ left: `${Math.max(0, Math.min(100, pos))}%`, transform: 'translateX(-50%)' }}></div>
                        </div>
                    }
                />
                <MetricTile 
                    title="Trend"
                    text={imp > 50 ? "Scores trending up" : imp < 50 ? "Scores trending down" : "Holding steady"}
                    rawValue={`${imp} / 100`}
                    techDesc="Tracks trajectory across tests. >50 means improving, <50 means dipping."
                    visual={
                        <div className="w-full h-1.5 rounded-full relative bg-gradient-to-r from-rose-400 via-slate-300 to-emerald-400">
                            <div className="absolute top-1/2 -mt-1.5 h-3 w-3 bg-slate-900 border border-white rounded-full shadow-xs" style={{ left: `${Math.max(0, Math.min(100, imp))}%`, transform: 'translateX(-50%)' }}></div>
                        </div>
                    }
                />
                <MetricTile 
                    title="Steadiness"
                    text={isSteady ? "Stable test-to-test" : "Scores fluctuate"}
                    rawValue={`${con} / 100`}
                    techDesc="Standard deviation score consistency metric."
                    visual={
                        <svg className={`w-full h-full ${isSteady ? 'text-emerald-500' : 'text-rose-500'}`} viewBox="0 0 100 20" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="2.5">
                            {isSteady ? (
                                <path d="M0,10 Q25,12 50,10 T100,10" strokeLinecap="round" />
                            ) : (
                                <path d="M0,10 L15,2 L30,18 L45,5 L60,15 L75,3 L90,17 L100,10" strokeLinecap="round" strokeLinejoin="round" />
                            )}
                        </svg>
                    }
                />
            </div>
        </article>
    );
};

const StudentResults = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Weekly Tests');
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/student-portal/results?year=${year}`)
            .then((response) => { setError(''); setData(response.data.data); })
            .catch((requestError) => setError(requestError.response?.data?.error || 'Failed to load results'));
    }, [year]);

    const sortedResults = [...(data?.results || [])].sort((a, b) => new Date(b.exam?.examDate) - new Date(a.exam?.examDate));
    const latestResults = sortedResults.slice(0, 2);
    const selectedCategory = categories.find((category) => category.label === activeCategory);
    const categoryResults = sortedResults.filter((result) => selectedCategory.types.includes(result.exam?.type));
    const categoryCount = (category) => sortedResults.filter((result) => category.types.includes(result.exam?.type)).length;

    return (
        <div className="animate-fade-in space-y-6">
            <StudentPageHeader
                eyebrow="Examination Results"
                title="මගේ ප්‍රතිඵල"
                description="ඔබගේ සියලුම විභාග ලකුණු, පන්ති ශ්‍රේණිගත කිරීම් සහ ප්‍රගති වාර්තාව."
            >
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 shadow-xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Year:</span>
                    <input
                        aria-label="Select academic year"
                        type="number"
                        min="2000"
                        max="2100"
                        value={year}
                        onChange={(event) => setYear(event.target.value)}
                        className="w-16 border-none bg-transparent p-0 text-right text-sm font-extrabold text-slate-900 outline-none focus:ring-0"
                    />
                </div>
            </StudentPageHeader>

            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">{error}</div>}
            {!data && !error && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs font-medium text-slate-500">Loading examination results...</div>}

            {data && (
                <>
                    {/* Overall Rating Section (Shown only when rating data exists) */}
                    {data.ratings.length > 0 && (
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.ratings.map((rating) => (
                                <RatingCard key={rating._id} rating={rating} />
                            ))}
                        </section>
                    )}

                    {/* Recent Results */}
                    <section className="app-card p-5 sm:p-6 space-y-4 border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">නවතම ප්‍රතිඵල</h2>
                            <p className="text-xs font-bold text-blue-700">Recent Examination Results</p>
                        </div>
                        {latestResults.length ? (
                            <div className="grid gap-3.5 md:grid-cols-2">
                                {latestResults.map((result) => (
                                    <ResultCard key={result._id} result={result} featured />
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center flex flex-col items-center justify-center">
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-xl font-bold mb-2.5">
                                    📝
                                </div>
                                <p className="text-base font-extrabold text-slate-900">තවම විභාග ප්‍රතිඵල නිකුත් කර නැත</p>
                                <p className="mt-1 text-sm font-medium text-slate-500 max-w-sm">ගුරුතුමා විසින් විභාග ලකුණු ඇතුළත් කළ පසු ඔබගේ ප්‍රතිඵල මෙහි විස්තරාත්මකව දිස්වේ.</p>
                            </div>
                        )}
                    </section>

                    {/* Exam History by Category */}
                    <section className="app-card p-5 sm:p-6 space-y-4 border border-slate-200 bg-white">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">විභාග ඉතිහාසය</h2>
                            <p className="text-xs font-bold text-blue-700">Browse by Exam Category</p>
                        </div>
                        <div className="relative">
                            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                                {categories.map((category) => {
                                    const active = category.label === activeCategory;
                                    return (
                                        <button
                                            key={category.label}
                                            onClick={() => setActiveCategory(category.label)}
                                            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition ${
                                                active
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                                                    : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span>{category.label}</span>
                                            <span className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ${active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                                {categoryCount(category)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {categoryResults.length ? (
                            <div className="grid gap-3.5 md:grid-cols-2">
                                {categoryResults.map((result) => (
                                    <ResultCard key={result._id} result={result} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-7 text-center flex flex-col items-center justify-center">
                                <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-base font-bold mb-2">
                                    📂
                                </div>
                                <p className="text-sm sm:text-base font-bold text-slate-800">{activeCategory} කාණ්ඩයේ ප්‍රතිඵල නොමැත</p>
                                <p className="mt-0.5 text-xs sm:text-sm text-slate-500">මෙම විභාග වර්ගයට අදාළ ලකුණු නිකුත් කළ පසු මෙහි දිස්වනු ඇත.</p>
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default StudentResults;
