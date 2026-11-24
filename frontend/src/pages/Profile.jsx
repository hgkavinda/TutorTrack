import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContextValue';
import api from '../api/client';

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
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Teacher Profile</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Manage your personal account details, profile picture, and login password.
                </p>
            </div>

            {/* Profile Information Card */}
            <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Update your photo, display name, and communication contact.</p>
                </div>

                <div className="p-6 space-y-6">
                    {profileMsg.text && (
                        <div
                            className={`rounded-xl p-3 text-xs font-semibold ${
                                profileMsg.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : profileMsg.type === 'info'
                                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                        >
                            {profileMsg.text}
                        </div>
                    )}

                    {/* Avatar Upload Row */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                            Profile Picture
                        </label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="relative h-20 w-20 flex-shrink-0">
                                <img
                                    src={avatarPreview}
                                    alt={user?.name}
                                    className="h-20 w-20 rounded-full object-cover object-top border-2 border-slate-200 shadow-sm"
                                    onError={(e) => {
                                        e.target.src = '/teacher-photo.jpg';
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/png, image/jpeg, image/webp"
                                    className="hidden"
                                />
                                <div className="flex items-center gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 transition"
                                    >
                                        <span>📷</span>
                                        <span>Upload new photo</span>
                                    </button>
                                    {avatarPreview !== '/teacher-photo.jpg' && (
                                        <button
                                            type="button"
                                            onClick={handleResetAvatar}
                                            className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400">
                                    JPG, PNG or WebP. Max file size: 5MB.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. HG Kavinda"
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Phone / WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="e.g. 077 123 4567"
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                Email Address (Login ID)
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={user?.email || 'teacher@tutortrack.com'}
                                    disabled
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                                />
                                <span className="absolute right-3.5 top-2.5 text-xs font-medium text-slate-400">
                                    🔒 Fixed
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-400">
                                This email address is used to sign in to the teacher portal.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                    >
                        {profileLoading ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </form>

            {/* Password & Security Card */}
            <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="text-base font-bold text-slate-900">Change Password</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Ensure your account is protected by using a strong password.</p>
                </div>

                <div className="p-6 space-y-5">
                    {passwordMsg.text && (
                        <div
                            className={`rounded-xl p-3 text-xs font-semibold ${
                                passwordMsg.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                        >
                            {passwordMsg.text}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full sm:max-w-md rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:max-w-2xl">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                required
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-95 disabled:opacity-50"
                    >
                        {passwordLoading ? 'Updating...' : 'Update password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
