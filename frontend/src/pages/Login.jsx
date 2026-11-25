import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';
import api from '../api/client';
import BrandLogo from '../components/BrandLogo';

const toWhatsAppDigits = (raw) => {
    if (!raw) return '';
    const digits = String(raw).replace(/\D/g, '');
    if (!digits || digits === '1234567890') return '';
    if (digits.startsWith('0') && digits.length === 10) {
        return `94${digits.slice(1)}`;
    }
    if (digits.length === 9 && digits.startsWith('7')) {
        return `94${digits}`;
    }
    return digits;
};

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Forgot Password Modal State
    const [forgotOpen, setForgotOpen] = useState(false);
    const [resetStudentId, setResetStudentId] = useState('');
    const [resetError, setResetError] = useState('');
    const [requestSent, setRequestSent] = useState(false);
    const [contactInfo, setContactInfo] = useState({ teacherName: 'Sir HG Kavinda', phoneNumber: '' });

    const passwordInputRef = useRef(null);
    const { login, user, role } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(role === 'student' ? (user.mustChangePassword ? '/student/change-password' : '/student') : '/');
        }
    }, [user, role, navigate]);

    const openForgotModal = async () => {
        const trimmed = identifier.trim();
        if (trimmed && !trimmed.includes('@')) {
            setResetStudentId(trimmed.toUpperCase());
        }
        setResetError('');
        setRequestSent(false);
        setForgotOpen(true);
        try {
            const res = await api.get('/auth/public-contact');
            if (res.data?.success && res.data?.data) {
                setContactInfo(res.data.data);
            }
        } catch {
            // Keep default contact info if offline
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const result = await login(identifier, password);
            navigate(result.role === 'student'
                ? (result.mustChangePassword ? '/student/change-password' : '/student')
                : '/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid User ID or password');
        } finally {
            setSubmitting(false);
        }
    };

    const buildWhatsAppUrl = (studentIdValue) => {
        const waDigits = toWhatsAppDigits(contactInfo.phoneNumber);
        const msg = `හෙලෝ සර්, මගේ TutorTrack ශිෂ්‍ය ගිණුමේ (Student ID: ${studentIdValue}) මුරපදය අමතක වී ඇත. කරුණාකර මට නව තාවකාලික මුරපදයක් (Temporary Password) ලබා දෙන්න.`;
        return waDigits
            ? `https://wa.me/${waDigits}?text=${encodeURIComponent(msg)}`
            : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    };

    const handleSendWhatsApp = () => {
        const cleanedId = resetStudentId.trim().toUpperCase();
        if (!cleanedId) {
            setResetError('කරුණාකර ඔබේ ශිෂ්‍ය අංකය (Student ID) ඇතුළත් කරන්න.');
            return;
        }
        setResetError('');
        setResetStudentId(cleanedId);
        const url = buildWhatsAppUrl(cleanedId);
        window.open(url, '_blank', 'noopener,noreferrer');
        setRequestSent(true);
    };

    const handleBackToLogin = () => {
        const cleanedId = resetStudentId.trim().toUpperCase();
        if (cleanedId) {
            setIdentifier(cleanedId);
        }
        setForgotOpen(false);
        setRequestSent(false);
        setTimeout(() => {
            passwordInputRef.current?.focus();
        }, 50);
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#edf2fb] via-[#f6f8fc] to-[#e8eeff] px-4 py-8">
            {/* Main Login Card */}
            <div className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_24px_64px_-12px_rgba(15,23,42,0.11)] backdrop-blur-xl">
                {/* Top Brand Accent Line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />

                <div className="p-6 sm:p-8">
                    <div className="text-center mb-7">
                        <BrandLogo size="xl" className="mx-auto mb-3.5" />
                        <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-blue-700">
                            Grade 6 – 11 · Mathematics
                        </span>
                        <h1 className="mt-2.5 text-2xl sm:text-[27px] font-extrabold tracking-tight text-slate-900 leading-tight">
                            Maths By HG Kavinda
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
                            ශිෂ්‍ය ඉගෙනුම් ද්වාරය · Learning Portal
                        </p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold mb-5 text-center border border-rose-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                User ID / ශිෂ්‍ය අංකය
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21a8 8 0 0 0-16 0" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    autoComplete="username"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
                                    placeholder="e.g. STU001"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                                    මුරපදය / Password
                                </label>
                                <button
                                    type="button"
                                    onClick={openForgotModal}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    ref={passwordInputRef}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-11 py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
                        >
                            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
                            {!submitting && (
                                <span className="transition-transform group-hover:translate-x-0.5">→</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Subtle Footer */}
            <p className="relative z-10 mt-6 text-center text-[11px] font-semibold text-slate-400">
                © {new Date().getFullYear()} Maths By HG Kavinda · TutorTrack LMS
            </p>

            {/* Forgot Password Modal */}
            {forgotOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
                    onClick={() => setForgotOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                            <div>
                                <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                                    Password Recovery
                                </p>
                                <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                                    {requestSent ? 'WhatsApp වෙත යොමු විය!' : 'මුරපදය අමතක වුණාද?'}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForgotOpen(false)}
                                className="rounded-xl border border-slate-200 p-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                            >
                                ✕
                            </button>
                        </div>

                        {requestSent ? (
                            <div className="mt-5 space-y-4 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-black text-emerald-700">
                                    ✓
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-sm font-extrabold text-slate-900">
                                        Student ID: <span className="font-mono text-blue-700">{resetStudentId}</span>
                                    </p>
                                    <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                                        විවෘත වූ WhatsApp පණිවිඩය ගුරුතුමා වෙත යවන්න. ගුරුතුමා එවන <strong>Temporary Password</strong> එක ලැබුණු පසු මෙතැනින් Sign In වන්න.
                                    </p>
                                    <p className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mt-2">
                                        ℹ️ පළමු පිවිසුමේදීම ඔබට කැමති නව මුරපදයක් සකසා ගැනීමට පද්ධතිය ඉඩ ලබාදෙයි.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleBackToLogin}
                                        className="w-full rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
                                    >
                                        හරි, Login පිටුවට යන්න
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSendWhatsApp}
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        WhatsApp විවෘත වුණේ නැත්නම් නැවත ඔබන්න
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-4">
                                <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                                    ඔබගේ ශිෂ්‍ය අංකය (Student ID) ඇතුළත් කර ගුරුතුමාට WhatsApp මගින් දැනුම් දෙන්න.
                                </p>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        ඔබේ ශිෂ්‍ය අංකය (Student ID)
                                    </label>
                                    <input
                                        type="text"
                                        value={resetStudentId}
                                        onChange={(e) => {
                                            setResetStudentId(e.target.value.toUpperCase());
                                            if (resetError) setResetError('');
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSendWhatsApp();
                                            }
                                        }}
                                        placeholder="උදා: STU001"
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                    />
                                    {resetError && (
                                        <p className="mt-1.5 text-xs font-bold text-rose-600">{resetError}</p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSendWhatsApp}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs sm:text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99]"
                                >
                                    <span>💬</span>
                                    <span>WhatsApp මගින් දැනුම් දෙන්න</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
