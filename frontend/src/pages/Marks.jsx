import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const GRADES = ['6', '7', '8', '9', '10', '11'];
const EXAM_TYPES = [
    ['Weekly Test', 0.6],
    ['Monthly Exam', 1],
    ['Term Exam', 1.2],
    ['Model Paper', 1],
    ['Revision Test', 0.7],
    ['Assignment', 0.5],
];

const initialExam = () => ({
    name: '',
    type: 'Monthly Exam',
    grade: '6',
    subject: 'Mathematics',
    examDate: new Date().toISOString().slice(0, 10),
    totalMarks: 100,
    academicYear: new Date().getFullYear(),
});

const Marks = () => {
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedExam, setSelectedExam] = useState(null);
    const [roster, setRoster] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [examForm, setExamForm] = useState(initialExam);
    const [classFilter, setClassFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadExams = async () => {
        try {
            const response = await api.get('/marks/exams');
            setExams(response.data.data);
        } catch {
            setError('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExams();
    }, []);

    const openExam = async (examId) => {
        setSelectedExamId(examId);
        setClassFilter('');
        setError('');
        setMessage('');
        if (!examId) {
            setSelectedExam(null);
            setRoster([]);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/marks/exams/${examId}`);
            setSelectedExam(response.data.data.exam);
            setRoster(response.data.data.roster.map((item) => ({
                ...item,
                result: {
                    resultStatus: item.result.resultStatus || 'Pending',
                    marksObtained: item.result.marksObtained ?? '',
                    remarks: item.result.remarks || '',
                    percentage: item.result.percentage,
                    performanceGrade: item.result.performanceGrade,
                    gradeRank: item.result.gradeRank,
                    cohortSize: item.result.cohortSize,
                    percentile: item.result.percentile,
                    overallRating: item.result.overallRating,
                    ratingGrade: item.result.ratingGrade,
                    ratingChange: item.result.ratingChange,
                    ratingStatus: item.result.ratingStatus,
                },
            })));
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to load exam roster');
        } finally {
            setLoading(false);
        }
    };

    const createExam = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        try {
            const response = await api.post('/marks/exams', examForm);
            setShowCreate(false);
            setExamForm(initialExam());
            await loadExams();
            await openExam(response.data.data._id);
            setMessage('Exam created. Enter results and save as draft.');
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to create exam');
        } finally {
            setSaving(false);
        }
    };

    const updateResult = (studentId, updates) => {
        setRoster((current) => current.map((item) => (
            item.student._id === studentId
                ? { ...item, result: { ...item.result, ...updates } }
                : item
        )));
        setMessage('');
    };

    const buildResults = () => roster.map((item) => ({
        student: item.student._id,
        resultStatus: item.result.resultStatus,
        marksObtained: item.result.resultStatus === 'Completed'
            ? Number(item.result.marksObtained)
            : null,
        remarks: item.result.remarks,
    }));

    const saveDraft = async (showSuccess = true) => {
        if (!selectedExam) return false;
        setSaving(true);
        setError('');
        setMessage('');
        try {
            await api.put(`/marks/exams/${selectedExam._id}/results`, {
                results: buildResults(),
            });
            if (showSuccess) setMessage('Draft results saved');
            await openExam(selectedExam._id);
            return true;
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to save draft results');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const publishExam = async () => {
        if (!window.confirm('Publish this exam? Results will be locked and all student ratings will be recalculated.')) return;
        const saved = await saveDraft(false);
        if (!saved) return;

        setSaving(true);
        setError('');
        try {
            const response = await api.post(`/marks/exams/${selectedExam._id}/publish`);
            await loadExams();
            await openExam(selectedExam._id);
            setMessage(`Exam published. Ratings calculated for ${response.data.data.ratedStudents} students.`);
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to publish exam');
        } finally {
            setSaving(false);
        }
    };

    const availableClasses = useMemo(() => {
        const byId = new Map();
        roster.forEach((item) => item.assignedClasses.forEach((classItem) => {
            if (classItem) byId.set(classItem._id, classItem);
        }));
        return [...byId.values()];
    }, [roster]);

    const visibleRoster = classFilter
        ? roster.filter((item) => item.assignedClasses.some((classItem) => classItem?._id === classFilter))
        : roster;

    const completedCount = roster.filter((item) => item.result.resultStatus === 'Completed').length;
    const pendingCount = roster.filter((item) => item.result.resultStatus === 'Pending').length;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="page-eyebrow">ප්‍රගති ඇගයීම</p><h1 className="page-title mt-1">Exam Marks & Ratings</h1>
                    <p className="page-copy mt-2">Exams සාදන්න, ප්‍රතිඵල publish කර ශිෂ්‍ය performance ratings ගණනය කරන්න.</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold">
                    + Create Exam
                </button>
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

            <div className="app-card p-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Exam</label>
                <select value={selectedExamId} onChange={(event) => openExam(event.target.value)} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500">
                    <option value="">Select an exam</option>
                    {exams.map((exam) => (
                        <option key={exam._id} value={exam._id}>
                            {exam.name} — Grade {exam.grade} · {exam.type} · {new Date(exam.examDate).toLocaleDateString()} [{exam.status}]
                        </option>
                    ))}
                </select>
            </div>

            {loading && <div className="p-8 text-center text-gray-500">Loading...</div>}

            {selectedExam && !loading && (
                <>
                    <div className="app-card p-5">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-800">{selectedExam.name}</h2>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${selectedExam.status === 'Published' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {selectedExam.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedExam.examId} · Grade {selectedExam.grade} · {selectedExam.subject} · {selectedExam.type}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Total marks: {selectedExam.totalMarks} · Rating weight: {selectedExam.weight}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <div className="rounded-lg bg-green-50 px-4 py-2 text-center">
                                    <p className="text-xs text-green-700">Completed</p>
                                    <p className="font-bold text-green-800">{completedCount}</p>
                                </div>
                                <div className="rounded-lg bg-amber-50 px-4 py-2 text-center">
                                    <p className="text-xs text-amber-700">Pending</p>
                                    <p className="font-bold text-amber-800">{pendingCount}</p>
                                </div>
                            </div>
                        </div>
                        {availableClasses.length > 1 && (
                            <div className="mt-4 max-w-sm">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Filter by class/location</label>
                                <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="w-full border rounded-lg p-2 text-sm">
                                    <option value="">All Grade {selectedExam.grade} students</option>
                                    {availableClasses.map((classItem) => (
                                        <option key={classItem._id} value={classItem._id}>{classItem.className} — {classItem.location}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="app-card overflow-hidden">
                        {visibleRoster.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">No eligible students found for this grade.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1050px]">
                                    <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="text-left px-4 py-3">Student</th>
                                            <th className="text-left px-4 py-3">Status</th>
                                            <th className="text-left px-4 py-3">Marks / {selectedExam.totalMarks}</th>
                                            <th className="text-left px-4 py-3">Remark</th>
                                            {selectedExam.status === 'Published' && <th className="text-left px-4 py-3">Rating Result</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {visibleRoster.map((item) => (
                                            <tr key={item.student._id}>
                                                <td className="px-4 py-4">
                                                    <p className="font-semibold text-gray-800">{item.student.fullName}</p>
                                                    <p className="text-xs text-gray-500">{item.student.studentId}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <select disabled={selectedExam.status === 'Published'} value={item.result.resultStatus} onChange={(event) => updateResult(item.student._id, { resultStatus: event.target.value, marksObtained: event.target.value === 'Completed' ? item.result.marksObtained : '' })} className="border rounded-lg p-2 text-sm disabled:bg-gray-100">
                                                        <option value="Pending">Pending</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Absent">Absent</option>
                                                        <option value="Excused">Excused</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input data-mark-input="true" type="number" min="0" max={selectedExam.totalMarks} disabled={selectedExam.status === 'Published' || item.result.resultStatus !== 'Completed'} value={item.result.marksObtained} onChange={(event) => updateResult(item.student._id, { marksObtained: event.target.value })} onKeyDown={focusNextMark} className="w-28 border rounded-lg p-2 text-sm disabled:bg-gray-100" />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input disabled={selectedExam.status === 'Published'} value={item.result.remarks} onChange={(event) => updateResult(item.student._id, { remarks: event.target.value })} placeholder="Optional remark" className="w-full border rounded-lg p-2 text-sm disabled:bg-gray-100" />
                                                </td>
                                                {selectedExam.status === 'Published' && (
                                                    <td className="px-4 py-4">
                                                        {item.result.resultStatus === 'Completed' ? (
                                                            <div>
                                                                <p className="font-bold text-green-700">{item.result.overallRating} · {item.result.ratingGrade}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    Rank {item.result.gradeRank}/{item.result.cohortSize}
                                                                    {item.result.cohortSize >= 5 ? ` · Top ${Math.max(1, Math.round(100 - item.result.percentile))}%` : ' · Small cohort'}
                                                                </p>
                                                                <p className={`text-xs font-semibold ${item.result.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {item.result.ratingStatus} · {item.result.ratingChange >= 0 ? '+' : ''}{item.result.ratingChange}
                                                                </p>
                                                            </div>
                                                        ) : <span className="text-sm text-gray-400">{item.result.resultStatus}</span>}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {selectedExam.status === 'Draft' && (
                            <div className="sticky bottom-16 md:static z-10 border-t bg-gray-50 p-4 flex flex-col sm:flex-row justify-end gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.04)]">
                                <button onClick={() => saveDraft(true)} disabled={saving || roster.length === 0} className="border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:text-gray-400 px-5 py-2.5 rounded-lg text-sm font-bold">
                                    {saving ? 'Saving...' : 'Save Draft'}
                                </button>
                                <button onClick={publishExam} disabled={saving || roster.length === 0 || pendingCount > 0} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg text-sm font-bold">
                                    Publish & Calculate Ratings
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                            <div>
                                <h2 className="font-bold text-lg">Create Exam</h2>
                                <p className="text-xs text-blue-100">Exam type determines the rating weight.</p>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="text-2xl">×</button>
                        </div>
                        <form onSubmit={createExam} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Exam Name</label>
                                <input required value={examForm.name} onChange={(event) => setExamForm({ ...examForm, name: event.target.value })} placeholder="e.g. July Monthly Examination" className="w-full border rounded-lg p-2.5 text-sm" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Exam Type</label>
                                    <select value={examForm.type} onChange={(event) => setExamForm({ ...examForm, type: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm">
                                        {EXAM_TYPES.map(([type, weight]) => <option key={type} value={type}>{type} — weight {weight}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Grade</label>
                                    <select value={examForm.grade} onChange={(event) => setExamForm({ ...examForm, grade: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm">
                                        {GRADES.map((grade) => <option key={grade} value={grade}>Grade {grade}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                                    <input required value={examForm.subject} onChange={(event) => setExamForm({ ...examForm, subject: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Exam Date</label>
                                    <input type="date" required value={examForm.examDate} onChange={(event) => setExamForm({ ...examForm, examDate: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Total Marks</label>
                                    <input type="number" min="1" required value={examForm.totalMarks} onChange={(event) => setExamForm({ ...examForm, totalMarks: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
                                    <input type="number" min="2000" max="2100" required value={examForm.academicYear} onChange={(event) => setExamForm({ ...examForm, academicYear: event.target.value })} className="w-full border rounded-lg p-2.5 text-sm" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 border rounded-lg text-sm font-semibold">Cancel</button>
                                <button disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:bg-gray-300">Create Exam</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Marks;
    const focusNextMark = (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        const inputs = Array.from(document.querySelectorAll('[data-mark-input="true"]:not(:disabled)'));
        const index = inputs.indexOf(event.currentTarget);
        if (index >= 0 && inputs[index + 1]) inputs[index + 1].focus();
    };

