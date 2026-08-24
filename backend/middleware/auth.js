const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const asyncHandler = require('./asyncHandler'); // We will create this

exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route',
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role && decoded.role !== 'teacher') {
            return res.status(403).json({ success: false, error: 'Teacher access required' });
        }
        req.user = await Teacher.findById(decoded.id);
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Teacher account not found' });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route',
        });
    }
});

const Student = require('../models/Student');

exports.protectStudent = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'student') {
            return res.status(403).json({ success: false, error: 'Student access required' });
        }

        req.student = await Student.findById(decoded.id);
        if (!req.student || req.student.accountStatus !== 'active') {
            return res.status(401).json({ success: false, error: 'Student account is unavailable' });
        }
        next();
    } catch {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
});
