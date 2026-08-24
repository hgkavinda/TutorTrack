import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContextValue';
import api from '../api/client';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMsg({ text: 'Updating...', type: 'info' });
        try {
            await api.put('/auth/change-password', formData); // We named it change-password but it updates profile details primarily now
            setStatusMsg({ text: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
        } catch {
            setStatusMsg({ text: 'Error updating profile', type: 'error' });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div><p className="page-eyebrow">Settings</p><h1 className="page-title mt-1">Teacher Profile</h1></div>

            <div className="app-card p-6 md:p-8">
                <div className="flex items-center space-x-6 mb-8 border-b border-gray-100 pb-8">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-4xl font-bold text-blue-700 shadow-sm">
                        {user?.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                        <p className="text-gray-500">Administrator</p>
                    </div>
                </div>

                {statusMsg.text && (
                    <div className={`p-3 rounded-lg text-sm font-medium mb-6 text-center ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : statusMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        {statusMsg.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Login ID)</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                            readOnly
                        />
                        <p className="text-xs text-gray-400 mt-1">Email address cannot be changed currently.</p>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white shadow-sm transition-colors hover:bg-blue-700">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default Profile;
