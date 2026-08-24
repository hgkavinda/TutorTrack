import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';

const monthNow = new Date().toISOString().slice(0, 7);
const money = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;
const statusStyle = {
    Paid: 'bg-green-100 text-green-700',
    Unpaid: 'bg-red-100 text-red-700',
    Waived: 'bg-blue-100 text-blue-700',
};

const Fees = () => {
    const [searchParams] = useSearchParams();
    const [classes, setClasses] = useState([]);
    const [billingMonth, setBillingMonth] = useState(monthNow);
    const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || '');
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState(null);
    const [selectedInvoices, setSelectedInvoices] = useState([]);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [arrearsStudent, setArrearsStudent] = useState(null);
    const [arrears, setArrears] = useState([]);
    const [selectedArrears, setSelectedArrears] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loadClasses = async () => {
            try {
                const response = await api.get('/classes');
                setClasses(response.data.data);
            } catch {
                setError('Failed to load classes');
            }
        };
        loadClasses();
    }, []);

    const loadSheet = async () => {
        if (!selectedClass || !billingMonth) return;
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.get(`/fees/collection-sheet?billingMonth=${billingMonth}&assignedClass=${selectedClass}`);
            setRows(response.data.data.map((row) => ({
                ...row,
                concessionType: row.invoice.concessionType,
                customAmount: row.invoice.concessionType === 'Custom' ? row.invoice.amount : '',
                reason: row.invoice.concessionReason || '',
            })));
            setSummary(response.data.summary);
            setSelectedInvoices([]);
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to load collection sheet');
        } finally {
            setLoading(false);
        }
    };

    const generateAndLoad = async () => {
        if (!selectedClass || !billingMonth) {
            setError('Please select a class and billing month');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const response = await api.post('/fees/generate', {
                billingMonth,
                assignedClass: selectedClass,
                dueDay: 10,
            });
            const result = response.data.data;
            setMessage(`${result.created} invoices created; ${result.existing} already existed.`);
            await loadSheet();
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to generate invoices');
        } finally {
            setSaving(false);
        }
    };

    const updateRow = (invoiceId, changes) => {
        setRows((current) => current.map((row) => (
            row.invoice._id === invoiceId ? { ...row, ...changes } : row
        )));
        if (changes.concessionType === 'Free') {
            setSelectedInvoices((current) => current.filter((id) => id !== invoiceId));
        }
    };

    const payablePreview = (row) => {
        const standard = row.invoice.standardAmount;
        if (row.concessionType === 'Half') return standard / 2;
        if (row.concessionType === 'Free') return 0;
        if (row.concessionType === 'Custom') return Number(row.customAmount || 0);
        return standard;
    };

    const concessionPayload = () => rows
        .filter((row) => row.invoice.status !== 'Paid')
        .map((row) => ({
            invoice: row.invoice._id,
            concessionType: row.concessionType,
            customAmount: row.customAmount,
            reason: row.reason,
        }));

    const saveConcessions = async () => {
        setSaving(true);
        setError('');
        try {
            await api.put('/fees/concessions', {
                updates: concessionPayload(),
            });
            setMessage('Card types and payable amounts saved');
            await loadSheet();
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to save card types');
        } finally {
            setSaving(false);
        }
    };

    const collectInvoices = async (invoiceIds, closeArrears = false) => {
        if (invoiceIds.length === 0) return;
        setSaving(true);
        setError('');
        try {
            if (!closeArrears) {
                await api.put('/fees/concessions', { updates: concessionPayload() });
            }
            const response = await api.post('/fees/collect', {
                invoiceIds,
                paymentDate,
                method: paymentMethod,
            });
            const result = response.data.data;
            setMessage(`${result.invoicesCollected} invoice(s) collected for ${result.studentsCollected} student(s). ${result.receipts.length} receipt(s) generated.`);
            if (closeArrears) {
                setArrearsStudent(null);
                setArrears([]);
                setSelectedArrears([]);
            }
            await loadSheet();
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to collect selected fees');
        } finally {
            setSaving(false);
        }
    };

    const openArrears = async (student) => {
        setSaving(true);
        setError('');
        try {
            const response = await api.get(`/fees/student/${student._id}/arrears`);
            setArrearsStudent(student);
            setArrears(response.data.data);
            setSelectedArrears(response.data.data.map((invoice) => invoice._id));
        } catch (requestError) {
            setError(requestError.response?.data?.error || 'Failed to load unpaid months');
        } finally {
            setSaving(false);
        }
    };

    const toggleCurrent = (invoiceId) => {
        setSelectedInvoices((current) => current.includes(invoiceId)
            ? current.filter((id) => id !== invoiceId)
            : [...current, invoiceId]);
    };

    const unpaidCurrent = rows.filter((row) => row.invoice.status === 'Unpaid' && payablePreview(row) > 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <p className="page-eyebrow">ගෙවීම් කළමනාකරණය</p><h1 className="page-title mt-1">Class Fee Collection</h1>
                <p className="page-copy mt-2">පන්තිය සහ මාසය තෝරා fees එකතු කරන්න.</p>
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {message && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}

            <div className="app-card p-5">
                <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto_auto] gap-3 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Billing Month</label>
                        <input type="month" value={billingMonth} onChange={(event) => { setBillingMonth(event.target.value); setRows([]); }} className="w-full border rounded-lg p-2.5 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Class</label>
                        <select value={selectedClass} onChange={(event) => { setSelectedClass(event.target.value); setRows([]); }} className="w-full border rounded-lg p-2.5 text-sm">
                            <option value="">Select class</option>
                            {classes.map((classItem) => (
                                <option key={classItem._id} value={classItem._id}>{classItem.className} — {classItem.location || 'Location not set'} · {money(classItem.monthlyFee)}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={loadSheet} disabled={!selectedClass || loading} className="border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:text-gray-400 px-4 py-2.5 rounded-lg text-sm font-bold">
                        Load Sheet
                    </button>
                    <button onClick={generateAndLoad} disabled={!selectedClass || saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg text-sm font-bold">
                        Generate / Refresh
                    </button>
                </div>
            </div>

            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white border rounded-xl p-4"><p className="text-xs text-gray-500">Payable</p><p className="text-xl font-bold mt-1">{money(summary.expected)}</p></div>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4"><p className="text-xs text-green-700">Collected</p><p className="text-xl font-bold text-green-800 mt-1">{money(summary.collected)}</p></div>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4"><p className="text-xs text-red-700">Outstanding</p><p className="text-xl font-bold text-red-800 mt-1">{money(summary.outstanding)}</p></div>
                    <div className="bg-white border rounded-xl p-4"><p className="text-xs text-gray-500">Students</p><p className="text-xl font-bold mt-1">{rows.length}</p><p className="text-[11px] text-gray-400">{summary.counts.Paid} paid · {summary.counts.Waived} free</p></div>
                </div>
            )}

            {rows.length > 0 && (
                <>
                    <div className="app-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px]">
                                <thead className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3 text-center">Paid</th>
                                        <th className="px-4 py-3 text-left">Student</th>
                                        <th className="px-4 py-3 text-right">Standard Fee</th>
                                        <th className="px-4 py-3 text-left">Card Type</th>
                                        <th className="px-4 py-3 text-right">Payable</th>
                                        <th className="px-4 py-3 text-left">Reason</th>
                                        <th className="px-4 py-3 text-left">Status / Arrears</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rows.map((row) => {
                                        const invoice = row.invoice;
                                        return (
                                            <tr key={invoice._id} className={selectedInvoices.includes(invoice._id) ? 'bg-blue-50' : ''}>
                                                <td className="px-4 py-4 text-center">
                                                    <input type="checkbox" disabled={invoice.status !== 'Unpaid' || payablePreview(row) <= 0} checked={invoice.status === 'Paid' || selectedInvoices.includes(invoice._id)} onChange={() => toggleCurrent(invoice._id)} className="w-5 h-5 accent-blue-600" />
                                                </td>
                                                <td className="px-4 py-4"><p className="font-semibold text-gray-800">{invoice.student?.fullName}</p><p className="text-xs text-gray-500">{invoice.student?.studentId}</p></td>
                                                <td className="px-4 py-4 text-right font-semibold">{money(invoice.standardAmount)}</td>
                                                <td className="px-4 py-4">
                                                    <select disabled={invoice.status === 'Paid'} value={row.concessionType} onChange={(event) => updateRow(invoice._id, { concessionType: event.target.value })} className="border rounded-lg p-2 text-sm disabled:bg-gray-100">
                                                        {['Full', 'Half', 'Free', 'Custom'].map((type) => <option key={type} value={type}>{type}</option>)}
                                                    </select>
                                                    {row.concessionType === 'Custom' && <input type="number" min="0" max={invoice.standardAmount} value={row.customAmount} onChange={(event) => updateRow(invoice._id, { customAmount: event.target.value })} placeholder="Payable" className="w-28 border rounded-lg p-2 text-sm ml-2" />}
                                                </td>
                                                <td className="px-4 py-4 text-right font-bold text-blue-700">{money(payablePreview(row))}</td>
                                                <td className="px-4 py-4"><input disabled={invoice.status === 'Paid'} value={row.reason} onChange={(event) => updateRow(invoice._id, { reason: event.target.value })} placeholder="Optional" className="w-full border rounded-lg p-2 text-sm disabled:bg-gray-100" /></td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle[invoice.status]}`}>{invoice.status}</span>
                                                    {row.arrears.count > 0 && (
                                                        <button onClick={() => openArrears(invoice.student)} className="block mt-2 text-xs font-bold text-red-700 hover:underline">
                                                            {row.arrears.count} previous unpaid · {money(row.arrears.amount)}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="sticky bottom-16 md:static z-10 border-t bg-gray-50 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-[0_-4px_10px_rgba(0,0,0,0.04)]">
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setSelectedInvoices(unpaidCurrent.map((row) => row.invoice._id))} className="border rounded-lg px-3 py-2 text-xs font-bold text-gray-600 hover:bg-white">Select All Unpaid</button>
                                <button onClick={() => setSelectedInvoices([])} className="border rounded-lg px-3 py-2 text-xs font-bold text-gray-600 hover:bg-white">Clear</button>
                                <button onClick={saveConcessions} disabled={saving} className="border border-blue-300 text-blue-700 rounded-lg px-3 py-2 text-xs font-bold hover:bg-blue-50">Save Card Types</button>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} className="border rounded-lg p-2 text-sm" />
                                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="border rounded-lg p-2 text-sm">
                                    {['Cash', 'Bank Transfer', 'Card', 'Other'].map((method) => <option key={method} value={method}>{method}</option>)}
                                </select>
                                <button onClick={() => collectInvoices(selectedInvoices)} disabled={selectedInvoices.length === 0 || saving} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-bold">
                                    Collect Selected ({selectedInvoices.length})
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {!loading && selectedClass && rows.length === 0 && (
                <div className="bg-white rounded-xl border p-8 text-center text-gray-500">No invoices loaded. Click Generate / Refresh for this class and month.</div>
            )}

            {arrearsStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="bg-blue-600 text-white p-4 flex justify-between">
                            <div><h2 className="font-bold">Collect Previous Months</h2><p className="text-xs text-blue-100">{arrearsStudent.fullName} · {arrearsStudent.studentId}</p></div>
                            <button onClick={() => setArrearsStudent(null)} className="text-xl">×</button>
                        </div>
                        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
                            {arrears.map((invoice) => (
                                <label key={invoice._id} className="flex items-center justify-between gap-4 border rounded-lg p-3 cursor-pointer hover:bg-blue-50">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" checked={selectedArrears.includes(invoice._id)} onChange={() => setSelectedArrears((current) => current.includes(invoice._id) ? current.filter((id) => id !== invoice._id) : [...current, invoice._id])} className="w-5 h-5 accent-blue-600" />
                                        <div><p className="font-semibold text-gray-800">{invoice.billingMonth} · {invoice.assignedClass?.className}</p><p className="text-xs text-gray-500">{invoice.concessionType} card</p></div>
                                    </div>
                                    <p className="font-bold text-gray-800">{money(invoice.amount)}</p>
                                </label>
                            ))}
                        </div>
                        <div className="border-t bg-gray-50 p-4 flex items-center justify-between gap-4">
                            <div><p className="text-xs text-gray-500">Selected Total</p><p className="font-bold">{money(arrears.filter((invoice) => selectedArrears.includes(invoice._id)).reduce((sum, invoice) => sum + invoice.amount, 0))}</p></div>
                            <button onClick={() => collectInvoices(selectedArrears, true)} disabled={selectedArrears.length === 0 || saving} className="bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg text-sm font-bold">
                                Collect & Create One Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fees;

