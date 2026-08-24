import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

const StudentProfileModal = ({ studentId, classes, onClose, onUpdated, onCredentials }) => {
    const [student, setStudent] = useState(null);
    const [summaries, setSummaries] = useState({ ratings: [], marks: [] });
    const [formData, setFormData] = useState(null);
    const [newClass, setNewClass] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadStudent = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/students/${studentId}`);
            const data = response.data.data.student;
            setStudent(data);
            setSummaries(response.data.data.summaries || { ratings: [], marks: [] });
            setFormData({
                fullName: data.fullName || '',
                studentId: data.studentId || '',
                gender: data.gender || 'Other',
                dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : '',
                parentName: data.parentName || '',
                parentPhone: data.parentPhone || '',
                email: data.email || '',
                address: data.address || '',
                academicYear: data.academicYear || new Date().getFullYear(),
                status: data.status || 'active',
                accountStatus: data.accountStatus || 'active',
            });
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to load student profile');
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        loadStudent();
    }, [loadStudent]);

    const saveProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await api.put(`/students/${studentId}`, {
                ...formData,
                email: formData.email || undefined,
                dateOfBirth: formData.dateOfBirth || null,
            });
            setMessage('Student profile updated');
            await loadStudent();
            onUpdated();
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to update student');
        } finally {
            setSaving(false);
        }
    };

    const addEnrollment = async () => {
        if (!newClass) return;
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await api.post(`/students/${studentId}/enrollments`, {
                assignedClass: newClass,
                startDate: new Date().toISOString(),
                reason: 'Additional class enrollment',
            });
            setNewClass('');
            setMessage('Class enrollment added');
            await loadStudent();
            onUpdated();
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to add class enrollment');
        } finally {
            setSaving(false);
        }
    };

    const endEnrollment = async (enrollmentId) => {
        if (!window.confirm('End this class enrollment? Attendance history will be preserved.')) return;
        setSaving(true);
        setError('');
        try {
            await api.put(`/students/${studentId}/enrollments/${enrollmentId}/end`, {
                endDate: new Date().toISOString(),
                reason: 'Enrollment ended by teacher',
            });
            setMessage('Enrollment ended');
            await loadStudent();
            onUpdated();
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to end enrollment');
        } finally {
            setSaving(false);
        }
    };

    const resetPassword = async () => {
        if (!window.confirm('Generate a new temporary password for this student?')) return;
        setSaving(true);
        setError('');
        try {
            const response = await api.post(`/students/${studentId}/reset-password`);
            onCredentials(response.data.credentials);
            setMessage('Temporary password generated');
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to reset password');
        } finally {
            setSaving(false);
        }
    };

    const activeEnrollments = student?.enrollments?.filter((item) => item.status === 'active') || [];
    const completedEnrollments = student?.enrollments?.filter((item) => item.status === 'completed') || [];
    const activeClassIds = new Set(activeEnrollments.map((item) => item.assignedClass?._id));
    const availableClasses = classes.filter(
        (classItem) => classItem.grade === student?.grade && !activeClassIds.has(classItem._id)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
                <div className="bg-green-600 p-4 flex items-center justify-between text-white">
                    <div>
                        <h2 className="font-bold text-lg">Student Profile</h2>
                        {student && <p className="text-xs text-green-100">{student.studentId} · Grade {student.grade}</p>}
                    </div>
                    <button onClick={onClose} className="text-2xl hover:text-green-200">×</button>
                </div>

                <div className="overflow-y-auto p-6 flex-1">
                    {loading ? (
                        <div className="py-12 text-center text-gray-500">Loading profile...</div>
                    ) : formData && (
                        <div className="space-y-7">
                            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                            {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

                            <form onSubmit={saveProfile} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-gray-800">Personal & Account Details</h3>
                                    <button type="button" onClick={resetPassword} disabled={saving} className="text-sm font-semibold text-amber-700 border border-amber-300 rounded-lg px-3 py-2 hover:bg-amber-50">
                                        Reset Password
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                                        <input required value={formData.fullName} onChange={(event) => setFormData({ ...formData, fullName: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Student ID / Username</label>
                                        <input required value={formData.studentId} onChange={(event) => setFormData({ ...formData, studentId: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
                                        <input type="number" min="2000" max="2100" required value={formData.academicYear} onChange={(event) => setFormData({ ...formData, academicYear: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                                        <input type="date" value={formData.dateOfBirth} onChange={(event) => setFormData({ ...formData, dateOfBirth: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Guardian Name</label>
                                        <input value={formData.parentName} onChange={(event) => setFormData({ ...formData, parentName: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Guardian Phone</label>
                                        <input value={formData.parentPhone} onChange={(event) => setFormData({ ...formData, parentPhone: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                        <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Student Status</label>
                                        <select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm">
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Login Account</label>
                                        <select value={formData.accountStatus} onChange={(event) => setFormData({ ...formData, accountStatus: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm">
                                            <option value="active">Active</option>
                                            <option value="disabled">Disabled</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                                        <textarea rows="2" value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button disabled={saving} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg text-sm font-bold">
                                        {saving ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>

                            {summaries.ratings?.length > 0 && (
                                <section className="border-t pt-6 space-y-4">
                                    <h3 className="font-bold text-gray-800">Performance Ratings</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {summaries.ratings.map((rating) => (
                                            <div key={rating._id} className="rounded-xl border border-green-100 bg-green-50 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-bold text-gray-800">{rating.subject}</p>
                                                        <p className="text-xs text-gray-500">Grade {rating.grade} · {rating.academicYear} · {rating.ratingStatus}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-green-700">{rating.overallRating}</p>
                                                        <p className="text-xs font-bold text-green-700">{rating.ratingGrade}</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                                    <span>Recent: <b>{rating.components?.recentPerformance}</b></span>
                                                    <span>Position: <b>{rating.components?.gradePosition}</b></span>
                                                    <span>Improvement: <b>{rating.components?.improvement}</b></span>
                                                    <span>Consistency: <b>{rating.components?.consistency}</b></span>
                                                </div>
                                                <p className={`text-xs font-bold mt-3 ${rating.change >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                    Change: {rating.change >= 0 ? '+' : ''}{rating.change}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className="border-t pt-6 space-y-4">
                                <h3 className="font-bold text-gray-800">Class Enrollments</h3>
                                <div className="space-y-2">
                                    {activeEnrollments.length === 0 ? (
                                        <p className="text-sm text-gray-500">No active class enrollments.</p>
                                    ) : activeEnrollments.map((enrollment) => (
                                        <div key={enrollment._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-lg p-3">
                                            <div>
                                                <p className="font-semibold text-gray-800">{enrollment.assignedClass?.className}</p>
                                                <p className="text-xs text-gray-500">{enrollment.assignedClass?.location || 'Location not set'} · Since {new Date(enrollment.startDate).toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={() => endEnrollment(enrollment._id)} disabled={saving} className="text-sm font-semibold text-red-600 border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50">
                                                End Enrollment
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <select value={newClass} onChange={(event) => setNewClass(event.target.value)} className="flex-1 border rounded-lg p-2.5 text-sm">
                                        <option value="">Add another Grade {student.grade} class</option>
                                        {availableClasses.map((classItem) => (
                                            <option key={classItem._id} value={classItem._id}>{classItem.className} — {classItem.location || 'Location not set'}</option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={addEnrollment} disabled={!newClass || saving} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg text-sm font-bold">
                                        Add Class
                                    </button>
                                </div>

                                {completedEnrollments.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-600 mb-2">Enrollment History</h4>
                                        <div className="space-y-2">
                                            {completedEnrollments.map((enrollment) => (
                                                <div key={enrollment._id} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                                                    <span className="font-semibold">{enrollment.assignedClass?.className}</span>
                                                    {' · '}
                                                    {new Date(enrollment.startDate).toLocaleDateString()} – {enrollment.endDate ? new Date(enrollment.endDate).toLocaleDateString() : 'Ended'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentProfileModal;
