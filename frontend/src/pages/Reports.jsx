import { useEffect, useState } from 'react';
import api from '../api/client';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;
const displayDate = (value) => value ? new Date(value).toLocaleDateString() : '—';

const Stat = ({ label, value, tone = 'white' }) => {
    const tones = {
        white: 'bg-white border-gray-200 text-gray-800',
        green: 'bg-green-50 border-green-100 text-green-800',
        red: 'bg-red-50 border-red-100 text-red-800',
    };
    return <div className={`border rounded-xl p-4 ${tones[tone]}`}><p className="text-xs opacity-70">{label}</p><p className="text-xl font-extrabold mt-1">{value}</p></div>;
};

const Reports = () => {
    const [students, setStudents] = useState([]);
    const [studentId, setStudentId] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/students?status=active')
            .then((response) => setStudents(response.data.data))
            .catch((requestError) => setError(requestError.response?.data?.error || 'Failed to load students'));
    }, []);

    const loadReport = async () => {
        if (!studentId) return;
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/students/${studentId}/report?year=${year}`);
            setReport(response.data.data);
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to load student report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 print:hidden">
                <div><h1 className="text-2xl font-bold text-gray-800">Student Reports</h1><p className="text-sm text-gray-500 mt-1">Attendance, performance, classes and fees in one place.</p></div>
                {report && <button onClick={() => window.print()} className="bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold">Print Report</button>}
            </div>

            <div className="bg-white border rounded-2xl p-4 grid md:grid-cols-[1fr_180px_auto] gap-3 items-end print:hidden">
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Student</label><select value={studentId} onChange={(event) => setStudentId(event.target.value)} className="w-full border rounded-lg p-2.5 text-sm"><option value="">Select a student</option>{students.map((student) => <option key={student._id} value={student._id}>{student.studentId} — {student.fullName}</option>)}</select></div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">Report Year</label><input type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(event.target.value)} className="w-full border rounded-lg p-2.5 text-sm" /></div>
                <button onClick={loadReport} disabled={!studentId || loading} className="bg-blue-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg text-sm font-bold">{loading ? 'Loading...' : 'View Report'}</button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 print:hidden">{error}</div>}
            {!report && !error && <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">Select a student and year to view the individual report.</div>}

            {report && <article className="space-y-5">
                <div className="border border-slate-200 bg-white text-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row justify-between gap-4">
                    <div><p className="text-xs uppercase tracking-widest text-blue-600">TutorTrack Individual Report</p><h2 className="text-2xl font-extrabold mt-2">{report.student.fullName}</h2><p className="text-sm text-slate-500 mt-1">{report.student.studentId} · Grade {report.student.grade} · {report.year}</p></div>
                    <div className="sm:text-right text-sm text-slate-500"><p>{report.student.parentName || 'Guardian not provided'}</p><p>{report.student.parentPhone || 'Contact not provided'}</p><p className="mt-2 text-xs">Generated {displayDate(report.generatedAt)}</p></div>
                </div>

                <section><h3 className="font-bold text-gray-800 mb-3">Class Enrollments</h3><div className="grid md:grid-cols-2 gap-3">
                    {report.enrollments.length ? report.enrollments.map((enrollment) => <div key={enrollment._id} className="bg-white border rounded-xl p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{enrollment.assignedClass?.className}</p><p className="text-xs text-gray-500">{enrollment.assignedClass?.location} · {enrollment.assignedClass?.subject}</p></div><span className={`text-xs font-bold px-2 py-1 rounded-full h-fit ${enrollment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{enrollment.status}</span></div><p className="text-xs text-gray-500 mt-3">{displayDate(enrollment.startDate)} — {enrollment.endDate ? displayDate(enrollment.endDate) : 'Present'}</p></div>) : <p className="text-sm text-gray-500">No class enrollments.</p>}
                </div></section>

                <section><h3 className="font-bold text-gray-800 mb-3">Attendance</h3><div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <Stat label="Attendance Rate" value={`${report.attendance.summary.rate}%`} tone="green" /><Stat label="Present" value={report.attendance.summary.Present} /><Stat label="Late" value={report.attendance.summary.Late} /><Stat label="Absent" value={report.attendance.summary.Absent} tone="red" /><Stat label="Excused" value={report.attendance.summary.Excused} />
                </div></section>

                <section><h3 className="font-bold text-gray-800 mb-3">Results & Overall Rating</h3>
                    <div className="grid grid-cols-3 gap-3 mb-3"><Stat label="Completed Exams" value={report.performance.summary.completedExams} /><Stat label="Average" value={`${report.performance.summary.average}%`} /><Stat label="Best" value={`${report.performance.summary.best}%`} tone="green" /></div>
                    <div className="grid md:grid-cols-2 gap-3">{report.performance.ratings.length ? report.performance.ratings.map((rating) => <div key={rating._id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between"><div><p className="font-bold">{rating.subject}</p><p className="text-xs text-gray-500">{rating.ratingStatus} · {rating.change >= 0 ? '+' : ''}{rating.change} change</p></div><div className="text-right"><p className="text-2xl font-extrabold text-blue-600">{rating.overallRating}</p><p className="text-xs font-bold text-blue-600">{rating.ratingGrade}</p></div></div>) : <div className="md:col-span-2 bg-white border rounded-xl p-5 text-center text-gray-500">No rating available for {report.year}.</div>}</div>
                    {report.performance.results.length > 0 && <div className="bg-white border rounded-xl overflow-x-auto mt-3"><table className="w-full text-sm"><thead className="bg-gray-50 text-left text-xs text-gray-500"><tr><th className="p-3">Exam</th><th className="p-3">Type</th><th className="p-3">Date</th><th className="p-3 text-right">Result</th></tr></thead><tbody>{report.performance.results.map((result) => <tr key={result._id} className="border-t"><td className="p-3 font-semibold">{result.exam?.name}</td><td className="p-3">{result.exam?.type}</td><td className="p-3">{displayDate(result.exam?.examDate)}</td><td className="p-3 text-right font-bold">{result.resultStatus === 'Completed' ? `${result.marksObtained}/${result.exam?.totalMarks} (${result.percentage}%)` : result.resultStatus}</td></tr>)}</tbody></table></div>}
                </section>

                <section><h3 className="font-bold text-gray-800 mb-3">Fees</h3><div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><Stat label="Billed" value={money(report.fees.summary.billed)} /><Stat label="Paid" value={money(report.fees.summary.paid)} tone="green" /><Stat label="Outstanding" value={money(report.fees.summary.outstanding)} tone="red" /><Stat label="Invoices" value={`${report.fees.invoices.length} (${report.fees.summary.waivedCount} waived)`} /></div></section>
            </article>}
        </div>
    );
};

export default Reports;

