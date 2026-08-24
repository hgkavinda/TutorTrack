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
        <StudentPageHeader eyebrow="අධ්‍යයන ප්‍රගතිය" title="ප්‍රතිඵල සහ Rating · Results" description="ඔබේ නවතම ලකුණු සහ විභාග ඉතිහාසය.">
            <div><label className="mb-1 block text-xs font-semibold text-slate-500">Year</label><input aria-label="Select year" type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(event.target.value)} className="student-control w-24" /></div>
        </StudentPageHeader>

        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4">{error}</div>}
        {!data && !error && <div className="rounded-2xl border border-white/5 bg-white/5 p-8 text-center text-slate-400">Loading results...</div>}

        {data && <>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.ratings.length ? data.ratings.map((rating) => <article key={rating._id} className="app-card p-5 text-slate-100">
                    <div><p className="text-xs font-bold text-cyan-400">Overall Rating · {rating.subject}</p><p className="mt-1 text-xs text-slate-400">Grade {rating.grade} · {rating.ratingStatus}</p></div>
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                        <div className="flex items-baseline gap-2"><span className="text-5xl font-extrabold tracking-tight text-cyan-300">{rating.overallRating}</span><span className="text-2xl font-bold text-cyan-300">{rating.ratingGrade}</span></div>
                        <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${rating.change >= 0 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'}`}><span aria-hidden="true">{rating.change >= 0 ? '↑' : '↓'}</span><span>{rating.change >= 0 ? '+' : ''}{rating.change} since previous exam</span></div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{[['Recent', rating.components?.recentPerformance], ['Position', rating.components?.gradePosition], ['Growth', rating.components?.improvement], ['Consistency', rating.components?.consistency]].map(([label, value]) => <div key={label} className="rounded-xl bg-white/5 border border-white/5 p-3 text-center"><p className="text-[10px] text-slate-400">{label}</p><p className="mt-1 text-base font-extrabold text-white">{value}</p></div>)}</div>
                </article>) : <div className="md:col-span-2 rounded-2xl border border-white/5 bg-white/5 p-6 text-center text-slate-400">No ratings available for {year}.</div>}
            </section>

            <section className="space-y-3">
                <div><h2 className="student-section-heading student-section-heading--on-dark">නවතම ප්‍රතිඵල · Recent Results</h2><p className="student-section-copy">Your latest published exams.</p></div>
                {latestResults.length ? <div className="grid gap-3 md:grid-cols-2">{latestResults.map((result) => <ResultCard key={result._id} result={result} featured />)}</div> : <div className="rounded-2xl border border-white/5 bg-white/5 p-7 text-center text-slate-400">No published results yet.</div>}
            </section>

            <section className="space-y-4">
                <div><h2 className="student-section-heading student-section-heading--on-dark">විභාග ඉතිහාසය · Exam History</h2><p className="student-section-copy">Browse your results by exam type.</p></div>
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
