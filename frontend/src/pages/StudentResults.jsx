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
    if (percentage >= 75) return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
    if (percentage >= 50) return 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20';
    return 'text-rose-300 bg-rose-500/10 border-rose-500/20';
};

const ResultCard = ({ result, featured = false }) => (
    <article className="app-card p-4">
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <span className="inline-flex rounded-full bg-white/10 border border-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">{result.exam?.type}</span>
                <h3 className={`${featured ? 'text-lg' : 'text-base'} mt-2 font-bold leading-snug text-white`}>{result.exam?.name}</h3>
                <p className="mt-1 text-xs text-slate-400">{result.exam?.subject} · {dateText(result.exam?.examDate)}</p>
            </div>
            {result.resultStatus === 'Completed'
                ? <div className={`flex h-9 min-w-16 shrink-0 items-center justify-center rounded-full border px-3 py-1.5 ${scoreTone(result.percentage)}`}><span className="text-xs font-bold">{result.percentage}%</span></div>
                : <span className="shrink-0 rounded-full bg-white/5 border border-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400">{result.resultStatus}</span>}
        </div>
        {result.resultStatus === 'Completed' && <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-blue-500/15 bg-blue-500/10 p-3 text-center"><p className="text-[10px] font-semibold text-blue-300">Marks</p><p className="mt-0.5 text-base font-extrabold text-blue-100">{result.marksObtained}/{result.exam?.totalMarks}</p></div>
            <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center"><p className="text-[10px] text-slate-400">Grade</p><p className="mt-0.5 text-sm font-extrabold text-white">{result.performanceGrade || '—'}</p></div>
            <div className="rounded-xl bg-white/5 border border-white/5 p-3 text-center"><p className="text-[10px] text-slate-400">Position</p><p className="mt-0.5 text-sm font-extrabold text-white">{result.gradeRank ? `${result.gradeRank}/${result.cohortSize}` : '—'}</p></div>
        </div>}
        {result.remarks && <div className="mt-3 rounded-xl bg-white/5 border border-white/5 p-3"><p className="text-xs font-medium text-slate-400">Teacher feedback</p><p className="mt-0.5 text-sm text-slate-200">{result.remarks}</p></div>}
    </article>
);

const MetricTile = ({ title, visual, text, rawValue, techDesc }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showTech, setShowTech] = useState(false);

    return (
        <div 
            className="rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <p className="text-xs font-bold text-slate-300">{title}</p>
            <div className="mt-3 mb-3 h-8 w-full flex items-center">
                {visual}
            </div>
            <p className="text-[10px] text-slate-400 leading-snug flex-1">{text}</p>

            {isExpanded && (
                <div 
                    className="mt-3 pt-3 border-t border-white/10 animate-fade-in text-left" 
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide font-bold">Value</span>
                        <span className="text-sm font-extrabold text-white">{rawValue}</span>
                    </div>
                    <button 
                        className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
                        onClick={(e) => { e.stopPropagation(); setShowTech(!showTech); }}
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        How is this calculated?
                    </button>
                    {showTech && (
                        <div className="mt-2 text-[10.5px] text-slate-300 leading-relaxed p-2.5 bg-black/20 border border-white/5 rounded-lg">
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
    const [activeInfo, setActiveInfo] = useState(null);

    const getGradeTone = (grade) => {
        if (['A', 'B'].includes(grade)) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
        if (['C', 'S', 'D'].includes(grade)) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    };

    const pos = Math.round(rating.components?.gradePosition || 0);
    const imp = Math.round(rating.components?.improvement || 50);
    const con = Math.round(rating.components?.consistency || 0);
    const rec = Math.round(rating.components?.recentPerformance || 0);

    const isSteady = con >= 70;

    return (
        <article className="app-card p-5 sm:p-6 text-slate-100">
            <div>
                <p className="text-xs font-bold text-cyan-400">Overall Rating · {rating.subject}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                    <span>Grade {rating.grade}</span>
                    <span>·</span>
                    {rating.ratingStatus === 'Provisional' ? (
                        <div className="relative">
                            <button onClick={() => setShowProvisional(!showProvisional)} className="border-b border-dashed border-slate-500 hover:text-white transition-colors pb-0.5">
                                Provisional
                            </button>
                            {showProvisional && (
                                <div className="absolute top-full left-0 mt-3 w-64 z-10 rounded-xl bg-slate-800 border border-slate-600 p-3.5 shadow-xl animate-fade-in">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-xs text-slate-300 leading-relaxed font-medium">This rating will keep changing as more of your exams are marked and published this year.</p>
                                        <button onClick={() => setShowProvisional(false)} className="text-slate-400 hover:text-white p-0.5 shrink-0">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span>{rating.ratingStatus}</span>
                    )}
                </div>
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-5xl font-extrabold tracking-tight text-white">{rating.overallRating}</span>
                        <span className="text-sm font-semibold text-slate-500">/ 100</span>
                    </div>
                    <span className={`inline-flex min-w-[32px] items-center justify-center rounded-lg border px-2.5 py-1 text-lg font-bold shadow-sm ${getGradeTone(rating.ratingGrade)}`}>
                        {rating.ratingGrade}
                    </span>
                </div>
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${rating.change >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'}`}>
                    <span aria-hidden="true" className="text-[10px]">{rating.change >= 0 ? '▲' : '▼'}</span>
                    <span>{Math.abs(rating.change)} pts vs your last exam</span>
                </div>
            </div>

            <div className="mt-6 mb-2 relative px-1">
                <div className="flex h-[5px] w-full overflow-hidden rounded-full opacity-90">
                    <div className="flex-1 bg-rose-500"></div>
                    <div className="flex-1 bg-orange-500"></div>
                    <div className="flex-1 bg-amber-400"></div>
                    <div className="flex-1 bg-lime-400"></div>
                    <div className="flex-1 bg-emerald-500"></div>
                </div>
                <div className="absolute top-1/2 -mt-2 h-4 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] border border-slate-900" style={{ left: `${Math.max(0, Math.min(100, rating.overallRating))}%`, transform: 'translateX(-50%)' }}></div>
                <div className="mt-2 flex justify-between px-2 text-[10px] font-bold text-slate-500">
                    <span className="w-1/5 text-center">E/F</span>
                    <span className="w-1/5 text-center">S</span>
                    <span className="w-1/5 text-center">C</span>
                    <span className="w-1/5 text-center">B</span>
                    <span className="w-1/5 text-center">A</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricTile 
                    title="Current Level"
                    text="Based on your last 5 exams — recent ones count more."
                    rawValue={`${rec} / 100`}
                    techDesc="Calculated as a weighted average of your last 5 exams. The most recent exam gets the highest weight and older ones count less."
                    visual={
                        <div className="flex items-end gap-1 h-full w-full opacity-90">
                            {[20, 35, 50, 75, 100].map((h, i) => (
                                <div key={i} className="bg-cyan-400 rounded-t-[1px] flex-1" style={{ height: `${h}%`, opacity: 0.3 + (i * 0.175) }}></div>
                            ))}
                        </div>
                    }
                />
                <MetricTile 
                    title="Class Standing"
                    text={`Ahead of ${pos}% of your class — top ${100 - pos}%.`}
                    rawValue={`${pos} percentile`}
                    techDesc="Shows where you stand relative to your classmates, as a percentile. X% means you've scored equal to or higher than X% of students in your class."
                    visual={
                        <div className="w-full h-1.5 bg-slate-700 rounded-full relative">
                            <div className="absolute top-1/2 -mt-1.5 h-3 w-3 bg-white border border-cyan-500 rounded-full shadow-sm" style={{ left: `${Math.max(0, Math.min(100, pos))}%`, transform: 'translateX(-50%)' }}></div>
                        </div>
                    }
                />
                <MetricTile 
                    title="Trend"
                    text={imp > 50 ? "Your scores are trending up" : imp < 50 ? "Your scores are trending down" : "Your scores are holding steady"}
                    rawValue={`${imp} / 100`}
                    techDesc="Tracks whether your scores are rising or falling across your last 5 exams. 50 means no change, above 50 means improving, below 50 means scores are slipping."
                    visual={
                        <div className="w-full h-1.5 rounded-full relative bg-gradient-to-r from-rose-500 via-slate-600 to-emerald-500 opacity-90">
                            <div className="absolute top-1/2 -mt-1.5 h-3 w-3 bg-white border border-slate-700 rounded-full shadow-sm" style={{ left: `${Math.max(0, Math.min(100, imp))}%`, transform: 'translateX(-50%)' }}></div>
                            <div className="absolute top-1/2 left-1/2 -mt-1.5 h-3 w-px bg-white/70"></div>
                        </div>
                    }
                />
                <MetricTile 
                    title="Steadiness"
                    text={isSteady ? "Your scores stay steady exam to exam" : "Your scores vary a lot between exams"}
                    rawValue={`${con} / 100`}
                    techDesc="Based on the spread (standard deviation) of your scores. Big swings between exams give a low number; scoring around the same level every time gives a value close to 100."
                    visual={
                        <svg className={`w-full h-full opacity-90 ${isSteady ? 'text-emerald-400' : 'text-rose-400'}`} viewBox="0 0 100 20" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="2.5">
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

    return <div className="animate-fade-in space-y-7">
        <StudentPageHeader  title="මගේ ප්‍රතිඵල" description="ඔබේ නවතම ලකුණු සහ පසුගිය විභාග ලකුණු.">
            <div><label className="mb-1 block text-xs font-semibold text-slate-500">Year</label><input aria-label="Select year" type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(event.target.value)} className="student-control w-24" /></div>
        </StudentPageHeader>

        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4">{error}</div>}
        {!data && !error && <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center text-slate-400">Loading results...</div>}

        {data && <>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.ratings.length ? data.ratings.map((rating) => <RatingCard key={rating._id} rating={rating} />) : <div className="md:col-span-2 rounded-2xl border border-white/5 bg-white/5 p-6 text-center text-slate-400">No ratings available for {year}.</div>}
            </section>

            <section className="app-card p-5 sm:p-6 space-y-5">
                <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-cyan-400">නවතම ප්‍රතිඵල · Recent Results</h2>
                    <p className="student-section-copy mt-1">Your latest published exams.</p>
                </div>
                {latestResults.length ? <div className="grid gap-3 md:grid-cols-2">{latestResults.map((result) => <ResultCard key={result._id} result={result} featured />)}</div> : <div className="rounded-2xl border border-white/5 bg-white/5 p-7 text-center text-slate-400">No published results yet.</div>}
            </section>

            <section className="app-card p-5 sm:p-6 space-y-4">
                <div className="border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-cyan-400">විභාග ඉතිහාසය · Exam History</h2>
                    <p className="student-section-copy mt-1">Browse your results by exam type.</p>
                </div>
                <div className="relative">
                    <div className="flex gap-2 overflow-x-auto pb-2 pr-8">
                        {categories.map((category) => {
                            const active = category.label === activeCategory;
                            return <button key={category.label} onClick={() => setActiveCategory(category.label)} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${active ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300' : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'}`}><span>{category.label}</span><span className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/5 text-slate-400'}`}>{categoryCount(category)}</span></button>;
                        })}
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-950 to-transparent" aria-hidden="true" />
                </div>
                {categoryResults.length ? <div className="grid gap-3 md:grid-cols-2">{categoryResults.map((result) => <ResultCard key={result._id} result={result} />)}</div> : <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/5 bg-white/5 text-slate-400">—</div><p className="mt-3 font-bold text-white">No {activeCategory.toLowerCase()} yet</p><p className="mt-1 text-xs text-slate-400">Published results will appear here.</p></div>}
            </section>
        </>}
    </div>;
};

export default StudentResults;
