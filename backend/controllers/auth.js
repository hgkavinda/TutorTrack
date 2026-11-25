const Teacher = require('../models/Teacher');
const asyncHandler = require('../middleware/asyncHandler');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');

// Get token from model, create cookie and send response
const sendTokenResponse = (teacher, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: teacher._id, role: 'teacher' }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.status(statusCode).json({
        success: true,
        token,
        role: 'teacher',
    });
};

// @desc    Login teacher
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate emil & password
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for teacher
    const teacher = await Teacher.findOne({ email }).select('+password');

    if (!teacher) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await teacher.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(teacher, 200, res);
});

// @desc    Get current logged in teacher
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const teacher = await Teacher.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: teacher,
    });
});

// @desc    Update teacher profile/password
// @route   PUT /api/auth/change-password
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const teacher = await Teacher.findById(req.user.id).select('+password');
    if (!teacher) {
        return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    if (req.body.name) teacher.name = req.body.name;
    if (req.body.phoneNumber !== undefined) teacher.phoneNumber = req.body.phoneNumber;
    if (req.body.profilePhoto !== undefined) teacher.profilePhoto = req.body.profilePhoto;

    // If changing password
    if (req.body.newPassword) {
        if (!req.body.currentPassword) {
            return res.status(400).json({ success: false, error: 'Please enter your current password' });
        }
        const isMatch = await teacher.matchPassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Current password is incorrect' });
        }
        if (req.body.newPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
        }
        teacher.password = req.body.newPassword;
    }

    await teacher.save();

    res.status(200).json({
        success: true,
        data: {
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            phoneNumber: teacher.phoneNumber,
            profilePhoto: teacher.profilePhoto,
        },
        message: 'Profile updated successfully',
    });
});

exports.studentLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Please provide a Student ID and password' });
    }

    const student = await Student.findOne({
        studentId: String(username).trim().toUpperCase(),
    }).select('+password');
    if (!student || student.accountStatus !== 'active') {
        return res.status(401).json({ success: false, error: 'Invalid Student ID or password' });
    }

    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid Student ID or password' });
    }

    const token = jwt.sign(
        { id: student._id, role: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
    res.status(200).json({
        success: true,
        token,
        role: 'student',
        mustChangePassword: student.mustChangePassword,
    });
});

exports.getStudentMe = asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({
        student: req.student._id,
        status: 'active',
    }).populate('assignedClass', 'classId className grade location subject');

    const data = req.student.toJSON();
    data.role = 'student';
    data.assignedClasses = enrollments.map((item) => item.assignedClass);

    res.status(200).json({ success: true, data });
});

exports.changeStudentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Please provide current and new passwords' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
    }

    const student = await Student.findById(req.student._id).select('+password');
    const isMatch = await student.matchPassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    student.password = newPassword;
    student.mustChangePassword = false;
    await student.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
});

// @desc    Get public teacher contact info for password reset help
// @route   GET /api/auth/public-contact
// @access  Public
exports.getPublicContact = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findOne().select('name phoneNumber');
    res.status(200).json({
        success: true,
        data: {
            teacherName: teacher?.name || 'Sir HG Kavinda',
            phoneNumber: teacher?.phoneNumber || '',
        },
    });
});
