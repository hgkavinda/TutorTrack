import { useState, useEffect } from 'react';
import api from '../api/client';

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '', subject: '', assignedClass: '', description: '', fileUrl: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const classRes = await api.get('/classes');
            setClassesList(classRes.data.data);
            if (classRes.data.data.length > 0) {
                setFormData(f => ({ ...f, assignedClass: classRes.data.data[0]._id }));
            }

            const matRes = await api.get('/materials');
            setMaterials(matRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/materials', formData);
            setShowModal(false);
            setFormData({ title: '', subject: '', assignedClass: classesList[0]?._id, description: '', fileUrl: '' });
            fetchData();
        } catch {
            alert('Error creating material');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this material?')) {
            await api.delete(`/materials/${id}`);
            fetchData();
        }
    };

    if (loading) return <div className="p-4">Loading Materials...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="app-card flex items-center justify-between p-4 sm:p-5">
                <div><p className="page-eyebrow">අධ්‍යයන සම්පත්</p><h1 className="page-title mt-1">Study Materials</h1></div>
                <button onClick={() => setShowModal(true)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
                    + Add Material
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.length === 0 ? (
                    <div className="app-card col-span-full p-8 text-center"><p className="text-gray-500">No materials uploaded yet.</p></div>
                ) : (
                    materials.map((mat) => (
                        <div key={mat._id} className="app-card flex flex-col overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-800">{mat.title}</h3>
                                    <span className="text-xl">📄</span>
                                </div>
                                <p className="mb-2 text-xs font-semibold text-blue-600">{mat.subject} • {mat.assignedClass?.className}</p>
                                <p className="text-sm text-gray-600 line-clamp-3">{mat.description}</p>
                                <div className="mt-4 break-all">
                                    <a href={mat.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                                        {mat.fileUrl}
                                    </a>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 flex justify-between items-center">
                                <span className="text-xs text-gray-400">Added: {new Date(mat.createdAt).toLocaleDateString()}</span>
                                <button onClick={() => handleDelete(mat._id)} className="text-red-500 text-xs font-medium hover:underline">Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Upload Learning Material</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Share notes, tutes, and study resources with your class.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        {/* Scrollable Form Body */}
                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="materialForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Title</label>
                                    <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Combined Maths Integration Tute 01" className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Subject</label>
                                        <input type="text" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} placeholder="e.g. Combined Mathematics" className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Assign Class</label>
                                        <select required value={formData.assignedClass} onChange={e => setFormData({ ...formData, assignedClass: e.target.value })} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 bg-white">
                                            {classesList.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">File URL / Download Link</label>
                                    <input type="url" required value={formData.fileUrl} onChange={e => setFormData({ ...formData, fileUrl: e.target.value })} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20" placeholder="https://drive.google.com/..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Description</label>
                                    <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20" rows="3" placeholder="Brief instructions or summary..."></textarea>
                                </div>
                            </form>
                        </div>
                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="materialForm"
                                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition active:scale-95"
                            >
                                Save Material
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Materials;
