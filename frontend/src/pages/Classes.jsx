import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const emptyForm = {
    className: '', location: '', contactNumber: '', subject: '', grade: '6',
    day: 'Monday', startTime: '', endTime: '', monthlyFee: '', description: '', status: 'active',
    feeDueRule: 'AfterSessions', feeDueAfterSessions: 4, feeDueDay: 10,
};

const Classes = () => {
    const grades = ['6', '7', '8', '9', '10', '11'];
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes');
            setClasses(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            const payload = {
                ...formData,
                monthlyFee: formData.monthlyFee === '' ? null : Number(formData.monthlyFee),
            };
            if (editingClass) await api.put(`/classes/${editingClass._id}`, payload);
            else await api.post('/classes', payload);
            setShowModal(false);
            setEditingClass(null);
            setFormData(emptyForm);
            fetchClasses();
        } catch (requestError) {
            setFormError(requestError.response?.data?.error || `Error ${editingClass ? 'updating' : 'creating'} class`);
        }
    };

    const openCreate = () => {
        setEditingClass(null);
        setFormData(emptyForm);
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (classItem) => {
        setEditingClass(classItem);
        setFormData({
            className: classItem.className || '', location: classItem.location || '',
            contactNumber: classItem.contactNumber || '', subject: classItem.subject || '',
            grade: classItem.grade || '6', day: classItem.day || 'Monday',
            startTime: classItem.startTime || '', endTime: classItem.endTime || '',
            monthlyFee: classItem.monthlyFee ?? '', description: classItem.description || '',
            status: classItem.status || 'active',
            feeDueRule: classItem.feeDueRule || 'AfterSessions',
            feeDueAfterSessions: classItem.feeDueAfterSessions || 4,
            feeDueDay: classItem.feeDueDay || 10,
        });
        setFormError('');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await api.delete(`/classes/${id}`);
                fetchClasses();
            } catch {
                alert('Error deleting class');
            }
        }
    };

    if (loading) return <div className="p-4">Loading Classes...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="app-card flex items-center justify-between p-4 sm:p-5">
                <div><p className="page-eyebrow">පන්ති කළමනාකරණය</p><h1 className="page-title mt-1">Class Management</h1></div>
                <button
                    onClick={openCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                    + Add New Class
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.length === 0 ? (
                    <div className="app-card col-span-full p-8 text-center">
                        <p className="text-gray-500">No classes found. Create one to get started.</p>
                    </div>
                ) : (
                    classes.map((cls) => (
                        <div key={cls._id} className="app-card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
                            <div className="bg-blue-50 p-4 border-b border-blue-100">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-blue-900">{cls.className}</h3>
                                    <span className="bg-white border border-blue-200 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                                        {cls.status}
                                    </span>
                                </div>
                                <p className="text-sm text-blue-700 mt-1">{cls.subject} • Grade {cls.grade}</p>
                                <p className="text-xs font-mono text-blue-800 mt-2">{cls.classId || 'Legacy class — ID not assigned'}</p>
                            </div>
                            <div className="p-4 flex-1 space-y-3 relative">
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-5 mr-2">📍</span> {cls.location || 'Location not set'}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-5 mr-2">☎</span> {cls.contactNumber || 'Contact not set'}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-5 mr-2">📅</span> {cls.day}s
                                </div>
                                {(cls.startTime || cls.endTime) && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="w-5 mr-2">🕒</span> {cls.startTime || 'Not set'} - {cls.endTime || 'Not set'}
                                    </div>
                                )}
                                {cls.monthlyFee != null && (
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="w-5 mr-2">💰</span> Rs. {Number(cls.monthlyFee).toLocaleString()}/mo
                                    </div>
                                )}
                                <div className="flex items-center text-sm text-gray-600">
                                    <span className="w-5 mr-2">🎓</span> {cls.studentCount || 0} Students
                                </div>
                            </div>
                            <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-end space-x-2">
                                <Link to={`/classes/${cls._id}`} className="text-gray-700 hover:bg-white px-3 py-1.5 rounded text-sm font-medium">Open</Link>
                                <button
                                    onClick={() => openEdit(cls)}
                                    className="text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(cls._id)}
                                    className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in">
                        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                            <h2 className="font-bold text-lg">{editingClass ? 'Edit Class Details' : 'Create New Class'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-xl hover:text-blue-200">×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{formError}</div>}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Class Name</label>
                                    <input type="text" required value={formData.className} onChange={e => setFormData({ ...formData, className: e.target.value })} className="w-full border rounded-lg p-2 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                                    <input type="text" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Kandy Main Branch" className="w-full border rounded-lg p-2 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                                    <input type="tel" required value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} placeholder="e.g. 077 123 4567" className="w-full border rounded-lg p-2 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                                    <input type="text" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full border rounded-lg p-2 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Grade</label>
                                    <select required disabled={editingClass?.studentCount > 0} value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} className="w-full border disabled:bg-gray-100 rounded-lg p-2 text-sm focus:ring-2 outline-none focus:ring-blue-500">
                                        {grades.map(grade => <option key={grade} value={grade}>Grade {grade}</option>)}
                                    </select>
                                    {editingClass?.studentCount > 0 && <p className="text-xs text-amber-600 mt-1">End active enrollments before changing the grade.</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Day</label>
                                    <select value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })} className="w-full border rounded-lg p-2 text-sm focus:ring-2 outline-none py-2.5">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Monthly Fee (Rs.) <span className="text-gray-400">(optional)</span></label>
                                    <input type="number" min="0" value={formData.monthlyFee} onChange={e => setFormData({ ...formData, monthlyFee: e.target.value })} className="w-full border rounded-lg p-2 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Fee becomes due</label>
                                    <select value={formData.feeDueRule} onChange={e => setFormData({ ...formData, feeDueRule: e.target.value })} className="w-full border rounded-lg p-2 text-sm">
                                        <option value="AfterSessions">After completed classes</option>
                                        <option value="FixedDay">Fixed day of month</option>
                                        <option value="MonthStart">At the beginning of month</option>
                                    </select>
                                </div>
                                {formData.feeDueRule === 'AfterSessions' && <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Completed classes</label>
                                    <input type="number" min="1" max="12" value={formData.feeDueAfterSessions} onChange={e => setFormData({ ...formData, feeDueAfterSessions: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                                </div>}
                                {formData.feeDueRule === 'FixedDay' && <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Due day (1–28)</label>
                                    <input type="number" min="1" max="28" value={formData.feeDueDay} onChange={e => setFormData({ ...formData, feeDueDay: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                                </div>}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Time <span className="text-gray-400">(optional)</span></label>
                                    <input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full border rounded-lg p-2 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">End Time <span className="text-gray-400">(optional)</span></label>
                                    <input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="w-full border rounded-lg p-2 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                </div>
                                {editingClass && <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border rounded-lg p-2 text-sm">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>}
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">{editingClass ? 'Update Class' : 'Save Class'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classes;

