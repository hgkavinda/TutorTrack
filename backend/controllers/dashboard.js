const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Payment = require('../models/Fee');
const Announcement = require('../models/Announcement');
const Enrollment = require('../models/Enrollment');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    const totalStudents = await Student.countDocuments();
    const totalClasses = await Class.countDocuments();

    const pendingFeesCount = await Payment.countDocuments({ status: 'Unpaid' });

    // Recent 5 announcements
    const recentAnnouncements = await Announcement.find()
        .sort('-createdAt')
        .limit(5);

    // Recent 5 students
    const recentStudentDocs = await Student.find()
        .sort('-createdAt')
        .limit(5)
        .lean();
    const recentEnrollments = await Enrollment.find({
        student: { $in: recentStudentDocs.map((student) => student._id) },
        status: 'active',
    }).populate({ path: 'assignedClass', select: 'className location' });
    const recentStudents = recentStudentDocs.map((student) => {
        const assignedClasses = recentEnrollments
            .filter((item) => String(item.student) === String(student._id))
            .map((item) => item.assignedClass);
        return {
            ...student,
            assignedClasses,
            assignedClass: assignedClasses[0] || null,
        };
    });

    // Assuming Today's classes logic based on current Day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    const todaysClasses = await Class.find({ day: currentDay, status: 'active' });

    // Monthly Fee Revenue Summary
    const currentYearMonth = new Date().toISOString().slice(0, 7);
    const monthlyFees = await Payment.find({
        billingMonth: { $regex: `^${currentYearMonth}` }
    });
    const monthlyRevenue = monthlyFees.reduce((acc, f) => {
        acc.total += f.amount || 0;
        acc.collected += f.paidAmount || 0;
        acc.outstanding += f.balance || 0;
        return acc;
    }, { total: 0, collected: 0, outstanding: 0 });

    const upcomingClasses = await Class.find({ status: 'active' }).limit(4);

    res.status(200).json({
        success: true,
        data: {
            totalStudents,
            totalClasses,
            pendingFeesCount,
            todaysClassesCount: todaysClasses.length,
            todaysClasses,
            upcomingClasses,
            monthlyRevenue,
            recentStudents,
            recentAnnouncements,
        },
    });
});
