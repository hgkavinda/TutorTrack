import { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';
import api from '../api/client';
import BrandLogo from '../components/BrandLogo';

const getInitialAvatar = (photo) => {
    if (!photo || photo === 'default.jpg') {
        return '/teacher-photo.jpg';
    }
    return photo;
};

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    // Profile Details State
    const [name, setName] = useState(user?.name || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [avatarPreview, setAvatarPreview] = useState(getInitialAvatar(user?.profilePhoto));
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Sync state when user loads
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhoneNumber(user.phoneNumber || '');
            setAvatarPreview(getInitialAvatar(user.profilePhoto));
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setProfileMsg({ text: 'File size must be under 5MB.', type: 'error' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
            setProfileMsg({ text: 'New photo selected. Click "Save changes" to apply.', type: 'info' });
        };
        reader.readAsDataURL(file);
    };

    const handleResetAvatar = () => {
        setAvatarPreview('/teacher-photo.jpg');
        setProfileMsg({ text: 'Default avatar selected. Click "Save changes" to apply.', type: 'info' });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg({ text: '', type: '' });

        try {
            const res = await api.put('/auth/change-password', {
                name,
                phoneNumber,
                profilePhoto: avatarPreview,
            });
            setProfileMsg({ text: 'Profile changes saved successfully.', type: 'success' });
            if (setUser && res.data?.data) {
                setUser((prev) => ({ ...prev, ...res.data.data }));
            }
            setTimeout(() => setProfileMsg({ text: '', type: '' }), 3500);
        } catch (err) {
            setProfileMsg({
                text: err.response?.data?.error || 'Failed to update profile details.',
                type: 'error',
            });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMsg({ text: '', type: '' });

        if (newPassword.length < 6) {
            setPasswordMsg({ text: 'New password must be at least 6 characters long.', type: 'error' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
            return;
        }

        setPasswordLoading(true);

        try {
            await api.put('/auth/change-password', {
                currentPassword,
                newPassword,
            });

            setPasswordMsg({ text: 'Password updated successfully.', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordMsg({ text: '', type: '' }), 3500);
        } catch (err) {
            setPasswordMsg({
                text: err.response?.data?.error || 'Failed to update password. Current password is incorrect.',
                type: 'error',
            });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header Card (Matches Students, Classes, Fees) */}
            <div className="app-card flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <div>
                    <p className="page-eyebrow">ගුරු ගිණුම · Account Management</p>
                    <h1 className="page-title mt-1">Teacher Profile</h1>
                    <p className="page-copy mt-1">ඔබගේ පෞද්ගලික තොරතුරු, ඡායාරූපය සහ මුරපදය මෙතැනින් කළමනාකරණය කරන්න.</p>
                </div>
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                >
                    <span>←</span>
                    <span>Back to Dashboard</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* LEFT COLUMN: Educator Identity Card */}
                <div className="space-y-6">
                    <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-xl shadow-blue-950/15">
                        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-2xl"></div>
                        <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl"></div>

                        <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 p-1 backdrop-blur-xs">
                                    <BrandLogo size="sm" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-extrabold tracking-wide uppercase text-blue-300">TutorTrack</p>
                                    <p className="text-xs font-bold text-white leading-tight">ගුරු පාලක පුවරුව</p>
                                </div>
                            </div>
                            <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 border border-emerald-400/30">
                                EDUCATOR
                            </span>
                        </div>

                        <div className="relative mt-6 flex flex-col items-center text-center">
                            <img
                                src={avatarPreview}
                                alt={name || user?.name}
                                className="h-24 w-24 rounded-2xl object-cover object-top border-2 border-white/25 shadow-lg"
                                onError={(e) => {
                                    e.target.src = '/teacher-photo.jpg';
                                }}
                            />
                            <h2 className="mt-3.5 text-lg font-black tracking-tight text-white">
                                {name || user?.name || 'Teacher'}
                            </h2>
                            <p className="mt-0.5 text-xs font-medium text-blue-200">
                                {user?.email || 'teacher@tutortrack.com'}
                            </p>
                            {phoneNumber && (
                                <p className="mt-1 font-mono text-xs font-semibold text-slate-300">
                                    {phoneNumber}
                                </p>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                            />
                            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-xs border border-white/20 transition hover:bg-white/25"
                                >
                                    <span>📷</span>
                                    <span>Change Photo</span>
                                </button>
                                {avatarPreview !== '/teacher-photo.jpg' && (
                                    <button
                                        type="button"
                                        onClick={handleResetAvatar}
                                        className="rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-200 border border-rose-400/30 transition hover:bg-rose-500/30"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-[11px] text-slate-300/80">
                                JPG, PNG or WebP · Max 5MB
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Personal Info & Security Forms */}
                <div className="space-y-6 lg:col-span-2">
                    {/* 1. Personal Information Card */}
                    <form onSubmit={handleProfileSubmit} className="app-card overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                            <h2 className="text-base font-extrabold text-slate-900">පෞද්ගලික තොරතුරු</h2>
                            <p className="text-xs font-bold text-blue-700 mt-0.5">Personal Information</p>
                        </div>

                        <div className="p-5 sm:p-6 space-y-5">
                            {profileMsg.text && (
                                <div
                                    className={`rounded-xl p-3 text-xs font-bold border ${
                                        profileMsg.type === 'success'
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : profileMsg.type === 'info'
                                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                                            : 'bg-rose-50 text-rose-800 border-rose-200'
                                    }`}
                                >
                                    {profileMsg.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        සම්පූර්ණ නම (Full Name)
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Sir HG Kavinda"
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        දුරකථන අංකය (Phone / WhatsApp)
                                    </label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="e.g. 077 123 4567"
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    විද්‍යුත් තැපෑල · Email Address (Login ID)
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={user?.email || 'teacher@tutortrack.com'}
                                        disabled
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed pr-20"
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                        🔒 Fixed
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">
                            <button
                                type="submit"
                                disabled={profileLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                            >
                                {profileLoading ? 'සුරකිමින් පවතී...' : 'තොරතුරු සුරකින්න (Save Changes)'}
                            </button>
                        </div>
                    </form>

                    {/* 2. Password & Security Card */}
                    <form onSubmit={handlePasswordSubmit} className="app-card overflow-hidden">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                            <h2 className="text-base font-extrabold text-slate-900">මුරපදය වෙනස් කරන්න</h2>
                            <p className="text-xs font-bold text-blue-700 mt-0.5">Password & Security</p>
                        </div>

                        <div className="p-5 sm:p-6 space-y-4">
                            {passwordMsg.text && (
                                <div
                                    className={`rounded-xl p-3 text-xs font-bold border ${
                                        passwordMsg.type === 'success'
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : 'bg-rose-50 text-rose-800 border-rose-200'
                                    }`}
                                >
                                    {passwordMsg.text}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    දැනට පවතින මුරපදය (Current Password)
                                </label>
                                <div className="relative sm:max-w-md">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-14 text-sm font-medium text-slate-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                        required
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

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        නව මුරපදය (New Password)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min. 6 characters"
                                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-14 text-sm font-medium text-slate-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword((prev) => !prev)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                                        >
                                            {showNewPassword ? 'Hide' : 'Show'}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        මුරපදය තහවුරු කරන්න (Confirm Password)
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6">
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                            >
                                {passwordLoading ? 'යාවත්කාලීන කරමින්...' : 'මුරපදය යාවත්කාලීන කරන්න (Update Password)'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
