const asyncHandler = require('../middleware/asyncHandler');
const Enrollment = require('../models/Enrollment');
const StudentRating = require('../models/StudentRating');
const Mark = require('../models/Mark');
const Exam = require('../models/Exam');
const Attendance = require('../models/Attendance');
const Announcement = require('../models/Announcement');
const Fee = require('../models/Fee');
const ClassSession = require('../models/ClassSession');

const getActiveEnrollments = (studentId) => Enrollment.find({
    student: studentId,
    status: 'active',
}).populate('assignedClass', 'classId className grade subject location day startTime endTime feeDueRule feeDueAfterSessions feeDueDay');

const weekdayIndex = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
};

const nextScheduledDate = (day, billingMonth) => {
    if (weekdayIndex[day] === undefined) return null;
    const [year, month] = billingMonth.split('-').map(Number);
    const monthStart = new Date(year, month - 1, 1);
    const next = monthStart > new Date() ? monthStart : new Date();
    next.setHours(0, 0, 0, 0);
    const difference = (weekdayIndex[day] - next.getDay() + 7) % 7;
    next.setDate(next.getDate() + difference);
    if (next.getMonth() !== month - 1 || next.getFullYear() !== year) return null;
    return next;
};

const getPeriod = (query, defaultYear) => {
    const year = Number(query.year || defaultYear || new Date().getFullYear());
    const month = query.month ? Number(query.month) : null;
    if (month && (month < 1 || month > 12)) return null;

    const startDate = month
        ? new Date(Date.UTC(year, month - 1, 1))
        : new Date(Date.UTC(year, 0, 1));
    const endDate = month
        ? new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
        : new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    return { year, month, startDate, endDate };
};

const buildAttendanceSummary = async (student, period) => {
    const records = await Attendance.find({
        student: student._id,
        date: { $gte: period.startDate, $lte: period.endDate },
    })
        .populate({
            path: 'session',
            match: { status: 'Completed' },
            select: 'sessionId date status',
        })
        .populate('assignedClass', 'classId className location')
        .sort('-date')
        .lean();

    const completedRecords = records.filter((record) => record.session);
    const counts = { Present: 0, Absent: 0 };
    completedRecords.forEach((record) => {
        const simpleStatus = record.status === 'Present' || record.status === 'Late' ? 'Present' : 'Absent';
        counts[simpleStatus] += 1;
        record.status = simpleStatus;
    });
    const countedSessions = completedRecords.length;
    const attendanceRate = countedSessions > 0
        ? Number(((counts.Present / countedSessions) * 100).toFixed(1))
        : 0;

    return {
        period,
        totalEligibleSessions: completedRecords.length,
        countedSessions,
        counts,
        attendanceRate,
        history: completedRecords,
    };
};

const buildFeeSummary = (invoices) => invoices.reduce((summary, invoice) => {
    summary.total += invoice.amount;
    summary.paid += invoice.paidAmount;
    summary.outstanding += invoice.balance;
    summary.counts[invoice.status] += 1;
    return summary;
}, {
    total: 0,
    paid: 0,
    outstanding: 0,
    counts: { Paid: 0, Unpaid: 0, Waived: 0 },
});

exports.getDashboard = asyncHandler(async (req, res) => {
    const student = req.student;
    const period = getPeriod({}, student.academicYear);
    const enrollments = await getActiveEnrollments(student._id);
    const classIds = enrollments.map((item) => item.assignedClass?._id).filter(Boolean);
    const publishedExams = await Exam.find({
        status: 'Published',
        grade: student.grade,
        academicYear: student.academicYear,
    }).select('_id');

    const [ratings, latestResults, attendance, announcements, feeInvoices] = await Promise.all([
        StudentRating.find({
            student: student._id,
            academicYear: student.academicYear,
        })
            .populate('latestExam', 'examId name type examDate')
            .sort('subject'),
        Mark.find({
            student: student._id,
            exam: { $in: publishedExams.map((exam) => exam._id) },
        })
            .populate('exam', 'examId name type subject grade examDate totalMarks academicYear')
            .sort('-createdAt')
            .limit(5),
        buildAttendanceSummary(student, period),
        Announcement.find({
            $or: [
                { targetClass: null },
                { targetClass: { $in: classIds } },
            ],
        })
            .populate('targetClass', 'className')
            .sort('-createdAt')
            .limit(5),
        Fee.find({
            student: student._id,
            billingMonth: { $regex: `^${student.academicYear}-` },
        }).sort('-billingMonth'),
    ]);

    res.status(200).json({
        success: true,
        data: {
            student,
            classes: enrollments.map((item) => item.assignedClass),
            ratings,
            latestResults,
            attendance,
            announcements,
            fees: buildFeeSummary(feeInvoices),
        },
    });
});

exports.getResults = asyncHandler(async (req, res) => {
    const year = Number(req.query.year || req.student.academicYear);
    const publishedExams = await Exam.find({
        status: 'Published',
        grade: req.student.grade,
        academicYear: year,
    }).select('_id');

    const results = await Mark.find({
        student: req.student._id,
        exam: { $in: publishedExams.map((exam) => exam._id) },
    })
        .populate('exam', 'examId name type subject grade examDate totalMarks academicYear weight')
        .sort('-createdAt');
    const ratings = await StudentRating.find({
        student: req.student._id,
        academicYear: year,
    })
        .populate('latestExam', 'examId name type examDate')
        .sort('subject');

    res.status(200).json({ success: true, data: { year, ratings, results } });
});

exports.getAttendance = asyncHandler(async (req, res) => {
    const period = getPeriod(req.query, req.student.academicYear);
    if (!period) {
        return res.status(400).json({ success: false, error: 'Please provide a valid report period' });
    }

    const [summary, enrollments] = await Promise.all([
        buildAttendanceSummary(req.student, period),
        getActiveEnrollments(req.student._id),
    ]);
    res.status(200).json({
        success: true,
        data: {
            ...summary,
            enrolledClasses: enrollments.map((item) => item.assignedClass).filter(Boolean),
        },
    });
});

exports.getFees = asyncHandler(async (req, res) => {
    const query = { student: req.student._id };
    if (req.query.year) query.billingMonth = { $regex: `^${Number(req.query.year)}-` };
    if (req.query.billingMonth) query.billingMonth = req.query.billingMonth;

    const invoices = await Fee.find(query)
        .populate('assignedClass', 'classId className location grade day startTime feeDueRule feeDueAfterSessions feeDueDay')
        .sort('-billingMonth')
        .lean();
    const invoicesWithProgress = await Promise.all(invoices.map(async (invoice) => {
        const [year, month] = invoice.billingMonth.split('-').map(Number);
        const start = new Date(Date.UTC(year, month - 1, 1));
        const end = new Date(Date.UTC(year, month, 1));
        const completedSessions = await ClassSession.countDocuments({
            assignedClass: invoice.assignedClass?._id,
            status: 'Completed',
            date: { $gte: start, $lt: end },
        });
        const target = invoice.assignedClass?.feeDueAfterSessions || 4;
        return {
            ...invoice,
            paymentProgress: {
                rule: invoice.assignedClass?.feeDueRule || 'AfterSessions',
                completedSessions,
                targetSessions: target,
                sessionsRemaining: Math.max(0, target - completedSessions),
                nextClassDate: nextScheduledDate(invoice.assignedClass?.day, invoice.billingMonth),
            },
        };
    }));

    res.status(200).json({
        success: true,
        data: {
            invoices: invoicesWithProgress,
            summary: buildFeeSummary(invoicesWithProgress),
        },
    });
});
