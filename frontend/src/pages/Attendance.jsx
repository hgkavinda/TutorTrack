import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';

const getToday = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const STATUS_STYLES = {
    Present: 'bg-green-100 text-green-800 border-green-300',
    Absent: 'bg-red-100 text-red-800 border-red-300',
};

const Attendance = () => {
    const [searchParams] = useSearchParams();
    const initialClass = searchParams.get('class') || '';
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'history' ? 'history' : 'mark');
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState(initialClass);
    const [selectedDate, setSelectedDate] = useState(getToday());
    const [session, setSession] = useState(null);
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [reportStudent, setReportStudent] = useState('');
    const [reportType, setReportType] = useState('month');
    const [reportYear, setReportYear] = useState(new Date().getFullYear());
    const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [historyClass, setHistoryClass] = useState(initialClass);
    const [historyYear, setHistoryYear] = useState(new Date().getFullYear());
    const [historyMonth, setHistoryMonth] = useState('');
    const [classHistory, setClassHistory] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const [classesResponse, studentsResponse] = await Promise.all([
                    api.get('/classes'),
                    api.get('/students'),
                ]);
                setClasses(classesResponse.data.data);
                setStudents(studentsResponse.data.data);
            } catch {
                setError('Failed to load classes and students');
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, []);

    const openSession = async () => {
        if (!selectedClass || !selectedDate) {
            setError('Please select a class and date');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const sessionResponse = await api.post('/attendance/sessions', {
                assignedClass: selectedClass,
                date: selectedDate,
            });
            const sessionData = sessionResponse.data.data;
            const rosterResponse = await api.get(`/attendance/sessions/${sessionData._id}`);
            setSession(rosterResponse.data.data.session);
            setRoster(rosterResponse.data.data.roster);
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to open attendance session');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = (studentId, status) => {
        setRoster((currentRoster) => currentRoster.map((item) => (
            item.student._id === studentId ? { ...item, status } : item
        )));
        setMessage('');
    };

    const markAllPresent = () => {
        setRoster((currentRoster) => currentRoster.map((item) => ({
            ...item,
            status: 'Present',
        })));
        setMessage('');
    };

    const completeSession = async () => {
        if (!session || roster.length === 0) return;

        setSaving(true);
        setError('');
        setMessage('');

        try {
            const response = await api.put(`/attendance/sessions/${session._id}/complete`, {
                records: roster.map((item) => ({
                    student: item.student._id,
                    status: item.status,
                    note: item.note,
                })),
            });
            setSession(response.data.data.session);
            setMessage('Attendance saved and session completed');
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const loadSummary = async () => {
        if (!reportStudent) {
            setError('Please select a student');
            return;
        }

        setSummaryLoading(true);
        setError('');
        setSummary(null);

        try {
            const query = reportType === 'month'
                ? `year=${reportYear}&month=${reportMonth}`
                : `year=${reportYear}`;
            const response = await api.get(`/attendance/student/${reportStudent}/summary?${query}`);
            setSummary(response.data.data);
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to load attendance summary');
        } finally {
            setSummaryLoading(false);
        }
    };

    const loadClassHistory = async () => {
        if (!historyClass) {
            setError('Please select a class');
            return;
        }
        setHistoryLoading(true);
        setError('');
        setClassHistory(null);
        try {
            const monthQuery = historyMonth ? `&month=${historyMonth}` : '';
            const response = await api.get(`/attendance/classes/${historyClass}/history?year=${historyYear}${monthQuery}`);
            setClassHistory(response.data.data);
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to load class attendance history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const counts = roster.reduce((result, item) => {
        result[item.status] += 1;
        return result;
    }, { Present: 0, Absent: 0 });

    if (loading && classes.length === 0) {
        return <div className="p-4 text-gray-600">Loading Attendance...</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="page-eyebrow">පන්ති වාර්තා</p><h1 className="page-title mt-1">Attendance</h1>
                    <p className="page-copy mt-2">පන්ති සැසි සහ ශිෂ්‍ය පැමිණීම කළමනාකරණය කරන්න.</p>
                </div>
                <div className="flex max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-white p-1">
                    <button onClick={() => setActiveTab('mark')} className={`px-4 py-2 rounded-md text-sm font-semibold ${activeTab === 'mark' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                        Mark Attendance
                    </button>
                    <button onClick={() => setActiveTab('summary')} className={`px-4 py-2 rounded-md text-sm font-semibold ${activeTab === 'summary' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                        Student Summary
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-md text-sm font-semibold ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                        Class History
                    </button>
                </div>
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

            {activeTab === 'mark' ? (
                <>
                    <div className="app-card p-5">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-4 items-end">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Class</label>
                                <select value={selectedClass} onChange={(event) => { setSelectedClass(event.target.value); setSession(null); setRoster([]); }} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500">
                                    <option value="">Select class</option>
                                    {classes.map((classItem) => (
                                        <option key={classItem._id} value={classItem._id}>
                                            {classItem.className} — {classItem.location || 'Location not set'} (Grade {classItem.grade})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Session Date</label>
                                <input type="date" value={selectedDate} onChange={(event) => { setSelectedDate(event.target.value); setSession(null); setRoster([]); }} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                            </div>
                            <button onClick={openSession} disabled={!selectedClass || !selectedDate || loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg text-sm font-bold">
                                {loading ? 'Opening...' : 'Open Session'}
                            </button>
                        </div>
                    </div>

                    {session && (
                        <div className="space-y-4">
                            <div className="app-card flex flex-col justify-between gap-4 p-5 lg:flex-row lg:items-center">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-bold text-gray-800">{session.assignedClass.className}</h2>
                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${session.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {session.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {session.sessionId} · {new Date(session.date).toLocaleDateString()} · {session.location || 'Location not set'}
                                    </p>
                                </div>
                                <button onClick={markAllPresent} disabled={roster.length === 0} className="border border-green-300 text-green-700 hover:bg-green-50 disabled:text-gray-400 disabled:border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold">
                                    Mark All Present
                                </button>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {Object.entries(counts).map(([status, count]) => (
                                    <div key={status} className={`rounded-lg border p-3 ${STATUS_STYLES[status]}`}>
                                        <p className="text-xs font-semibold">{status}</p>
                                        <p className="text-2xl font-bold mt-1">{count}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="app-card overflow-hidden">
                                {roster.length === 0 ? (
                                    <div className="p-10 text-center text-gray-500">No active students are assigned to this class.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[760px]">
                                            <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                                                <tr>
                                                    <th className="text-left px-5 py-3">Student</th>
                                                    <th className="text-left px-5 py-3">Status</th>
                                                    <th className="text-left px-5 py-3">Note</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {roster.map((item) => (
                                                    <tr key={item.student._id}>
                                                        <td className="px-5 py-4">
                                                            <p className="font-semibold text-gray-800">{item.student.fullName}</p>
                                                            <p className="text-xs text-gray-500">{item.student.studentId}</p>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex flex-wrap gap-2">
                                                                {Object.keys(STATUS_STYLES).map((status) => (
                                                                    <button key={status} onClick={() => updateStatus(item.student._id, status)} className={`border px-3 py-1.5 rounded-lg text-xs font-semibold ${item.status === status ? STATUS_STYLES[status] : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                                                                        {status}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <input value={item.note} onChange={(event) => setRoster((currentRoster) => currentRoster.map((row) => row.student._id === item.student._id ? { ...row, note: event.target.value } : row))} placeholder="Optional note" className="w-full border rounded-lg p-2 text-sm focus:ring-2 outline-none focus:ring-blue-500" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                <div className="sticky bottom-16 md:static z-10 border-t bg-gray-50 p-4 flex justify-end shadow-[0_-4px_10px_rgba(0,0,0,0.04)]">
                                    <button onClick={completeSession} disabled={saving || roster.length === 0} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg text-sm font-bold">
                                        {saving ? 'Saving...' : session.status === 'Completed' ? 'Update Attendance' : 'Confirm Attendance'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : activeTab === 'history' ? (
                <div className="space-y-5">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_180px_auto] gap-4 items-end">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Class</label>
                                <select value={historyClass} onChange={(event) => setHistoryClass(event.target.value)} className="w-full border rounded-lg p-2.5 text-sm">
                                    <option value="">Select class</option>
                                    {classes.map((classItem) => <option key={classItem._id} value={classItem._id}>{classItem.className} — {classItem.location} (Grade {classItem.grade})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                                <input type="number" min="2000" max="2100" value={historyYear} onChange={(event) => setHistoryYear(event.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Month</label>
                                <select value={historyMonth} onChange={(event) => setHistoryMonth(event.target.value)} className="w-full border rounded-lg p-2.5 text-sm">
                                    <option value="">All months</option>
                                    {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{new Date(2026, index).toLocaleString('en', { month: 'long' })}</option>)}
                                </select>
                            </div>
                            <button onClick={loadClassHistory} disabled={!historyClass || historyLoading} className="bg-blue-600 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg text-sm font-bold">{historyLoading ? 'Loading...' : 'View History'}</button>
                        </div>
                    </div>

                    {classHistory && <>
                        <div className="bg-white rounded-xl border p-5 flex flex-col sm:flex-row justify-between gap-3">
                            <div><p className="text-xs text-gray-500">{classHistory.assignedClass.classId}</p><h2 className="text-xl font-bold">{classHistory.assignedClass.className}</h2><p className="text-sm text-gray-500">{classHistory.assignedClass.location} · Grade {classHistory.assignedClass.grade}</p></div>
                            <div className="sm:text-right"><p className="text-3xl font-extrabold text-blue-600">{classHistory.summary.attendanceRate}%</p><p className="text-xs text-gray-500">Overall attendance rate</p></div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            <div className="rounded-lg border bg-white p-4"><p className="text-xs font-semibold text-gray-500">Sessions</p><p className="text-2xl font-bold mt-1">{classHistory.summary.sessions}</p></div>
                            {Object.entries(classHistory.summary.counts).map(([status, count]) => <div key={status} className={`rounded-lg border p-4 ${STATUS_STYLES[status]}`}><p className="text-xs font-semibold">{status}</p><p className="text-2xl font-bold mt-1">{count}</p></div>)}
                        </div>
                        <div className="space-y-3">
                            {classHistory.history.length ? classHistory.history.map((historySession) => (
                                <details key={historySession._id} className="bg-white border rounded-xl overflow-hidden">
                                    <summary className="p-4 cursor-pointer list-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div><p className="font-bold">{new Date(historySession.date).toLocaleDateString()} <span className="text-xs font-medium text-gray-500">· {historySession.sessionId}</span></p><p className="text-xs text-gray-500">{historySession.status} · {historySession.records.length} student records</p></div>
                                        <div className="flex flex-wrap gap-2">{Object.entries(historySession.counts).map(([status, count]) => <span key={status} className={`border px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status]}`}>{status}: {count}</span>)}</div>
                                    </summary>
                                    <div className="border-t divide-y">
                                        {historySession.records.length ? historySession.records.map((record) => <div key={record._id} className="p-3 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">{record.student?.fullName}</p><p className="text-xs text-gray-500">{record.student?.studentId}{record.note ? ` · ${record.note}` : ''}</p></div><span className={`border px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[record.status]}`}>{record.status}</span></div>) : <p className="p-4 text-sm text-gray-500">No attendance records saved for this session.</p>}
                                    </div>
                                </details>
                            )) : <div className="bg-white border rounded-xl p-8 text-center text-gray-500">No class sessions found for this period.</div>}
                        </div>
                    </>}
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Student</label>
                                <select value={reportStudent} onChange={(event) => setReportStudent(event.target.value)} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 outline-none focus:ring-blue-500">
                                    <option value="">Select student</option>
                                    {students.map((student) => (
                                        <option key={student._id} value={student._id}>{student.studentId} — {student.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Report</label>
                                <select value={reportType} onChange={(event) => setReportType(event.target.value)} className="w-full border rounded-lg p-2.5 text-sm">
                                    <option value="month">Monthly</option>
                                    <option value="year">Yearly</option>
                                </select>
                            </div>
                            <div className={reportType === 'year' ? 'lg:col-span-1' : ''}>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
                                <input type="number" min="2000" max="2100" value={reportYear} onChange={(event) => setReportYear(event.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
                            </div>
                            {reportType === 'month' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Month</label>
                                    <select value={reportMonth} onChange={(event) => setReportMonth(event.target.value)} className="w-full border rounded-lg p-2.5 text-sm">
                                        {Array.from({ length: 12 }, (_, index) => (
                                            <option key={index + 1} value={index + 1}>{new Date(2026, index).toLocaleString('en', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={loadSummary} disabled={!reportStudent || summaryLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2.5 rounded-lg text-sm font-bold">
                                {summaryLoading ? 'Loading...' : 'Generate Summary'}
                            </button>
                        </div>
                    </div>

                    {summary && (
                        <>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <p className="text-sm text-gray-500">{summary.student.studentId}</p>
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-1">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{summary.student.fullName}</h2>
                                        <p className="text-sm text-gray-500">Grade {summary.student.grade} · {reportType === 'month' ? 'Monthly' : 'Yearly'} attendance</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="text-4xl font-bold text-blue-600">{summary.attendanceRate}%</p>
                                        <p className="text-xs text-gray-500">Attendance rate</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="text-xs font-semibold text-gray-500">Eligible Sessions</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{summary.totalEligibleSessions}</p>
                                </div>
                                {Object.entries(summary.counts).map(([status, count]) => (
                                    <div key={status} className={`rounded-lg border p-4 ${STATUS_STYLES[status]}`}>
                                        <p className="text-xs font-semibold">{status}</p>
                                        <p className="text-2xl font-bold mt-1">{count}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b">
                                    <h3 className="font-bold text-gray-800">Attendance History</h3>
                                </div>
                                {summary.history.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No completed sessions in this period.</div>
                                ) : (
                                    <div className="divide-y">
                                        {summary.history.map((record) => (
                                            <div key={record.sessionId} className="p-4 flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-medium text-gray-800">{new Date(record.date).toLocaleDateString()}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {record.assignedClass?.className || 'Class'} · {record.sessionId}{record.note ? ` · ${record.note}` : ''}
                                                    </p>
                                                </div>
                                                <span className={`border px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[record.status]}`}>{record.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Attendance;

