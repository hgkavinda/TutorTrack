const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const Exam = require('../models/Exam');
const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const StudentRating = require('../models/StudentRating');

const EXAM_WEIGHTS = {
    'Weekly Test': 0.6,
    'Monthly Exam': 1,
    'Term Exam': 1.2,
    'Model Paper': 1,
    'Revision Test': 0.7,
    Assignment: 0.5,
};

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round = (value) => Number(value.toFixed(1));

const performanceGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'E';
};

const ratingGrade = (rating) => {
    if (rating >= 90) return 'A+';
    if (rating >= 80) return 'A';
    if (rating >= 70) return 'B+';
    if (rating >= 60) return 'B';
    if (rating >= 50) return 'C';
    if (rating >= 40) return 'D';
    return 'E';
};

const standardDeviation = (values) => {
    if (values.length < 2) return 0;
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + ((value - average) ** 2), 0) / values.length;
    return Math.sqrt(variance);
};

const generateExamId = (grade, date) => {
    const datePart = new Date(date).toISOString().slice(0, 7).replace('-', '');
    return `EXM-G${String(grade).padStart(2, '0')}-${datePart}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
};

const getEligibleStudents = async (exam) => {
    const endOfExamDay = new Date(exam.examDate);
    endOfExamDay.setUTCHours(23, 59, 59, 999);
    return Student.find({
        grade: exam.grade,
        status: 'active',
        joinedDate: { $lte: endOfExamDay },
    }).select('studentId fullName grade').sort('fullName');
};

exports.getExams = asyncHandler(async (req, res) => {
    const query = {};
    ['grade', 'type', 'status', 'academicYear'].forEach((field) => {
        if (req.query[field]) query[field] = req.query[field];
    });
    const exams = await Exam.find(query).sort('-examDate');
    res.status(200).json({ success: true, count: exams.length, data: exams });
});

exports.createExam = asyncHandler(async (req, res) => {
    const weight = EXAM_WEIGHTS[req.body.type];
    if (!weight) {
        return res.status(400).json({ success: false, error: 'Please select a valid exam type' });
    }

    const examDate = new Date(req.body.examDate);
    if (Number.isNaN(examDate.getTime())) {
        return res.status(400).json({ success: false, error: 'Please select a valid exam date' });
    }

    const exam = await Exam.create({
        name: req.body.name,
        type: req.body.type,
        weight,
        grade: req.body.grade,
        subject: req.body.subject,
        examDate,
        totalMarks: req.body.totalMarks,
        academicYear: req.body.academicYear,
        examId: generateExamId(req.body.grade, examDate),
        createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: exam });
});

exports.getExamRoster = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
        return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    const students = await getEligibleStudents(exam);
    const enrollments = await Enrollment.find({
        student: { $in: students.map((student) => student._id) },
        status: 'active',
    }).populate('assignedClass', 'classId className location grade');
    const results = await Mark.find({ exam: exam._id });
    const resultByStudent = new Map(results.map((result) => [String(result.student), result]));

    const roster = students.map((student) => {
        const result = resultByStudent.get(String(student._id));
        return {
            student,
            assignedClasses: enrollments
                .filter((item) => String(item.student) === String(student._id))
                .map((item) => item.assignedClass),
            result: result || {
                resultStatus: 'Pending',
                marksObtained: null,
                remarks: '',
            },
        };
    });

    res.status(200).json({ success: true, data: { exam, roster } });
});

exports.saveDraftResults = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
        return res.status(404).json({ success: false, error: 'Exam not found' });
    }
    if (exam.status !== 'Draft') {
        return res.status(400).json({ success: false, error: 'Published exam results are locked' });
    }

    const eligibleStudents = await getEligibleStudents(exam);
    const eligibleIds = new Set(eligibleStudents.map((student) => String(student._id)));
    const results = Array.isArray(req.body.results) ? req.body.results : [];
    const allowedStatuses = new Set(['Completed', 'Absent', 'Excused', 'Pending']);
    const seen = new Set();

    for (const result of results) {
        const studentId = String(result.student);
        if (!eligibleIds.has(studentId) || seen.has(studentId) || !allowedStatuses.has(result.resultStatus)) {
            return res.status(400).json({ success: false, error: 'Results contain an invalid student or status' });
        }
        seen.add(studentId);

        if (result.resultStatus === 'Completed') {
            const marks = Number(result.marksObtained);
            if (!Number.isFinite(marks) || marks < 0 || marks > exam.totalMarks) {
                return res.status(400).json({
                    success: false,
                    error: `Marks must be between 0 and ${exam.totalMarks}`,
                });
            }
        }
    }

    const operations = results.map((result) => {
        const completed = result.resultStatus === 'Completed';
        const marks = completed ? Number(result.marksObtained) : null;
        const percentage = completed ? round((marks / exam.totalMarks) * 100) : null;
        return {
            updateOne: {
                filter: { exam: exam._id, student: result.student },
                update: {
                    $set: {
                        resultStatus: result.resultStatus,
                        marksObtained: marks,
                        percentage,
                        performanceGrade: completed ? performanceGrade(percentage) : null,
                        remarks: result.remarks || '',
                    },
                    $setOnInsert: { exam: exam._id, student: result.student },
                },
                upsert: true,
            },
        };
    });

    if (operations.length > 0) await Mark.bulkWrite(operations);
    res.status(200).json({ success: true, saved: operations.length });
});

exports.publishExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) {
        return res.status(404).json({ success: false, error: 'Exam not found' });
    }
    if (exam.status !== 'Draft') {
        return res.status(400).json({ success: false, error: 'Exam is already published' });
    }

    const laterPublishedExam = await Exam.findOne({
        grade: exam.grade,
        subject: exam.subject,
        academicYear: exam.academicYear,
        status: 'Published',
        examDate: { $gt: exam.examDate },
    });
    if (laterPublishedExam) {
        return res.status(400).json({
            success: false,
            error: 'Publish exams in date order so rating history remains accurate',
        });
    }

    const eligibleStudents = await getEligibleStudents(exam);
    const results = await Mark.find({ exam: exam._id });
    const resultByStudent = new Map(results.map((result) => [String(result.student), result]));
    const incomplete = eligibleStudents.filter((student) => {
        const result = resultByStudent.get(String(student._id));
        return !result || result.resultStatus === 'Pending';
    });
    if (incomplete.length > 0) {
        return res.status(400).json({
            success: false,
            error: `Complete or mark absent/excused for all students before publishing (${incomplete.length} remaining)`,
        });
    }

    const completed = results
        .filter((result) => result.resultStatus === 'Completed')
        .sort((a, b) => b.percentage - a.percentage);
    if (completed.length === 0) {
        return res.status(400).json({ success: false, error: 'At least one completed result is required' });
    }

    const previousExams = await Exam.find({
        _id: { $ne: exam._id },
        grade: exam.grade,
        subject: exam.subject,
        academicYear: exam.academicYear,
        status: 'Published',
        examDate: { $lte: exam.examDate },
    }).select('_id weight examDate');
    const previousExamMap = new Map(previousExams.map((item) => [String(item._id), item]));

    const markOperations = [];
    const ratingOperations = [];

    for (const result of completed) {
        const equalCount = completed.filter((item) => item.percentage === result.percentage).length;
        const belowCount = completed.filter((item) => item.percentage < result.percentage).length;
        const percentile = round(((belowCount + (0.5 * equalCount)) / completed.length) * 100);
        const gradePosition = completed.length >= 5 ? percentile : result.percentage;
        const rank = completed.findIndex((item) => item.percentage === result.percentage) + 1;

        const history = await Mark.find({
            student: result.student,
            exam: { $in: previousExams.map((item) => item._id) },
            resultStatus: 'Completed',
        }).select('exam percentage').lean();
        const series = history
            .map((item) => ({
                percentage: item.percentage,
                weight: previousExamMap.get(String(item.exam))?.weight || 1,
                date: previousExamMap.get(String(item.exam))?.examDate,
            }))
            .filter((item) => item.date)
            .concat([{ percentage: result.percentage, weight: exam.weight, date: exam.examDate }])
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-5);

        let weightedTotal = 0;
        let totalWeight = 0;
        series.forEach((item, index) => {
            const combinedWeight = (index + 1) * item.weight;
            weightedTotal += item.percentage * combinedWeight;
            totalWeight += combinedWeight;
        });
        const recentPerformance = round(weightedTotal / totalWeight);

        const changes = series.slice(1).map((item, index) => item.percentage - series[index].percentage);
        const averageChange = changes.length
            ? changes.reduce((sum, value) => sum + value, 0) / changes.length
            : 0;
        const improvement = round(clamp(50 + (averageChange * 5)));
        const consistency = round(clamp(100 - (standardDeviation(series.map((item) => item.percentage)) * 4)));
        const ratingStatus = series.length >= 3 ? 'Full' : 'Provisional';
        const overallRating = ratingStatus === 'Full'
            ? round((recentPerformance * 0.55) + (gradePosition * 0.20) + (improvement * 0.15) + (consistency * 0.10))
            : round((recentPerformance * 0.70) + (gradePosition * 0.30));

        const existingRating = await StudentRating.findOne({
            student: result.student,
            subject: exam.subject,
            academicYear: exam.academicYear,
        });
        const previousRating = existingRating?.overallRating ?? null;
        const change = previousRating == null ? 0 : round(overallRating - previousRating);
        const components = {
            recentPerformance,
            gradePosition: round(gradePosition),
            improvement,
            consistency,
        };

        markOperations.push({
            updateOne: {
                filter: { _id: result._id },
                update: {
                    $set: {
                        gradeRank: rank,
                        cohortSize: completed.length,
                        percentile,
                        overallRating,
                        ratingGrade: ratingGrade(overallRating),
                        ratingChange: change,
                        ratingStatus,
                        ratingComponents: components,
                    },
                },
            },
        });
        ratingOperations.push({
            updateOne: {
                filter: {
                    student: result.student,
                    subject: exam.subject,
                    academicYear: exam.academicYear,
                },
                update: {
                    $set: {
                        grade: exam.grade,
                        overallRating,
                        ratingGrade: ratingGrade(overallRating),
                        ratingStatus,
                        previousRating,
                        change,
                        latestExam: exam._id,
                        components,
                    },
                    $setOnInsert: {
                        student: result.student,
                        subject: exam.subject,
                        academicYear: exam.academicYear,
                    },
                },
                upsert: true,
            },
        });
    }

    if (markOperations.length > 0) await Mark.bulkWrite(markOperations);
    if (ratingOperations.length > 0) await StudentRating.bulkWrite(ratingOperations);

    exam.status = 'Published';
    exam.publishedAt = new Date();
    await exam.save();

    res.status(200).json({
        success: true,
        data: { exam, ratedStudents: completed.length },
    });
});

exports.getStudentRatings = asyncHandler(async (req, res) => {
    const ratings = await StudentRating.find({ student: req.params.studentId })
        .populate('latestExam', 'examId name type examDate')
        .sort('-academicYear subject');
    const history = await Mark.find({
        student: req.params.studentId,
        overallRating: { $ne: null },
    })
        .populate('exam', 'examId name type subject grade examDate totalMarks academicYear')
        .sort('-createdAt');

    res.status(200).json({ success: true, data: { ratings, history } });
});
