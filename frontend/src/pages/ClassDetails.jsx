import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';

const ClassDetails = () => {
    const { classId } = useParams();
    const [classItem, setClassItem] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/classes/${classId}`)
            .then((response) => setClassItem(response.data.data))
            .catch((requestError) => setError(requestError.response?.data?.error || 'Failed to load class'));
    }, [classId]);

    if (error) return <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>;
    if (!classItem) return <div className="app-card p-8 text-center text-gray-500">Loading class...</div>;

    const students = classItem.enrollments?.map((item) => item.student).filter(Boolean) || [];
    return <div className="space-y-5">
        <div className="rounded-2xl bg-blue-700 p-5 text-white shadow-sm sm:p-6">
            <Link to="/classes" className="text-xs text-blue-100 hover:text-white">← All classes</Link>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-3">
                <div><p className="text-xs font-mono text-blue-200">{classItem.classId}</p><h1 className="text-2xl font-extrabold">{classItem.className}</h1><p className="mt-1 text-sm text-blue-100">{classItem.subject} · Grade {classItem.grade} · {classItem.location}</p></div>
                <div className="sm:text-right text-sm"><p>{classItem.day} · {classItem.startTime || 'Time not set'}–{classItem.endTime || 'Time not set'}</p><p>{classItem.contactNumber}</p><p className="font-bold mt-1">Rs. {Number(classItem.monthlyFee || 0).toLocaleString()}/month</p></div>
            </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border rounded-xl p-4"><p className="text-xs text-gray-500">Active Students</p><p className="text-2xl font-extrabold">{students.length}</p></div>
            <Link to={`/attendance?class=${classId}`} className="app-card p-4 hover:border-blue-300"><p className="text-xs text-gray-500">Today</p><p className="mt-1 font-bold text-blue-700">Mark Attendance →</p></Link>
            <Link to={`/attendance?tab=history&class=${classId}`} className="app-card p-4 hover:border-blue-300"><p className="text-xs text-gray-500">Past Sessions</p><p className="mt-1 font-bold text-blue-700">Attendance History →</p></Link>
            <Link to={`/fees?class=${classId}`} className="app-card p-4 hover:border-blue-300"><p className="text-xs text-gray-500">Monthly Collection</p><p className="mt-1 font-bold text-blue-700">Open Fees →</p></Link>
        </div>

        <section className="bg-white border rounded-2xl overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between"><div><h2 className="font-bold">Class Students</h2><p className="text-xs text-gray-500">Current active enrollment</p></div><Link to={`/students?class=${classId}`} className="text-sm font-bold text-green-700">Manage →</Link></div>
            {students.length ? <div className="divide-y">{students.map((student) => <Link to={`/students?student=${student._id}`} key={student._id} className="p-4 flex items-center justify-between hover:bg-green-50"><div><p className="font-semibold">{student.fullName}</p><p className="text-xs text-gray-500">{student.studentId}</p></div><span className="text-green-700">View →</span></Link>)}</div> : <div className="p-8 text-center text-gray-500">No active students in this class.</div>}
        </section>
    </div>;
};

export default ClassDetails;
