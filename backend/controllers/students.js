const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Fee = require('../models/Fee');
const StudentRating = require('../models/StudentRating');
const Exam = require('../models/Exam');

const classFields = 'classId className subject grade location';

const resolveClasses = async (classIds) => {
    const uniqueIds = [...new Set((classIds || []).filter(Boolean).map(String))];
    if (uniqueIds.length === 0) {
        return { error: 'Please select at least one class' };
    }

    const classes = await Class.find({ _id: { $in: uniqueIds }, status: 'active' })
        .select(classFields);
    if (classes.length !== uniqueIds.length) {
        return { error: 'One or more selected classes were not found or are inactive' };
    }

    const grades = new Set(classes.map((classItem) => classItem.grade));
    if (grades.size !== 1) {
        return { error: 'All selected classes must belong to the same grade' };
    }

    return { classes, grade: classes[0].grade };
};

const addActiveEnrollments = async (students) => {
    const studentIds = students.map((student) => student._id);
    const enrollments = await Enrollment.find({
        student: { $in: studentIds },
        status: 'active',
    }).populate('assignedClass', classFields);

    const byStudent = new Map();
    enrollments.forEach((enrollment) => {
        const key = String(enrollment.student);
        if (!byStudent.has(key)) byStudent.set(key, []);
        byStudent.get(key).push(enrollment);
    });

    return students.map((student) => {
        const data = student.toJSON();
        const activeEnrollments = byStudent.get(String(student._id)) || [];
        data.enrollments = activeEnrollments;
        data.assignedClasses = activeEnrollments.map((item) => item.assignedClass);
        data.assignedClass = data.assignedClasses[0] || null;
        return data;
    });
};

exports.getStudents = asyncHandler(async (req, res) => {
    const query = {};
    ['grade', 'status', 'academicYear'].forEach((field) => {
        if (req.query[field]) query[field] = req.query[field];
    });

    if (req.query.assignedClass) {
        const enrollments = await Enrollment.find({
            assignedClass: req.query.assignedClass,
            status: 'active',
        }).select('student');
        query._id = { $in: enrollments.map((item) => item.student) };
    }

    const students = await Student.find(query).sort('fullName');
    const data = await addActiveEnrollments(students);

    res.status(200).json({ success: true, count: data.length, data });
});

exports.getStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
        return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const enrollments = await Enrollment.find({ student: student._id })
        .populate('assignedClass', `${classFields} monthlyFee`)
        .sort('-startDate');
    const [attendance, marks, fees, ratings] = await Promise.all([
        Attendance.find({ student: student._id }).sort('-date').limit(20),
        Mark.find({ student: student._id })
            .populate('exam', 'examId name type subject examDate totalMarks status')
            .sort('-createdAt')
            .limit(20),
        Fee.find({ student: student._id }).sort('-createdAt').limit(20),
        StudentRating.find({ student: student._id })
            .populate('latestExam', 'examId name type examDate')
            .sort('-academicYear subject'),
    ]);

    const data = student.toJSON();
    data.enrollments = enrollments;
    data.assignedClasses = enrollments
        .filter((item) => item.status === 'active')
        .map((item) => item.assignedClass);

    res.status(200).json({
        success: true,
        data: { student: data, summaries: { attendance, marks, fees, ratings } },
    });
});

exports.getStudentReport = asyncHandler(async (req, res) => {
    const year = Number(req.query.year || new Date().getFullYear());
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
        return res.status(400).json({ success: false, error: 'Please provide a valid report year' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
        return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year + 1, 0, 1));
    const examIds = await Exam.find({ academicYear: year, status: 'Published' }).distinct('_id');
    const [enrollments, attendance, marks, fees, ratings] = await Promise.all([
        Enrollment.find({ student: student._id })
            .populate('assignedClass', `${classFields} monthlyFee`)
            .sort('-startDate'),
        Attendance.find({ student: student._id, date: { $gte: startDate, $lt: endDate } })
            .populate('assignedClass', classFields)
            .sort('-date'),
        Mark.find({ student: student._id, exam: { $in: examIds } })
            .populate('exam', 'examId name type subject examDate totalMarks academicYear')
            .sort('-createdAt'),
        Fee.find({ student: student._id, billingMonth: { $regex: `^${year}-` } })
            .populate('assignedClass', classFields)
            .sort('-billingMonth'),
        StudentRating.find({ student: student._id, academicYear: year })
            .populate('latestExam', 'examId name type examDate')
            .sort('subject'),
    ]);

    const attendanceCounts = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    attendance.forEach((record) => {
        attendanceCounts[record.status] = (attendanceCounts[record.status] || 0) + 1;
    });
    const countedAttendance = attendanceCounts.Present + attendanceCounts.Absent + attendanceCounts.Late;
    const attended = attendanceCounts.Present + attendanceCounts.Late;
    const completedMarks = marks.filter((mark) => mark.resultStatus === 'Completed');
    const paidFees = fees.filter((fee) => fee.status === 'Paid');
    const unpaidFees = fees.filter((fee) => fee.status === 'Unpaid');
    const waivedFees = fees.filter((fee) => fee.status === 'Waived');

    res.status(200).json({
        success: true,
        data: {
            year,
            generatedAt: new Date(),
            student,
            enrollments,
            attendance: {
                summary: {
                    ...attendanceCounts,
                    total: attendance.length,
                    rate: countedAttendance ? Math.round((attended / countedAttendance) * 1000) / 10 : 0,
                },
                history: attendance,
            },
            performance: {
                ratings,
                results: marks,
                summary: {
                    completedExams: completedMarks.length,
                    average: completedMarks.length
                        ? Math.round((completedMarks.reduce((sum, mark) => sum + Number(mark.percentage || 0), 0) / completedMarks.length) * 10) / 10
                        : 0,
                    best: completedMarks.length
                        ? Math.max(...completedMarks.map((mark) => Number(mark.percentage || 0)))
                        : 0,
                },
            },
            fees: {
                invoices: fees,
                summary: {
                    billed: fees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0),
                    paid: paidFees.reduce((sum, fee) => sum + Number(fee.paidAmount || 0), 0),
                    outstanding: unpaidFees.reduce((sum, fee) => sum + Number(fee.balance || 0), 0),
                    paidCount: paidFees.length,
                    unpaidCount: unpaidFees.length,
                    waivedCount: waivedFees.length,
                },
            },
        },
    });
});

exports.createStudent = asyncHandler(async (req, res) => {
    const requestedClasses = req.body.assignedClasses || [req.body.assignedClass];
    const { classes, grade, error } = await resolveClasses(requestedClasses);
    if (error) {
        return res.status(400).json({ success: false, error });
    }

    const temporaryPassword = crypto.randomBytes(9).toString('base64url');
    const studentData = { ...req.body };
    delete studentData.assignedClasses;
    delete studentData.assignedClass;

    const student = await Student.create({
        ...studentData,
        grade,
        password: temporaryPassword,
        mustChangePassword: true,
        accountStatus: 'active',
    });

    try {
        const enrollments = await Enrollment.insertMany(classes.map((classItem) => ({
            student: student._id,
            assignedClass: classItem._id,
            startDate: req.body.joinedDate || new Date(),
            createdBy: req.user.id,
        })));

        const responseStudent = student.toJSON();
        responseStudent.enrollments = enrollments;
        responseStudent.assignedClasses = classes;

        res.status(201).json({
            success: true,
            data: responseStudent,
            credentials: {
                username: student.studentId,
                temporaryPassword,
            },
        });
    } catch (error) {
        await Student.findByIdAndDelete(student._id);
        throw error;
    }
});

exports.updateStudent = asyncHandler(async (req, res) => {
    const allowedFields = [
        'fullName', 'studentId', 'gender', 'dateOfBirth', 'parentName',
        'parentPhone', 'email', 'address', 'joinedDate', 'academicYear',
        'status', 'accountStatus',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const student = await Student.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    });
    if (!student) {
        return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.status(200).json({ success: true, data: student });
});

exports.addEnrollment = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
        return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const { classes, grade, error } = await resolveClasses([req.body.assignedClass]);
    if (error) {
        return res.status(400).json({ success: false, error });
    }
    if (student.grade !== grade) {
        return res.status(400).json({
            success: false,
            error: `This student is in Grade ${student.grade}; the selected class is Grade ${grade}`,
        });
    }

    const existing = await Enrollment.findOne({
        student: student._id,
        assignedClass: classes[0]._id,
        status: 'active',
    });
    if (existing) {
        return res.status(400).json({ success: false, error: 'Student is already enrolled in this class' });
    }

    const enrollment = await Enrollment.create({
        student: student._id,
        assignedClass: classes[0]._id,
        startDate: req.body.startDate || new Date(),
        reason: req.body.reason || '',
        createdBy: req.user.id,
    });
    await enrollment.populate('assignedClass', classFields);

    res.status(201).json({ success: true, data: enrollment });
});

exports.endEnrollment = asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findOne({
        _id: req.params.enrollmentId,
        student: req.params.id,
        status: 'active',
    });
    if (!enrollment) {
        return res.status(404).json({ success: false, error: 'Active enrollment not found' });
    }

    enrollment.status = 'completed';
    enrollment.endDate = req.body.endDate || new Date();
    enrollment.reason = req.body.reason || enrollment.reason;
    await enrollment.save();

    res.status(200).json({ success: true, data: enrollment });
});

exports.resetStudentPassword = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id).select('+password');
    if (!student) {
        return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const temporaryPassword = crypto.randomBytes(9).toString('base64url');
    student.password = temporaryPassword;
    student.mustChangePassword = true;
    student.accountStatus = 'active';
    await student.save();

    res.status(200).json({
        success: true,
        credentials: { username: student.studentId, temporaryPassword },
    });
});

exports.deleteStudent = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) {
        return res.status(404).json({ success: false, error: 'Student not found' });
    }

    await Enrollment.deleteMany({ student: student._id });
    await student.deleteOne();
    res.status(200).json({ success: true, data: {} });
});
