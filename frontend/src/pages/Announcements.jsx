import { useState, useEffect } from 'react';
import api from '../api/client';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '', message: '', targetClass: '', priorityLevel: 'Normal'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const classRes = await api.get('/classes');
            setClassesList(classRes.data.data);

            const annRes = await api.get('/announcements');
            setAnnouncements(annRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (payload.targetClass === '') payload.targetClass = null; // null means all classes

            await api.post('/announcements', payload);
            setShowModal(false);
            setFormData({ title: '', message: '', targetClass: '', priorityLevel: 'Normal' });
            fetchData();
        } catch {
            alert('Error creating announcement');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this announcement?')) {
            await api.delete(`/announcements/${id}`);
            fetchData();
        }
    };

    if (loading) return <div className="p-4">Loading Announcements...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="app-card flex items-center justify-between p-4 sm:p-5">
                <div><p className="page-eyebrow">දැනුම්දීම්</p><h1 className="page-title mt-1">Announcements</h1></div>
                <button onClick={() => setShowModal(true)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
                    + Create
                </button>
            </div>

            <div className="space-y-4">
                {announcements.length === 0 ? (
                    <div className="app-card p-8 text-center"><p className="text-gray-500">No announcements posted.</p></div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann._id} className="bg-white border-l-4 rounded-xl shadow-sm p-5 pr-12 relative" style={{ borderLeftColor: ann.priorityLevel === 'High' ? '#ef4444' : ann.priorityLevel === 'Normal' ? '#3b82f6' : '#94a3b8' }}>
                            <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-800">{ann.title}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ann.priorityLevel === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{ann.priorityLevel} Priority</span>
                                {ann.targetClass && <span className="text-xs px-2 py-0.5 rounded border text-gray-600 border-gray-200">For: {ann.targetClass.className}</span>}
                            </div>
                            <p className="text-gray-700 whitespace-pre-line">{ann.message}</p>
                            <p className="text-xs text-gray-400 mt-4">Posted on {new Date(ann.createdAt).toLocaleString()}</p>
                            <button onClick={() => handleDelete(ann._id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl font-bold p-2">×</button>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between bg-blue-600 p-4 text-white">
                            <h2 className="font-bold text-lg">Broadcast Announcement</h2>
                            <button onClick={() => setShowModal(false)} className="text-xl hover:text-green-200">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-green-500 outline-none focus:ring-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                                <textarea required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-green-500 outline-none focus:ring-2" rows="4"></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Target Class</label>
                                    <select value={formData.targetClass} onChange={e => setFormData({ ...formData, targetClass: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-green-500 outline-none focus:ring-2 bg-white">
                                        <option value="">All Classes (Broadcast)</option>
                                        {classesList.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                                    <select value={formData.priorityLevel} onChange={e => setFormData({ ...formData, priorityLevel: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-green-500 outline-none focus:ring-2 bg-white">
                                        <option value="Low">Low</option>
                                        <option value="Normal">Normal</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t space-x-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Send</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Announcements;
