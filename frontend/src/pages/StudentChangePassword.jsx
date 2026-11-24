import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';
import BrandLogo from '../components/BrandLogo';

const StudentChangePassword = () => {
    const { changeStudentPassword, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setSaving(true);
        try {
            await changeStudentPassword(currentPassword, newPassword);
            navigate('/student');
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="student-background flex min-h-screen items-center justify-center p-4">
            <div className="animate-fade-in w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
                <BrandLogo size="lg" className="mb-4" />
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">පළමු පිවිසුම · First-Time Login</p>
                <h1 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">ඔබගේ Password එක සකසන්න</h1>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">Student Portal එකට පිවිසීමට පෙර ඔබගේ temporary password එක වෙනස් කර ආරක්ෂිත password එකක් ඇතුළත් කරන්න.</p>

                {error && <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl p-3 text-xs font-semibold mt-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 mt-5">
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">Temporary Password</label>
                        <input type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Enter temporary password" className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">අලුත් Password (New Password)</label>
                        <input type="password" minLength="8" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Minimum 8 characters" className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">අලුත් Password තහවුරු කරන්න (Confirm)</label>
                        <input type="password" minLength="8" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter new password" className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                    </div>
                    <button disabled={saving} className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition active:scale-95 disabled:bg-slate-300">
                        {saving ? 'Password වෙනස් කරමින්...' : 'Password වෙනස් කර ඉදිරියට යන්න →'}
                    </button>
                    <button type="button" onClick={logout} className="w-full py-1 text-xs font-semibold text-slate-500 hover:text-slate-800">Cancel & Logout</button>
                </form>
            </div>
        </div>
    );
};

export default StudentChangePassword;
