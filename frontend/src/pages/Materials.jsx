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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between bg-blue-600 p-4 text-white">
                            <h2 className="font-bold text-lg">Upload Material</h2>
                            <button onClick={() => setShowModal(false)} className="text-xl hover:text-green-200">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-green-500 outline-none focus:ring-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                                <input type="text" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-green-500 outline-none focus:ring-2" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Assign Class</label>
                                <select required value={formData.assignedClass} onChange={e => setFormData({ ...formData, assignedClass: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-green-500 outline-none focus:ring-2 bg-white">
                                    {classesList.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">File URL / Download Link</label>
                                <input type="url" required value={formData.fileUrl} onChange={e => setFormData({ ...formData, fileUrl: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-green-500 outline-none focus:ring-2" placeholder="https://" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-green-500 outline-none focus:ring-2" rows="3"></textarea>
                            </div>
                            <div className="flex justify-end pt-4 border-t space-x-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200">Cancel</button>
                                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Materials;
