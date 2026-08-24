import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';

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
            <div className="animate-fade-in w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(30,64,175,0.12)] sm:p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-blue-600 text-xl font-black text-white shadow-[0_7px_18px_rgba(37,99,235,0.25)]">T</div>
                <p className="text-sm font-semibold text-blue-700">පළමු Login · First Login</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">ඔබගේ Password එක සකසන්න</h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">Student Portal එකට පිවිසීමට පෙර temporary Password එක වෙනස් කරන්න.</p>

                {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm mt-5">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Temporary Password</label>
                        <input type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-xl border p-3 outline-none" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">අලුත් Password</label>
                        <input type="password" minLength="8" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-xl border p-3 outline-none" />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">අලුත් Password තහවුරු කරන්න</label>
                        <input type="password" minLength="8" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border p-3 outline-none" />
                    </div>
                    <button disabled={saving} className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-gray-300">
                        {saving ? 'Password වෙනස් කරමින්...' : 'Password වෙනස් කර ඉදිරියට යන්න'}
                    </button>
                    <button type="button" onClick={logout} className="w-full py-2 text-sm text-slate-500">Logout</button>
                </form>
            </div>
        </div>
    );
};

export default StudentChangePassword;
