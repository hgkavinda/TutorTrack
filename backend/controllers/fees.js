const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const Fee = require('../models/Fee');
const Enrollment = require('../models/Enrollment');
const PaymentTransaction = require('../models/PaymentTransaction');

const generateCode = (prefix, billingMonth = '') => {
    const monthPart = billingMonth ? `-${billingMonth.replace('-', '')}` : '';
    return `${prefix}${monthPart}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

const getMonthRange = (billingMonth) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(billingMonth || '')) return null;
    const [year, month] = billingMonth.split('-').map(Number);
    return {
        start: new Date(Date.UTC(year, month - 1, 1)),
        end: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
        year,
        month,
    };
};

const buildSummary = (invoices) => invoices.reduce((summary, invoice) => {
    summary.expected += invoice.amount;
    summary.collected += invoice.paidAmount;
    summary.outstanding += invoice.balance;
    summary.counts[invoice.status] += 1;
    return summary;
}, {
    expected: 0,
    collected: 0,
    outstanding: 0,
    counts: { Paid: 0, Unpaid: 0, Waived: 0 },
});

const populateInvoice = (query) => query
    .populate('student', 'fullName studentId')
    .populate('assignedClass', 'classId className location grade monthlyFee');

const collectForStudent = async ({ studentId, invoices, paymentDate, method, note, teacherId }) => {
    const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const receiptNumber = generateCode('REC', new Date(paymentDate || Date.now()).toISOString().slice(0, 7));
    const transaction = await PaymentTransaction.create({
        transactionId: generateCode('PAY'),
        receiptNumber,
        student: studentId,
        invoices: invoices.map((invoice) => invoice._id),
        totalAmount,
        paymentDate: paymentDate || new Date(),
        method: method || 'Cash',
        note: note || '',
        recordedBy: teacherId,
    });

    const result = await Fee.bulkWrite(invoices.map((invoice) => ({
        updateOne: {
            filter: { _id: invoice._id, status: 'Unpaid' },
            update: {
                $set: {
                    status: 'Paid',
                    paidAmount: invoice.amount,
                    balance: 0,
                    paymentTransaction: transaction._id,
                    receiptNumber,
                    paymentDate: transaction.paymentDate,
                    paymentMethod: transaction.method,
                    paymentNote: transaction.note,
                },
            },
        },
    })));

    if (result.modifiedCount !== invoices.length) {
        await PaymentTransaction.findByIdAndDelete(transaction._id);
        throw new Error('One or more invoices changed while collecting payment. Please reload and try again.');
    }
    return transaction;
};

exports.getFees = asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.billingMonth) query.billingMonth = req.query.billingMonth;
    if (req.query.status) query.status = req.query.status;
    if (req.query.assignedClass) query.assignedClass = req.query.assignedClass;
    if (req.query.student) query.student = req.query.student;

    const invoices = await populateInvoice(Fee.find(query)).sort('student billingMonth');
    res.status(200).json({
        success: true,
        count: invoices.length,
        data: invoices,
        summary: buildSummary(invoices),
    });
});

exports.generateMonthlyInvoices = asyncHandler(async (req, res) => {
    const range = getMonthRange(req.body.billingMonth);
    if (!range) {
        return res.status(400).json({ success: false, error: 'Please select a valid billing month' });
    }

    const dueDay = Math.min(28, Math.max(1, Number(req.body.dueDay || 10)));
    const dueDate = new Date(Date.UTC(range.year, range.month - 1, dueDay));
    const enrollmentQuery = {
        startDate: { $lte: range.end },
        $or: [{ endDate: null }, { endDate: { $gte: range.start } }],
    };
    if (req.body.assignedClass) enrollmentQuery.assignedClass = req.body.assignedClass;

    const enrollments = await Enrollment.find(enrollmentQuery)
        .populate('student', 'fullName studentId status')
        .populate('assignedClass', 'classId className monthlyFee status feeDueRule feeDueDay');
    const eligible = enrollments.filter((item) => (
        item.student && item.assignedClass && item.assignedClass.monthlyFee > 0
    ));
    const operations = eligible.map((enrollment) => ({
        updateOne: {
            filter: {
                student: enrollment.student._id,
                assignedClass: enrollment.assignedClass._id,
                billingMonth: req.body.billingMonth,
            },
            update: {
                $setOnInsert: {
                    invoiceId: generateCode('INV', req.body.billingMonth),
                    student: enrollment.student._id,
                    assignedClass: enrollment.assignedClass._id,
                    billingMonth: req.body.billingMonth,
                    standardAmount: enrollment.assignedClass.monthlyFee,
                    concessionType: 'Full',
                    discountAmount: 0,
                    amount: enrollment.assignedClass.monthlyFee,
                    paidAmount: 0,
                    balance: enrollment.assignedClass.monthlyFee,
                    status: 'Unpaid',
                    dueDate: enrollment.assignedClass.feeDueRule === 'MonthStart'
                        ? range.start
                        : enrollment.assignedClass.feeDueRule === 'FixedDay'
                            ? new Date(Date.UTC(range.year, range.month - 1, enrollment.assignedClass.feeDueDay || 10))
                            : dueDate,
                    generatedBy: req.user.id,
                },
            },
            upsert: true,
        },
    }));

    let created = 0;
    if (operations.length > 0) {
        const result = await Fee.bulkWrite(operations, { ordered: false });
        created = result.upsertedCount;
    }
    res.status(200).json({
        success: true,
        data: {
            eligibleEnrollments: eligible.length,
            created,
            existing: eligible.length - created,
            skippedWithoutFee: enrollments.length - eligible.length,
        },
    });
});

exports.getCollectionSheet = asyncHandler(async (req, res) => {
    if (!req.query.billingMonth || !req.query.assignedClass) {
        return res.status(400).json({ success: false, error: 'Please select a billing month and class' });
    }

    const invoices = await populateInvoice(Fee.find({
        billingMonth: req.query.billingMonth,
        assignedClass: req.query.assignedClass,
    })).sort('student.fullName');
    const studentIds = invoices.map((invoice) => invoice.student?._id).filter(Boolean);
    const arrears = await Fee.aggregate([
        {
            $match: {
                student: { $in: studentIds },
                status: 'Unpaid',
                billingMonth: { $lt: req.query.billingMonth },
            },
        },
        {
            $group: {
                _id: '$student',
                count: { $sum: 1 },
                amount: { $sum: '$amount' },
            },
        },
    ]);
    const arrearsByStudent = new Map(arrears.map((item) => [String(item._id), item]));
    const rows = invoices.map((invoice) => ({
        invoice,
        arrears: arrearsByStudent.get(String(invoice.student?._id)) || { count: 0, amount: 0 },
    }));

    res.status(200).json({
        success: true,
        data: rows,
        summary: buildSummary(invoices),
    });
});

exports.updateConcessions = asyncHandler(async (req, res) => {
    const updates = Array.isArray(req.body.updates) ? req.body.updates : [];
    const allowed = new Set(['Full', 'Half', 'Free', 'Custom']);
    let updated = 0;

    for (const item of updates) {
        const invoice = await Fee.findById(item.invoice);
        if (!invoice || invoice.status === 'Paid' || !allowed.has(item.concessionType)) continue;

        let payable = invoice.standardAmount;
        if (item.concessionType === 'Half') payable = invoice.standardAmount / 2;
        if (item.concessionType === 'Free') payable = 0;
        if (item.concessionType === 'Custom') {
            payable = Number(item.customAmount);
            if (!Number.isFinite(payable) || payable < 0 || payable > invoice.standardAmount) {
                return res.status(400).json({
                    success: false,
                    error: `Custom payable amount must be between 0 and ${invoice.standardAmount}`,
                });
            }
        }

        invoice.concessionType = item.concessionType;
        invoice.amount = payable;
        invoice.discountAmount = invoice.standardAmount - payable;
        invoice.paidAmount = 0;
        invoice.balance = payable;
        invoice.status = payable === 0 ? 'Waived' : 'Unpaid';
        invoice.concessionReason = item.reason || '';
        await invoice.save();
        updated += 1;
    }

    res.status(200).json({ success: true, updated });
});

exports.collectBulk = asyncHandler(async (req, res) => {
    const invoiceIds = [...new Set((req.body.invoiceIds || []).map(String))];
    const invoices = await Fee.find({ _id: { $in: invoiceIds }, status: 'Unpaid' });
    if (invoices.length !== invoiceIds.length || invoiceIds.length === 0) {
        return res.status(400).json({ success: false, error: 'Select valid unpaid invoices' });
    }

    const grouped = new Map();
    invoices.forEach((invoice) => {
        const key = String(invoice.student);
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(invoice);
    });

    const transactions = [];
    for (const [studentId, studentInvoices] of grouped) {
        const transaction = await collectForStudent({
            studentId,
            invoices: studentInvoices,
            paymentDate: req.body.paymentDate,
            method: req.body.method,
            note: req.body.note,
            teacherId: req.user.id,
        });
        transactions.push(transaction);
    }

    res.status(200).json({
        success: true,
        data: {
            studentsCollected: transactions.length,
            invoicesCollected: invoices.length,
            receipts: transactions.map((item) => item.receiptNumber),
        },
    });
});

exports.getStudentArrears = asyncHandler(async (req, res) => {
    const invoices = await Fee.find({
        student: req.params.studentId,
        status: 'Unpaid',
    })
        .populate('assignedClass', 'classId className location')
        .sort('billingMonth');
    res.status(200).json({
        success: true,
        data: invoices,
        total: invoices.reduce((sum, invoice) => sum + invoice.amount, 0),
    });
});

exports.getFeesByStudent = asyncHandler(async (req, res) => {
    const invoices = await Fee.find({ student: req.params.studentId })
        .populate('assignedClass', 'classId className location')
        .sort('-billingMonth');
    res.status(200).json({
        success: true,
        count: invoices.length,
        data: invoices,
        summary: buildSummary(invoices),
    });
});
