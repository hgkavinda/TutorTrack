const asyncHandler = require('../middleware/asyncHandler');
const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const crypto = require('crypto');

const generateClassId = (grade) => {
    const gradePart = String(grade).padStart(2, '0');
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `CLS-G${gradePart}-${randomPart}`;
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
exports.getClasses = asyncHandler(async (req, res, next) => {
    const classes = await Class.find()
        .populate({ path: 'enrollments', match: { status: 'active' }, select: '_id' })
        .lean({ virtuals: true });
    const data = classes.map((classItem) => ({
        ...classItem,
        studentCount: classItem.enrollments?.length || 0,
        enrollments: undefined,
    }));

    res.status(200).json({
        success: true,
        count: data.length,
        data,
    });
});

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
exports.getClass = asyncHandler(async (req, res, next) => {
    const cls = await Class.findById(req.params.id)
        .populate({
            path: 'enrollments',
            match: { status: 'active' },
            select: 'student startDate',
            populate: { path: 'student', select: 'studentId fullName grade' },
        });

    if (!cls) {
        return res.status(404).json({ success: false, error: 'Class not found' });
    }

    res.status(200).json({
        success: true,
        data: cls,
    });
});

// @desc    Create new class
// @route   POST /api/classes
// @access  Private
exports.createClass = asyncHandler(async (req, res, next) => {
    const cls = await Class.create({
        ...req.body,
        classId: generateClassId(req.body.grade),
    });

    res.status(201).json({
        success: true,
        data: cls,
    });
});

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private
exports.updateClass = asyncHandler(async (req, res, next) => {
    delete req.body.classId;

    let cls = await Class.findById(req.params.id);

    if (!cls) {
        return res.status(404).json({ success: false, error: 'Class not found' });
    }

    if (req.body.grade && req.body.grade !== cls.grade) {
        const activeEnrollments = await Enrollment.countDocuments({
            assignedClass: cls._id,
            status: 'active',
        });
        if (activeEnrollments > 0) {
            return res.status(400).json({
                success: false,
                error: 'Grade cannot be changed while this class has active students',
            });
        }
    }

    const allowedFields = [
        'className', 'subject', 'grade', 'location', 'contactNumber', 'day',
        'startTime', 'endTime', 'monthlyFee', 'description', 'status',
        'feeDueRule', 'feeDueAfterSessions', 'feeDueDay',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    cls = await Class.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: cls,
    });
});

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private
exports.deleteClass = asyncHandler(async (req, res, next) => {
    const cls = await Class.findById(req.params.id);

    if (!cls) {
        return res.status(404).json({ success: false, error: 'Class not found' });
    }

    const activeEnrollments = await Enrollment.countDocuments({
        assignedClass: cls._id,
        status: 'active',
    });
    if (activeEnrollments > 0) {
        return res.status(400).json({
            success: false,
            error: 'This class has active students. End their enrollments before deleting the class.',
        });
    }

    await cls.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
    });
});
