import { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';
import StudentPageHeader from '../components/StudentPageHeader';
import Icon from '../components/Icon';

const MODES = [
    {
        id: 'add',
        label: 'එකතු කිරීම',
        sub: 'Addition (+)',
        symbol: '+',
        signed: false,
        hint: 'පේළියේ සංඛ්‍යාව සහ තීරුවේ සංඛ්‍යාව එකතු කරන්න (Row + Column).',
    },
    {
        id: 'sub',
        label: 'අඩු කිරීම',
        sub: 'Subtraction (−)',
        symbol: '−',
        signed: false,
        hint: 'වම් පස පේළියේ සංඛ්‍යාවෙන් ඉහළ තීරුවේ සංඛ්‍යාව අඩු කරන්න (Row − Column).',
    },
    {
        id: 'mul',
        label: 'ගුණ කිරීම',
        sub: 'Multiplication (×)',
        symbol: '×',
        signed: false,
        hint: 'පේළියේ සංඛ්‍යාව සහ තීරුවේ සංඛ්‍යාව ගුණ කරන්න (Row × Column).',
    },
    {
        id: 'int_add',
        label: 'සදිශ සංඛ්‍යා (+)',
        sub: 'Directed Numbers (+)',
        symbol: '+',
        signed: true,
        hint: 'ධන (+) සහ ඍණ (−) ලකුණු ගැන සැලකිලිමත්ව සදිශ සංඛ්‍යා එකතු කරන්න.',
    },
    {
        id: 'int_mul',
        label: 'සදිශ සංඛ්‍යා (×)',
        sub: 'Directed Numbers (×)',
        symbol: '×',
        signed: true,
        hint: 'ලකුණු නීති අනුව ගුණ කරන්න: (−)×(−) = (+), (−)×(+) = (−).',
    },
];

const SIZES = [
    { value: 5, label: '5 × 5 වගුව', sub: 'කොටු 25 · ඉක්මන් පුහුණුව' },
    { value: 10, label: '10 × 10 වගුව', sub: 'කොටු 100 · සම්පූර්ණ දැලිස' },
];

const shuffle = (list) => {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const range = (min, max) => {
    const out = [];
    for (let n = min; n <= max; n += 1) out.push(n);
    return out;
};

const buildSignedPool = (count, maxAbs) => {
    const negCount = Math.ceil(count / 2);
    const posCount = count - negCount;
    const negs = shuffle(range(2, maxAbs)).slice(0, negCount).map((n) => -n);
    const poss = shuffle(range(2, maxAbs)).slice(0, posCount);
    return shuffle([...negs, ...poss]);
};

const generateBoard = (modeId, size) => {
    let rows = [];
    let cols = [];

    if (modeId === 'add') {
        const pool = range(2, size === 5 ? 15 : 19);
        rows = shuffle(pool).slice(0, size);
        cols = shuffle(pool).slice(0, size);
    } else if (modeId === 'sub') {
        const rowPool = range(13, size === 5 ? 25 : 30);
        const colPool = range(2, size === 5 ? 11 : 12);
        rows = shuffle(rowPool).slice(0, size);
        cols = shuffle(colPool).slice(0, size);
    } else if (modeId === 'mul') {
        const pool = range(2, 12);
        rows = shuffle(pool).slice(0, size);
        cols = shuffle(pool).slice(0, size);
    } else if (modeId === 'int_add') {
        rows = buildSignedPool(size, 14);
        cols = buildSignedPool(size, 14);
    } else {
        rows = buildSignedPool(size, 11);
        cols = buildSignedPool(size, 11);
    }

    return { rows, cols };
};

const computeAnswer = (modeId, r, c) => {
    if (modeId === 'add' || modeId === 'int_add') return r + c;
    if (modeId === 'sub') return r - c;
    return r * c;
};

const formatSigned = (num, signed) => {
    if (!signed) return String(num);
    return num > 0 ? `+${num}` : String(num);
};

const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
};

const loadStoredStats = (storageKey) => {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return { bests: {}, history: [] };
        const parsed = JSON.parse(raw);
        return {
            bests: parsed?.bests || {},
            history: Array.isArray(parsed?.history) ? parsed.history : [],
        };
    } catch {
        return { bests: {}, history: [] };
    }
};

const StudentDalisa = () => {
    const { user } = useContext(AuthContext);
    const storageKey = `tutortrack_dalisa_v1_${user?.studentId || 'student'}`;

    const [modeId, setModeId] = useState('mul');
    const [size, setSize] = useState(5);
    const [status, setStatus] = useState('idle'); // 'idle' | 'playing' | 'finished'
    const [board, setBoard] = useState(() => generateBoard('mul', 5));
    const [answers, setAnswers] = useState({});
    const [elapsed, setElapsed] = useState(0);
    const [focusedKey, setFocusedKey] = useState(null);
    const [resultSummary, setResultSummary] = useState(null);
    const [stats, setStats] = useState(() => loadStoredStats(storageKey));

    const cellRefs = useRef({});

    const currentMode = MODES.find((m) => m.id === modeId) || MODES[0];
    const recordKey = `${modeId}_${size}`;
    const personalBest = stats.bests[recordKey] || null;
    const totalCells = size * size;

    // Timer effect while playing
    useEffect(() => {
        if (status !== 'playing') return undefined;
        const interval = setInterval(() => {
            setElapsed((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [status]);

    const handleSelectMode = (nextMode) => {
        setModeId(nextMode);
        setStatus('idle');
        setBoard(generateBoard(nextMode, size));
        setAnswers({});
        setElapsed(0);
        setResultSummary(null);
    };

    const handleSelectSize = (nextSize) => {
        setSize(nextSize);
        setStatus('idle');
        setBoard(generateBoard(modeId, nextSize));
        setAnswers({});
        setElapsed(0);
        setResultSummary(null);
    };

    const handleStart = () => {
        const freshBoard = generateBoard(modeId, size);
        setBoard(freshBoard);
        setAnswers({});
        setElapsed(0);
        setResultSummary(null);
        setStatus('playing');
        setTimeout(() => {
            cellRefs.current['0-0']?.focus();
        }, 40);
    };

    const handleCellChange = (rIdx, cIdx, rawValue) => {
        if (status !== 'playing') return;
        const cleaned = rawValue.replace(/[^0-9-]/g, '');
        if (!/^-?\d{0,4}$/.test(cleaned)) return;
        setAnswers((prev) => ({ ...prev, [`${rIdx}-${cIdx}`]: cleaned }));
    };

    const handleToggleMinus = () => {
        if (status !== 'playing' || !focusedKey) return;
        setAnswers((prev) => {
            const current = prev[focusedKey] || '';
            const nextVal = current.startsWith('-') ? current.slice(1) : `-${current}`;
            return { ...prev, [focusedKey]: nextVal };
        });
        cellRefs.current[focusedKey]?.focus();
    };

    const focusCellByCoords = (rIdx, cIdx) => {
        if (rIdx >= 0 && rIdx < size && cIdx >= 0 && cIdx < size) {
            cellRefs.current[`${rIdx}-${cIdx}`]?.focus();
        }
    };

    const handleKeyDown = (e, rIdx, cIdx) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const linearIndex = rIdx * size + cIdx + 1;
            if (linearIndex < totalCells) {
                const nextR = Math.floor(linearIndex / size);
                const nextC = linearIndex % size;
                focusCellByCoords(nextR, nextC);
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            focusCellByCoords(rIdx, cIdx + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            focusCellByCoords(rIdx, cIdx - 1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusCellByCoords(rIdx + 1, cIdx);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusCellByCoords(rIdx - 1, cIdx);
        }
    };

    const filledCount = Object.values(answers).filter((v) => v !== '' && v !== '-').length;

    const handleFinish = () => {
        if (status !== 'playing') return;
        let correct = 0;

        for (let r = 0; r < size; r += 1) {
            for (let c = 0; c < size; c += 1) {
                const raw = (answers[`${r}-${c}`] || '').trim();
                const expected = computeAnswer(modeId, board.rows[r], board.cols[c]);
                if (raw !== '' && raw !== '-' && Number(raw) === expected) {
                    correct += 1;
                }
            }
        }

        const percentage = Math.round((correct / totalCells) * 100);
        const finalSeconds = Math.max(1, elapsed);

        const prevBest = stats.bests[recordKey];
        const isNewBest =
            !prevBest ||
            correct > prevBest.correct ||
            (correct === prevBest.correct && finalSeconds < prevBest.timeSeconds);

        const entry = {
            id: Date.now(),
            modeId,
            modeLabel: currentMode.label,
            size,
            correct,
            total: totalCells,
            percentage,
            timeSeconds: finalSeconds,
            date: new Date().toISOString(),
        };

        const updatedStats = {
            bests: {
                ...stats.bests,
                ...(isNewBest
                    ? {
                          [recordKey]: {
                              correct,
                              total: totalCells,
                              percentage,
                              timeSeconds: finalSeconds,
                          },
                      }
                    : {}),
            },
            history: [entry, ...stats.history].slice(0, 10),
        };

        setStats(updatedStats);
        try {
            localStorage.setItem(storageKey, JSON.stringify(updatedStats));
        } catch {
            // Ignore quota errors
        }

        setResultSummary({
            correct,
            total: totalCells,
            percentage,
            timeSeconds: finalSeconds,
            isNewBest: isNewBest && correct > 0,
        });
        setStatus('finished');
    };

    return (
        <div className="animate-fade-in space-y-6">
            <StudentPageHeader
                eyebrow="Speed Mathematics Trainer"
                title="දැලිස ගණිත පුහුණුව"
                description="ගණිත කර්ම සහ සදිශ සංඛ්‍යා වේගයෙන් හා නිවැරදිව සුළු කිරීමේ හැකියාව වර්ධනය කරගන්න."
            >
                <Link
                    to="/student"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                >
                    <span>←</span>
                    <span>මුල් පිටුව</span>
                </Link>
            </StudentPageHeader>

            {/* Mode & Size Selector Card */}
            <section className="app-card p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900">1. පුහුණු වර්ගය තෝරන්න</h2>
                        <p className="text-xs font-bold text-blue-700 mt-0.5">Choose Operation & Grid Size</p>
                    </div>
                    {personalBest && (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
                            <span>🏆</span>
                            <span>
                                හොඳම වාර්තාව: {personalBest.correct}/{personalBest.total} ({formatDuration(personalBest.timeSeconds)})
                            </span>
                        </div>
                    )}
                </div>

                {/* Operation Pills */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                    {MODES.map((m) => {
                        const active = m.id === modeId;
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => handleSelectMode(m.id)}
                                className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${
                                    active
                                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-1 ring-blue-600/20'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <span
                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black ${
                                        active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    {m.symbol}
                                </span>
                                <span className="mt-2 text-xs sm:text-sm font-extrabold leading-snug">{m.label}</span>
                                <span className="text-[11px] font-medium text-slate-500">{m.sub}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Grid Size & Start Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                        {SIZES.map((s) => {
                            const active = s.value === size;
                            return (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => handleSelectSize(s.value)}
                                    className={`rounded-xl border px-4 py-2.5 text-left transition ${
                                        active
                                            ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <p className="text-xs font-extrabold">{s.label}</p>
                                    <p className={`text-[10px] font-medium ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                                        {s.sub}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        onClick={handleStart}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
                    >
                        <span>{status === 'idle' ? '▶ ආරම්භ කරන්න (Start)' : '🔄 අලුත් වගුවක් (New Grid)'}</span>
                    </button>
                </div>

                <p className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs font-semibold text-slate-600">
                    💡 {currentMode.hint}
                </p>
            </section>

            {/* Result Summary Banner (when finished) */}
            {status === 'finished' && resultSummary && (
                <section className="rounded-2xl border border-blue-200 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-5 sm:p-6 text-white shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-300">
                                    ප්‍රතිඵල සාරාංශය · Result Summary
                                </span>
                                {resultSummary.isNewBest && (
                                    <span className="rounded-full bg-amber-400/20 border border-amber-300/40 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-200">
                                        🏆 නව වාර්තාවක්!
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 flex flex-wrap items-baseline gap-4">
                                <p className="text-3xl sm:text-4xl font-black text-white">
                                    {resultSummary.correct} / {resultSummary.total}
                                </p>
                                <span className="rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-sm font-extrabold text-emerald-300">
                                    {resultSummary.percentage}% නිවැරදියි
                                </span>
                                <span className="text-sm font-mono font-bold text-blue-200">
                                    ⏱ කාලය: {formatDuration(resultSummary.timeSeconds)}
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleStart}
                            className="rounded-xl bg-white px-5 py-2.5 text-xs font-extrabold text-blue-900 shadow-sm transition hover:bg-blue-50 self-start sm:self-center"
                        >
                            🔄 නැවත උත්සාහ කරන්න
                        </button>
                    </div>
                </section>
            )}

            {/* Main Dalisa Grid Section */}
            <section className="app-card overflow-hidden">
                {/* Live Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3.5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-mono font-black text-slate-900 shadow-2xs">
                            <span>⏱</span>
                            <span>{formatDuration(elapsed)}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                            පුරවා ඇත: <strong className="text-blue-700">{filledCount}</strong> / {totalCells}
                        </span>
                    </div>

                    {status === 'playing' && (
                        <div className="flex items-center gap-2">
                            {currentMode.signed && (
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={handleToggleMinus}
                                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-700 shadow-2xs transition hover:bg-indigo-100 active:scale-95"
                                    title="ඍණ (−) හෝ ධන (+) ලකුණ මාරු කරන්න"
                                >
                                    ± ඍණ ලකුණ (−)
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleFinish}
                                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
                            >
                                ✓ පිළිතුරු පරීක්ෂා කරන්න
                            </button>
                        </div>
                    )}
                </div>

                {/* Grid Area */}
                <div className="p-4 sm:p-6">
                    {status === 'idle' ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-12 text-center">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 mb-3">
                                <Icon name="dalisa" size={26} />
                            </span>
                            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                                {currentMode.label} ({size} × {size}) වගුව සූදානම්!
                            </h3>
                            <p className="mt-1 max-w-md text-xs sm:text-sm font-medium text-slate-500">
                                ඔබ සූදානම් වූ විට ඉහළ හෝ පහළ ඇති <strong>&ldquo;ආරම්භ කරන්න&rdquo;</strong> බොත්තම ඔබන්න. එවිට කාල ගණනය ආරම්භ වී අහඹු සංඛ්‍යා වගුව විවෘත වේ.
                            </p>
                            <button
                                type="button"
                                onClick={handleStart}
                                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
                            >
                                ▶ ආරම්භ කරන්න (Start Timer)
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto pb-2">
                            <table className="mx-auto border-separate border-spacing-1.5">
                                <thead>
                                    <tr>
                                        <th className="h-11 w-12 sm:h-12 sm:w-14 rounded-xl bg-blue-600 text-center text-base sm:text-lg font-black text-white shadow-2xs">
                                            {currentMode.symbol}
                                        </th>
                                        {board.cols.map((colVal, cIdx) => (
                                            <th
                                                key={`col-${cIdx}`}
                                                className="h-11 min-w-[52px] sm:h-12 sm:min-w-[60px] rounded-xl border border-blue-200 bg-blue-50 px-2 text-center font-mono text-xs sm:text-sm font-extrabold text-blue-900"
                                            >
                                                {formatSigned(colVal, currentMode.signed)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {board.rows.map((rowVal, rIdx) => (
                                        <tr key={`row-${rIdx}`}>
                                            <th className="h-11 min-w-[52px] sm:h-12 sm:min-w-[60px] rounded-xl border border-blue-200 bg-blue-50 px-2 text-center font-mono text-xs sm:text-sm font-extrabold text-blue-900">
                                                {formatSigned(rowVal, currentMode.signed)}
                                            </th>
                                            {board.cols.map((colVal, cIdx) => {
                                                const cellKey = `${rIdx}-${cIdx}`;
                                                const val = answers[cellKey] ?? '';
                                                const expected = computeAnswer(modeId, rowVal, colVal);
                                                const trimmed = val.trim();
                                                const isCorrect =
                                                    trimmed !== '' && trimmed !== '-' && Number(trimmed) === expected;

                                                if (status === 'finished') {
                                                    return (
                                                        <td
                                                            key={cellKey}
                                                            className={`h-11 min-w-[52px] sm:h-12 sm:min-w-[60px] rounded-xl border px-1.5 text-center font-mono transition ${
                                                                isCorrect
                                                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                                                    : 'border-rose-300 bg-rose-50 text-rose-800'
                                                            }`}
                                                        >
                                                            {isCorrect ? (
                                                                <span className="text-xs sm:text-sm font-extrabold">
                                                                    {expected}
                                                                </span>
                                                            ) : (
                                                                <div className="leading-tight py-0.5">
                                                                    <div className="text-[10px] line-through text-rose-500">
                                                                        {trimmed || '—'}
                                                                    </div>
                                                                    <div className="text-xs font-black text-rose-800">
                                                                        {expected}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                }

                                                return (
                                                    <td key={cellKey} className="p-0">
                                                        <input
                                                            ref={(el) => {
                                                                cellRefs.current[cellKey] = el;
                                                            }}
                                                            type="text"
                                                            inputMode={currentMode.signed ? 'text' : 'numeric'}
                                                            value={val}
                                                            onFocus={() => setFocusedKey(cellKey)}
                                                            onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(e, rIdx, cIdx)}
                                                            aria-label={`Row ${rowVal} ${currentMode.symbol} Column ${colVal}`}
                                                            className="h-11 w-[52px] sm:h-12 sm:w-[60px] rounded-xl border border-slate-300 bg-white text-center font-mono text-xs sm:text-sm font-extrabold text-slate-900 transition focus:border-blue-600 focus:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                                        />
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {status === 'playing' && (
                        <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={handleFinish}
                                className="w-full sm:w-auto rounded-xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95"
                            >
                                ✓ පිළිතුරු පරීක්ෂා කර ලකුණු බලන්න
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Practice History */}
            {stats.history.length > 0 && (
                <section className="app-card p-5 sm:p-6">
                    <div className="border-b border-slate-100 pb-3 mb-4">
                        <h3 className="text-base font-extrabold text-slate-900">මෑත පුහුණු වාර්තා</h3>
                        <p className="text-xs font-bold text-blue-700">Recent Practice Attempts (Saved on Device)</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {stats.history.slice(0, 6).map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5"
                            >
                                <div>
                                    <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                                        {item.modeLabel} · {item.size}×{item.size}
                                    </p>
                                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                        ⏱ {formatDuration(item.timeSeconds)} ·{' '}
                                        {new Date(item.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                                        item.percentage >= 80
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : item.percentage >= 50
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-rose-100 text-rose-800'
                                    }`}
                                >
                                    {item.correct}/{item.total} ({item.percentage}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default StudentDalisa;
