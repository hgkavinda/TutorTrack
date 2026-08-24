import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import StudentProfileModal from '../components/StudentProfileModal';

const currentYear = new Date().getFullYear();

const getInitialFormData = () => ({
    fullName: '',
    studentId: '',
    gender: 'Male',
    dateOfBirth: '',
    grade: '',
    academicYear: currentYear,
    assignedClasses: [],
    parentName: '',
    parentPhone: '',
    email: '',
    address: '',
});

const Students = () => {
    const [searchParams] = useSearchParams();
    const [students, setStudents] = useState([]);
    const [classesList, setClassesList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter
    const [selectedClassFilter, setSelectedClassFilter] = useState(searchParams.get('class') || '');
    const [gradeFilter, setGradeFilter] = useState('');
    const [search, setSearch] = useState('');

    // Form State
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(getInitialFormData);
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [credentialsCopied, setCredentialsCopied] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(searchParams.get('student'));
    const [formError, setFormError] = useState('');

    const fetchStudents = useCallback(async () => {
        try {
            let url = '/students';
            if (selectedClassFilter) url += `?assignedClass=${selectedClassFilter}`;

            const res = await api.get(url);
            setStudents(res.data.data);
        } catch (err) {
            console.error(err);
        }
    }, [selectedClassFilter]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const classRes = await api.get('/classes');
                setClassesList(classRes.data.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchClasses();
    }, []);

    useEffect(() => {
        const loadStudents = async () => {
            await fetchStudents();
            setLoading(false);
        };

        loadStudents();
    }, [fetchStudents]);

    const visibleStudents = students.filter((student) => {
        const query = search.trim().toLowerCase();
        const matchesSearch = !query || [student.fullName, student.studentId, student.parentPhone]
            .some((value) => String(value || '').toLowerCase().includes(query));
        return matchesSearch && (!gradeFilter || student.grade === gradeFilter);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            const payload = {
                ...formData,
                email: formData.email || undefined,
            };
            const response = await api.post('/students', payload);
            setShowModal(false);
            setFormData(getInitialFormData());
            setCreatedCredentials(response.data.credentials);
            setCredentialsCopied(false);
            fetchStudents();
        } catch (err) {
            setFormError(err.response?.data?.error || 'Error creating student');
        }
    };

    const toggleClass = (assignedClass) => {
        const selectedClass = classesList.find(
            (classItem) => classItem._id === assignedClass
        );
        const isSelected = formData.assignedClasses.includes(assignedClass);
        const assignedClasses = isSelected
            ? formData.assignedClasses.filter((classId) => classId !== assignedClass)
            : [...formData.assignedClasses, assignedClass];
        const remainingFirstClass = classesList.find(
            (classItem) => classItem._id === assignedClasses[0]
        );

        setFormData({
            ...formData,
            grade: isSelected ? (remainingFirstClass?.grade || '') : (selectedClass?.grade || ''),
            assignedClasses,
        });
    };

    const copyCredentials = async () => {
        if (!createdCredentials) return;

        const text = `TutorTrack Student Login\nUsername: ${createdCredentials.username}\nTemporary Password: ${createdCredentials.temporaryPassword}`;
        await navigator.clipboard.writeText(text);
        setCredentialsCopied(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await api.delete(`/students/${id}`);
                fetchStudents();
            } catch {
                alert('Error deleting student');
            }
        }
    };

    if (loading) return <div className="p-4">Loading Students...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="app-card flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <div><p className="page-eyebrow">ශිෂ්‍ය කළමනාකරණය</p><h1 className="page-title mt-1">Student Directory</h1></div>

                <div className="flex w-full sm:w-auto space-x-3">
                    <select
                        value={selectedClassFilter}
                        onChange={(e) => setSelectedClassFilter(e.target.value)}
                        className="flex-1 sm:w-48 border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:ring-2 outline-none focus:ring-blue-500"
                    >
                        <option value="">All Classes</option>
                        {classesList.map(c => (
                            <option key={c._id} value={c._id}>{c.className}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => { setFormError(''); setShowModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors whitespace-nowrap"
                    >
                        + Add Student
                    </button>
                </div>
            </div>

            <div className="app-card grid gap-3 p-3 sm:grid-cols-[1fr_180px]">
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, Student ID or phone..." className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                <select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)} className="border rounded-lg px-3 py-2.5 text-sm">
                    <option value="">All Grades</option>
                    {['6', '7', '8', '9', '10', '11'].map((grade) => <option key={grade} value={grade}>Grade {grade}</option>)}
                </select>
            </div>

            <div className="md:hidden space-y-3">
                {visibleStudents.map((student) => (
                    <button key={student._id} onClick={() => setSelectedStudentId(student._id)} className="w-full text-left bg-white border rounded-xl p-4 active:bg-blue-50">
                        <div className="flex items-start justify-between gap-3"><div className="flex gap-3"><div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">{student.fullName.charAt(0)}</div><div><p className="font-bold">{student.fullName}</p><p className="text-xs text-gray-500">{student.studentId} · Grade {student.grade}</p></div></div><span className="text-blue-700">View →</span></div>
                        <div className="flex flex-wrap gap-1 mt-3">{student.assignedClasses?.map((classItem) => <span key={classItem._id} className="bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-xs">{classItem.className}</span>)}</div>
                        {student.parentPhone && <p className="text-xs text-gray-500 mt-3">Guardian: {student.parentPhone}</p>}
                    </button>
                ))}
                {!visibleStudents.length && <div className="bg-white border rounded-xl p-8 text-center text-gray-500">No matching students.</div>}
            </div>

            <div className="app-card hidden overflow-hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                                <th className="px-6 py-4 font-semibold">Student</th>
                                <th className="px-6 py-4 font-semibold">Grade / Year</th>
                                <th className="px-6 py-4 font-semibold">Class</th>
                                <th className="px-6 py-4 font-semibold">Guardian Info</th>
                                <th className="px-6 py-4 font-semibold">Joined</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {visibleStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No students found. Add your first student to this class.
                                    </td>
                                </tr>
                            ) : (
                                visibleStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex flex-shrink-0 items-center justify-center font-bold mr-3">
                                                    {student.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{student.fullName}</p>
                                                    <p className="text-xs text-gray-500 text-mono">{student.studentId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <p className="font-semibold text-gray-800">Grade {student.grade || '—'}</p>
                                            <p className="text-xs text-gray-500">{student.academicYear || 'Year not set'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex flex-wrap gap-1">
                                                {student.assignedClasses?.length ? student.assignedClasses.map((classItem) => (
                                                    <span key={classItem._id} className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded text-xs font-semibold">
                                                        {classItem.className}
                                                    </span>
                                                )) : <span className="text-gray-400">Unassigned</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-800">{student.parentName}</p>
                                            <p className="text-xs text-gray-500">{student.parentPhone}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(student.joinedDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => setSelectedStudentId(student._id)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors text-sm font-medium">View / Edit</button>
                                            <button onClick={() => handleDelete(student._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors text-sm font-medium">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-zoom-in max-h-[90vh] flex flex-col">
                        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                            <h2 className="font-bold text-lg">Register New Student</h2>
                            <button onClick={() => setShowModal(false)} className="text-xl hover:text-blue-200">×</button>
                        </div>
                        <div className="overflow-y-auto p-6 flex-1">
                            <form id="studentForm" onSubmit={handleSubmit} className="space-y-4">
                                {formError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{formError}</div>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                        <input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Student ID</label>
                                        <input type="text" required value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Gender <span className="text-gray-400">(optional)</span></label>
                                        <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none py-3">
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth <span className="text-gray-400">(optional)</span></label>
                                        <input type="date" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 pt-2 border-t mt-2">
                                        <h4 className="text-sm font-bold text-gray-600 mb-1">Academic Information</h4>
                                        <p className="text-xs text-gray-500">The class controls attendance and fees. The grade is used for grade-wide performance ratings.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Academic Year</label>
                                        <input type="number" min="2000" max="2100" required value={formData.academicYear} onChange={e => setFormData({ ...formData, academicYear: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Assign Class</label>
                                        <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                                            {classesList.map((classItem) => {
                                                const disabled = Boolean(formData.grade && formData.grade !== classItem.grade);
                                                return (
                                                    <label key={classItem._id} className={`flex items-start gap-3 rounded-lg p-2 ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}`}>
                                                        <input type="checkbox" checked={formData.assignedClasses.includes(classItem._id)} disabled={disabled} onChange={() => toggleClass(classItem._id)} className="mt-1 accent-blue-600" />
                                                        <span>
                                                            <span className="block text-sm font-semibold text-gray-800">{classItem.className}</span>
                                                            <span className="block text-xs text-gray-500">Grade {classItem.grade} · {classItem.location || 'Location not set'} · {classItem.classId || 'No class ID'}</span>
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {formData.assignedClasses.length === 0 && <p className="text-xs text-red-500 mt-1">Select at least one class.</p>}
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Assigned Grade</label>
                                        <div className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 text-gray-700">
                                            {formData.grade ? `Grade ${formData.grade}` : 'Select a class to assign the grade automatically'}
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 pt-2 border-t mt-2">
                                        <h4 className="text-sm font-bold text-gray-600 mb-1">Additional Information <span className="font-normal text-gray-400">(optional)</span></h4>
                                        <p className="text-xs text-gray-500">These details can be completed later from the student profile.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Parent/Guardian Name</label>
                                        <input type="text" value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                                        <input type="tel" value={formData.parentPhone} onChange={e => setFormData({ ...formData, parentPhone: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-gray-400">(optional)</span></label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Home Address</label>
                                        <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500" rows="2"></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="bg-gray-50 p-4 shrink-0 flex justify-end space-x-3 border-t">
                            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-bold">Cancel</button>
                            <button type="submit" form="studentForm" disabled={formData.assignedClasses.length === 0} className="px-5 py-2 bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm">Save Student</button>
                        </div>
                    </div>
                </div>
            )}

            {createdCredentials && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-blue-600 p-5 text-white">
                            <h2 className="font-bold text-lg">Student Account Created</h2>
                            <p className="text-sm text-blue-100 mt-1">Give these login details to the student.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Username</p>
                                    <p className="font-mono text-lg font-bold text-gray-900">{createdCredentials.username}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Temporary Password</p>
                                    <p className="font-mono text-lg font-bold text-gray-900">{createdCredentials.temporaryPassword}</p>
                                </div>
                            </div>
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                This password is shown only once. The student will be required to change it after the first login.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
                            <button type="button" onClick={copyCredentials} className="px-4 py-2 text-blue-700 bg-white border border-blue-300 hover:bg-blue-50 rounded-lg text-sm font-bold">
                                {credentialsCopied ? 'Copied' : 'Copy Credentials'}
                            </button>
                            <button type="button" onClick={() => setCreatedCredentials(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedStudentId && (
                <StudentProfileModal
                    studentId={selectedStudentId}
                    classes={classesList}
                    onClose={() => setSelectedStudentId(null)}
                    onUpdated={fetchStudents}
                    onCredentials={(credentials) => {
                        setCreatedCredentials(credentials);
                        setCredentialsCopied(false);
                    }}
                />
            )}
        </div>
    );
};

export default Students;

