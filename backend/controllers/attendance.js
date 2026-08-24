const asyncHandler = require('../middleware/asyncHandler');
const Attendance = require('../models/Attendance');
const ClassSession = require('../models/ClassSession');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const crypto = require('crypto');

const normalizeDate = (value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? null : date;
};

const generateSessionId = (date) => {
    const datePart = date.toISOString().slice(0, 10).replaceAll('-', '');
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `SES-${datePart}-${randomPart}`;
};

// @desc    Get all attendance
// @route   GET /api/attendance
// @access  Private
exports.getAttendances = asyncHandler(async (req, res, next) => {
    const attendances = await Attendance.find()
        .populate({ path: 'student', select: 'fullName studentId' })
        .populate({ path: 'assignedClass', select: 'className subject' });

    res.status(200).json({
        success: true,
        count: attendances.length,
        data: attendances,
    });
});

// @desc    Get attendance by class
// @route   GET /api/attendance/class/:classId
// @access  Private
exports.getAttendanceByClass = asyncHandler(async (req, res, next) => {
    const queryReq = { assignedClass: req.params.classId };
    if (req.query.date) queryReq.date = req.query.date;

    const attendances = await Attendance.find(queryReq)
        .populate({ path: 'student', select: 'fullName studentId' });

    res.status(200).json({
        success: true,
        count: attendances.length,
        data: attendances,
    });
});

// @desc    Get attendance by student
// @route   GET /api/attendance/student/:studentId
// @access  Private
exports.getAttendanceByStudent = asyncHandler(async (req, res, next) => {
    const attendances = await Attendance.find({ student: req.params.studentId })
        .populate({ path: 'assignedClass', select: 'className' });

    res.status(200).json({
        success: true,
        count: attendances.length,
        data: attendances,
    });
});

// @desc    Create/Mark attendance (Bulk or Single)
// @route   POST /api/attendance
// @access  Private
exports.markAttendance = asyncHandler(async (req, res, next) => {
    // Check if bulk array
    if (Array.isArray(req.body)) {
        const records = req.body.map(record => ({
            ...record,
            markedBy: req.user.id
        }));

        // Using insertMany, we might catch duplicate key errors depending on how it's handled.
        // In production, we'd loop or use bulkWrite to handle upserts nicely.
        // For simplicity, we just insert. If it crashes, the index prevents duplicates.
        const attendances = await Attendance.insertMany(records);
        return res.status(201).json({ success: true, count: attendances.length, data: attendances });
    }

    // Single attendance
    req.body.markedBy = req.user.id;
    const attendance = await Attendance.create(req.body);

    res.status(201).json({
        success: true,
        data: attendance,
    });
});

// @desc    Update single attendance record
// @route   PUT /api/attendance/:id
// @access  Private
exports.updateAttendance = asyncHandler(async (req, res, next) => {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!attendance) {
        return res.status(404).json({ success: false, error: 'Record not found' });
    }

    res.status(200).json({
        success: true,
        data: attendance,
    });
});

// @desc    Open or return a class session for a class/date
// @route   POST /api/attendance/sessions
// @access  Private
exports.openSession = asyncHandler(async (req, res) => {
    const { assignedClass, date: dateValue } = req.body;
    const date = normalizeDate(dateValue);

    if (!assignedClass || !date) {
        return res.status(400).json({ success: false, error: 'Please select a valid class and date' });
    }

    const classItem = await Class.findById(assignedClass);
    if (!classItem) {
        return res.status(404).json({ success: false, error: 'Class not found' });
    }

    let session = await ClassSession.findOne({ assignedClass, date });

    if (!session) {
        session = await ClassSession.create({
            sessionId: generateSessionId(date),
            assignedClass,
            date,
            startTime: classItem.startTime,
            endTime: classItem.endTime,
            location: classItem.location,
            createdBy: req.user.id,
        });
    }

    await session.populate('assignedClass', 'classId className grade location startTime endTime');
    res.status(200).json({ success: true, data: session });
});

// @desc    Get a session roster and saved attendance
// @route   GET /api/attendance/sessions/:sessionId
// @access  Private
exports.getSessionRoster = asyncHandler(async (req, res) => {
    const session = await ClassSession.findById(req.params.sessionId)
        .populate('assignedClass', 'classId className grade location startTime endTime');

    if (!session) {
        return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const endOfSessionDay = new Date(session.date);
    endOfSessionDay.setUTCHours(23, 59, 59, 999);

    const activeEnrollments = await Enrollment.find({
        assignedClass: session.assignedClass._id,
        startDate: { $lte: endOfSessionDay },
        $or: [{ endDate: null }, { endDate: { $gte: session.date } }],
    }).select('student');
    const students = await Student.find({
        _id: { $in: activeEnrollments.map((item) => item.student) },
        status: 'active',
    }).select('fullName studentId grade');

    const savedAttendance = await Attendance.find({ session: session._id }).lean();
    const attendanceByStudent = new Map(
        savedAttendance.map((record) => [String(record.student), record])
    );

    const roster = students.map((student) => {
        const record = attendanceByStudent.get(String(student._id));
        return {
            student: {
                _id: student._id,
                studentId: student.studentId,
                fullName: student.fullName,
                grade: student.grade,
            },
            attendanceId: record?._id || null,
            status: record?.status === 'Absent' || record?.status === 'Excused' ? 'Absent' : 'Present',
            note: record?.note || '',
        };
    });

    res.status(200).json({
        success: true,
        data: { session, roster },
    });
});

// @desc    Get class attendance session history with totals
// @route   GET /api/attendance/classes/:classId/history
// @access  Private
exports.getClassAttendanceHistory = asyncHandler(async (req, res) => {
    const classItem = await Class.findById(req.params.classId)
        .select('classId className grade subject location');
    if (!classItem) {
        return res.status(404).json({ success: false, error: 'Class not found' });
    }

    const year = Number(req.query.year || new Date().getFullYear());
    const month = req.query.month ? Number(req.query.month) : null;
    if (!Number.isInteger(year) || year < 2000 || year > 2100 || (month && (month < 1 || month > 12))) {
        return res.status(400).json({ success: false, error: 'Please provide a valid report period' });
    }

    const startDate = month
        ? new Date(Date.UTC(year, month - 1, 1))
        : new Date(Date.UTC(year, 0, 1));
    const endDate = month
        ? new Date(Date.UTC(year, month, 1))
        : new Date(Date.UTC(year + 1, 0, 1));

    const sessions = await ClassSession.find({
        assignedClass: classItem._id,
        date: { $gte: startDate, $lt: endDate },
    }).sort('-date').lean();
    const sessionIds = sessions.map((session) => session._id);
    const records = await Attendance.find({ session: { $in: sessionIds } })
        .populate('student', 'studentId fullName')
        .sort('student.fullName')
        .lean();

    const recordsBySession = new Map();
    records.forEach((record) => {
        const key = String(record.session);
        if (!recordsBySession.has(key)) recordsBySession.set(key, []);
        recordsBySession.get(key).push(record);
    });

    const totals = { Present: 0, Absent: 0 };
    const history = sessions.map((session) => {
        const sessionRecords = recordsBySession.get(String(session._id)) || [];
        const counts = { Present: 0, Absent: 0 };
        sessionRecords.forEach((record) => {
            record.status = record.status === 'Present' || record.status === 'Late' ? 'Present' : 'Absent';
            counts[record.status] += 1;
            totals[record.status] += 1;
        });
        return { ...session, counts, records: sessionRecords };
    });

    const counted = totals.Present + totals.Absent;
    res.status(200).json({
        success: true,
        data: {
            assignedClass: classItem,
            period: { year, month, startDate, endDate },
            summary: {
                sessions: sessions.length,
                records: records.length,
                counts: totals,
                attendanceRate: counted
                    ? Number(((totals.Present / counted) * 100).toFixed(1))
                    : 0,
            },
            history,
        },
    });
});

// @desc    Save the full roster and complete a class session
// @route   PUT /api/attendance/sessions/:sessionId/complete
// @access  Private
exports.completeSession = asyncHandler(async (req, res) => {
    const session = await ClassSession.findById(req.params.sessionId);
    if (!session) {
        return res.status(404).json({ success: false, error: 'Session not found' });
    }
    if (session.status === 'Cancelled') {
        return res.status(400).json({ success: false, error: 'Cancelled sessions cannot accept attendance' });
    }

    const records = Array.isArray(req.body.records) ? req.body.records : [];
    const endOfSessionDay = new Date(session.date);
    endOfSessionDay.setUTCHours(23, 59, 59, 999);
    const eligibleEnrollments = await Enrollment.find({
        assignedClass: session.assignedClass,
        startDate: { $lte: endOfSessionDay },
        $or: [{ endDate: null }, { endDate: { $gte: session.date } }],
    }).select('student');
    const eligibleIds = new Set(eligibleEnrollments.map((item) => String(item.student)));

    if (records.length !== eligibleIds.size) {
        return res.status(400).json({ success: false, error: 'Please mark every eligible student before confirming attendance' });
    }

    const allowedStatuses = new Set(['Present', 'Absent']);
    const seenStudents = new Set();

    for (const record of records) {
        const studentId = String(record.student);
        if (!eligibleIds.has(studentId) || seenStudents.has(studentId) || !allowedStatuses.has(record.status)) {
            return res.status(400).json({ success: false, error: 'Attendance roster contains an invalid student or status' });
        }
        seenStudents.add(studentId);
    }

    const operations = records.map((record) => ({
        updateOne: {
            filter: { session: session._id, student: record.student },
            update: {
                $set: {
                    assignedClass: session.assignedClass,
                    date: session.date,
                    status: record.status,
                    note: record.note || '',
                    markedBy: req.user.id,
                },
                $setOnInsert: {
                    session: session._id,
                    student: record.student,
                },
            },
            upsert: true,
        },
    }));

    if (operations.length > 0) {
        await Attendance.bulkWrite(operations);
    }

    session.status = 'Completed';
    session.completedAt = new Date();
    await session.save();

    const counts = records.reduce((result, record) => {
        result[record.status] += 1;
        return result;
    }, { Present: 0, Absent: 0 });

    res.status(200).json({
        success: true,
        data: { session, counts },
    });
});

// @desc    Get an individual student's attendance summary
// @route   GET /api/attendance/student/:studentId/summary
// @access  Private
exports.getStudentAttendanceSummary = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.studentId)
        .select('fullName studentId grade academicYear joinedDate');

    if (!student) {
        return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const year = Number(req.query.year || student.academicYear || new Date().getFullYear());
    const month = req.query.month ? Number(req.query.month) : null;
    let startDate;
    let endDate;

    if (req.query.startDate && req.query.endDate) {
        startDate = normalizeDate(req.query.startDate);
        endDate = normalizeDate(req.query.endDate);
        if (endDate) endDate.setUTCHours(23, 59, 59, 999);
    } else if (month && month >= 1 && month <= 12) {
        startDate = new Date(Date.UTC(year, month - 1, 1));
        endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    } else {
        startDate = new Date(Date.UTC(year, 0, 1));
        endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    }

    if (!startDate || !endDate) {
        return res.status(400).json({ success: false, error: 'Please provide a valid report period' });
    }

    const effectiveStart = student.joinedDate > startDate ? student.joinedDate : startDate;
    const attendance = await Attendance.find({
        student: student._id,
        date: { $gte: effectiveStart, $lte: endDate },
    })
        .populate({
            path: 'session',
            match: { status: 'Completed' },
            select: 'sessionId date status assignedClass',
        })
        .populate({
            path: 'assignedClass',
            select: 'classId className location grade',
        })
        .sort('date')
        .lean();

    const completedAttendance = attendance.filter((record) => record.session);

    const counts = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    const history = completedAttendance.map((record) => {
        counts[record.status] += 1;
        return {
            sessionId: record.session.sessionId,
            date: record.date,
            status: record.status,
            note: record.note || '',
            assignedClass: record.assignedClass,
        };
    });

    const totalEligibleSessions = completedAttendance.length;
    const countedSessions = totalEligibleSessions - counts.Excused;
    const attendedSessions = counts.Present + counts.Late;
    const attendanceRate = countedSessions > 0
        ? Number(((attendedSessions / countedSessions) * 100).toFixed(1))
        : 0;

    res.status(200).json({
        success: true,
        data: {
            student,
            period: { startDate, endDate, year, month },
            totalEligibleSessions,
            countedSessions,
            counts,
            attendanceRate,
            history,
        },
    });
});
