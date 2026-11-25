import { useState, useEffect, useContext } from 'react';
import api from '../api/client';
import { AuthContext } from '../context/AuthContextValue';
import StudentPageHeader from '../components/StudentPageHeader';
import Icon from '../components/Icon';
import BrandLogo from '../components/BrandLogo';

const StudentProfile = () => {
    const { user, changeStudentPassword, logout } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
    const [copiedId, setCopiedId] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get('/student-portal/profile');
                if (res.data?.success) {
                    setProfileData(res.data.data);
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load profile details');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleCopyId = () => {
        if (student?.studentId) {
            navigator.clipboard.writeText(student.studentId);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMsg({ text: '', type: '' });

        if (newPassword.length < 8) {
            setPasswordMsg({ text: 'නව මුරපදය සඳහා අවම වශයෙන් අකුරු/ඉලක්කම් 8ක් ඇතුළත් කරන්න.', type: 'error' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMsg({ text: 'නව මුරපද දෙක එකිනෙකට නොගැලපේ.', type: 'error' });
            return;
        }

        try {
            setPasswordLoading(true);
            await changeStudentPassword(currentPassword, newPassword);
            setPasswordMsg({ text: 'මුරපදය සාර්ථකව වෙනස් කරන ලදී! (Password updated successfully)', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMsg({ text: err.response?.data?.error || 'මුරපදය වෙනස් කිරීම අසාර්ථක විය.', type: 'error' });
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in space-y-6">
                <StudentPageHeader
                    eyebrow="Student Account"
                    title="මගේ ගිණුම"
                    description="තොරතුරු ලබාගනිමින් පවතී..."
                />
                <div className="app-card p-12 text-center text-slate-400 font-medium text-sm">
                    Loading profile information...
                </div>
            </div>
        );
    }

    if (error || !profileData) {
        return (
            <div className="animate-fade-in space-y-6">
                <StudentPageHeader
                    eyebrow="Student Account"
                    title="මගේ ගිණුම"
                    description="ගිණුම් තොරතුරු"
                />
                <div className="app-card border-rose-200 bg-rose-50 p-6 text-center text-rose-700 text-sm font-semibold rounded-2xl">
                    {error || 'Unable to load profile data.'}
                </div>
            </div>
        );
    }

    const { student, classes } = profileData;

    // Generate initials for avatar
    const initials = student.fullName
        ? student.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : 'ST';

    return (
        <div className="animate-fade-in space-y-6">
            <StudentPageHeader
                eyebrow="Student Account & Profile"
                title="මගේ ගිණුම"
                description={`ශිෂ්‍ය තොරතුරු, ඩිජිටල් හැඳුනුම්පත සහ ගිණුම් ආරක්ෂාව · ${student.studentId}`}
            >
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Student
                    </span>
                </div>
            </StudentPageHeader>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 gap-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
                        activeTab === 'profile'
                            ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Icon name="user" size={17} />
                    <span>හැඳුනුම්පත සහ විස්තර (Profile & ID)</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
                        activeTab === 'security'
                            ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                >
                    <Icon name="settings" size={17} />
                    <span>ආරක්ෂාව සහ මුරපදය (Security)</span>
                </button>
            </div>

            {/* TAB 1: PROFILE & DIGITAL ID CARD */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* LEFT COLUMN: Digital Student ID Card */}
                    <div className="space-y-6">
                        {/* Digital Student Card */}
                        <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-xl shadow-blue-950/15">
                            {/* Background light glow */}
                            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl"></div>
                            <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl"></div>

                            {/* Card Header */}
                            <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 p-1 backdrop-blur-xs">
                                        <BrandLogo size="sm" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-extrabold tracking-wide uppercase text-blue-300">TutorTrack LMS</p>
                                        <p className="text-xs font-bold text-white leading-tight">Maths By HG Kavinda</p>
                                    </div>
                                </div>
                                <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                                    STUDENT ID
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="relative mt-5 flex items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-xl font-black text-white shadow-md border-2 border-white/20">
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="truncate text-lg font-black text-white tracking-tight">
                                        {student.fullName}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-1.5">
                                        <span className="font-mono text-sm font-extrabold tracking-wider text-blue-200">
                                            {student.studentId}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyId}
                                            title="Copy Student ID"
                                            className="rounded-md bg-white/10 p-1 text-slate-300 hover:bg-white/20 hover:text-white transition"
                                        >
                                            <span className="text-[10px] font-bold px-1">
                                                {copiedId ? '✓ Copied' : 'Copy'}
                                            </span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-blue-200/80 mt-0.5 font-medium">
                                        Grade {student.grade} · Academic Year {student.academicYear}
                                    </p>
                                </div>
                            </div>

                            {/* QR Code / Attendance Scan Block */}
                            <div className="relative mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs text-center">
                                <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                                    Attendance Scan Code
                                </p>
                                {/* High-Contrast SVG QR Representation */}
                                <div className="mx-auto my-3 flex h-28 w-28 items-center justify-center rounded-xl bg-white p-2 shadow-inner">
                                    <svg viewBox="0 0 100 100" className="h-full w-full">
                                        {/* Corner Markers */}
                                        <rect x="5" y="5" width="28" height="28" fill="#0f172a" rx="4" />
                                        <rect x="9" y="9" width="20" height="20" fill="#ffffff" rx="2" />
                                        <rect x="13" y="13" width="12" height="12" fill="#0f172a" rx="1" />

                                        <rect x="67" y="5" width="28" height="28" fill="#0f172a" rx="4" />
                                        <rect x="71" y="9" width="20" height="20" fill="#ffffff" rx="2" />
                                        <rect x="75" y="13" width="12" height="12" fill="#0f172a" rx="1" />

                                        <rect x="5" y="67" width="28" height="28" fill="#0f172a" rx="4" />
                                        <rect x="9" y="71" width="20" height="20" fill="#ffffff" rx="2" />
                                        <rect x="13" y="75" width="12" height="12" fill="#0f172a" rx="1" />

                                        {/* Data Grid Mock Pattern */}
                                        <rect x="38" y="10" width="8" height="8" fill="#0f172a" />
                                        <rect x="50" y="14" width="10" height="6" fill="#0f172a" />
                                        <rect x="38" y="24" width="6" height="12" fill="#0f172a" />
                                        <rect x="48" y="26" width="12" height="8" fill="#0f172a" />

                                        <rect x="10" y="38" width="14" height="8" fill="#0f172a" />
                                        <rect x="28" y="40" width="8" height="12" fill="#0f172a" />
                                        <rect x="14" y="50" width="10" height="10" fill="#0f172a" />

                                        {/* Center Core */}
                                        <rect x="42" y="42" width="16" height="16" fill="#2563eb" rx="2" />
                                        <rect x="46" y="46" width="8" height="8" fill="#ffffff" rx="1" />

                                        <rect x="66" y="38" width="10" height="8" fill="#0f172a" />
                                        <rect x="80" y="42" width="12" height="10" fill="#0f172a" />
                                        <rect x="68" y="52" width="8" height="10" fill="#0f172a" />

                                        <rect x="38" y="66" width="10" height="8" fill="#0f172a" />
                                        <rect x="52" y="70" width="8" height="12" fill="#0f172a" />
                                        <rect x="40" y="78" width="14" height="12" fill="#0f172a" />

                                        <rect x="68" y="68" width="8" height="10" fill="#0f172a" />
                                        <rect x="80" y="72" width="10" height="8" fill="#0f172a" />
                                        <rect x="74" y="84" width="14" height="8" fill="#0f172a" />
                                    </svg>
                                </div>
                                <p className="text-[10px] text-slate-300">
                                    පැමිණීම සටහන් කිරීමට මෙම QR code එක පන්තියේදී පෙන්වන්න.
                                </p>
                            </div>
                        </div>

                        {/* Quick Action Box */}
                        <div className="app-card p-5">
                            <h4 className="text-sm font-extrabold text-slate-900 mb-3">ක්ෂණික ක්‍රියා (Quick Actions)</h4>
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('security')}
                                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                                >
                                    <span className="flex items-center gap-2">
                                        <Icon name="settings" size={16} />
                                        මුරපදය වෙනස් කරන්න (Change Password)
                                    </span>
                                    <span>→</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="flex w-full items-center justify-between rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 lg:hidden"
                                >
                                    <span className="flex items-center gap-2">
                                        <Icon name="logout" size={16} />
                                        ගිණුමෙන් ඉවත් වන්න (Logout)
                                    </span>
                                    <span>→</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details & Enrolled Classes */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* 1. Personal & Academic Details */}
                        <div className="app-card p-5 sm:p-6">
                            <div className="border-b border-slate-100 pb-3 mb-4">
                                <h3 className="text-base font-extrabold text-slate-900">පෞද්ගලික සහ අධ්‍යයන තොරතුරු</h3>
                                <p className="text-xs font-bold text-blue-700">Personal & Academic Details</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">සම්පූර්ණ නම (Full Name)</p>
                                    <p className="mt-1 text-sm font-extrabold text-slate-900">{student.fullName}</p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ශිෂ්‍ය අංකය (Student ID)</p>
                                    <p className="mt-1 text-sm font-mono font-extrabold text-blue-700">{student.studentId}</p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ශ්‍රේණිය (Grade)</p>
                                    <p className="mt-1 text-sm font-extrabold text-slate-900">Grade {student.grade}</p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">අධ්‍යයන වර්ෂය (Academic Year)</p>
                                    <p className="mt-1 text-sm font-extrabold text-slate-900">{student.academicYear}</p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ස්ත්‍රී / පුරුෂ භාවය (Gender)</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">{student.gender || 'Not specified'}</p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">පන්තියට එක්වූ දිනය (Joined Date)</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">
                                        {student.joinedDate ? new Date(student.joinedDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                {student.address && (
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 sm:col-span-2">
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ලිපිනය (Address)</p>
                                        <p className="mt-1 text-sm font-medium text-slate-800">{student.address}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Guardian & Contact Info */}
                        <div className="app-card p-5 sm:p-6">
                            <div className="border-b border-slate-100 pb-3 mb-4">
                                <h3 className="text-base font-extrabold text-slate-900">දෙමාපිය / භාරකරු තොරතුරු</h3>
                                <p className="text-xs font-bold text-blue-700">Guardian & Emergency Contact</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">දෙමාපිය / භාරකරු නම</p>
                                    <p className="mt-1 text-sm font-extrabold text-slate-900">
                                        {student.parentName || 'සටහන් කර නොමැත'}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">දුරකථන අංකය (Contact Phone)</p>
                                    <div className="mt-1 flex items-center justify-between">
                                        <p className="text-sm font-mono font-extrabold text-slate-900">
                                            {student.parentPhone || 'සටහන් කර නොමැත'}
                                        </p>
                                        {student.parentPhone && (
                                            <a
                                                href={`tel:${student.parentPhone}`}
                                                className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-200 transition"
                                            >
                                                📞 Call
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {student.email && (
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 sm:col-span-2">
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">විද්‍යුත් තැපෑල (Email)</p>
                                        <p className="mt-1 text-sm font-medium text-slate-800">{student.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Enrolled Batches */}
                        <div className="app-card p-5 sm:p-6">
                            <div className="border-b border-slate-100 pb-3 mb-4">
                                <h3 className="text-base font-extrabold text-slate-900">සම්බන්ධ වී සිටින පන්ති</h3>
                                <p className="text-xs font-bold text-blue-700">Enrolled Batches & Timetable</p>
                            </div>

                            <div className="space-y-3">
                                {classes && classes.length > 0 ? (
                                    classes.map((c) => (
                                        <div
                                            key={c._id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-blue-50/50 hover:border-blue-200"
                                        >
                                            <div>
                                                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                                                    {c.className}
                                                </h4>
                                                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                                                    {c.subject} · {c.location || 'Online/Main Hall'} · {c.day}s
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-mono font-bold text-blue-800">
                                                    {c.startTime} - {c.endTime}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm font-medium text-slate-500">පන්ති සඳහා ලියාපදිංචි වී නොමැත.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="app-card p-6 sm:p-8">
                        <div className="border-b border-slate-100 pb-4 mb-6">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 mb-3">
                                <Icon name="settings" size={20} />
                            </span>
                            <h3 className="text-lg font-extrabold text-slate-900">මුරපදය වෙනස් කරන්න</h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                                ඔබගේ ගිණුමේ ආරක්ෂාව සඳහා ශක්තිමත් නව මුරපදයක් (Password) ඇතුළත් කරන්න.
                            </p>
                        </div>

                        {passwordMsg.text && (
                            <div
                                className={`rounded-xl p-3.5 text-xs font-bold mb-6 border ${
                                    passwordMsg.type === 'success'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}
                            >
                                {passwordMsg.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    දැනට පවතින මුරපදය (Current Password)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                                    >
                                        {showCurrentPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    නව මුරපදය (New Password)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimum 8 characters"
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                                    >
                                        {showNewPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">අවම වශයෙන් අකුරු හෝ ඉලක්කම් 8 ක් ඇතුළත් විය යුතුය.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    නව මුරපදය තහවුරු කරන්න (Confirm New Password)
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                                >
                                    {passwordLoading ? 'මුරපදය සුරකිමින් පවතී...' : 'මුරපදය යාවත්කාලීන කරන්න (Update Password)'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Session Box (Mobile/Tablet only - Desktop has header Logout) */}
                    <div className="app-card p-5 flex items-center justify-between border-rose-100 bg-rose-50/40 lg:hidden">
                        <div>
                            <h4 className="text-sm font-extrabold text-slate-900">ගිණුමෙන් ඉවත් වීම (Sign Out)</h4>
                            <p className="text-xs text-slate-500 mt-0.5">මෙම උපකරණයෙන් (Device) ඔබගේ ගිණුමෙන් ආරක්ෂිතව ඉවත් වන්න.</p>
                        </div>
                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-50 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
