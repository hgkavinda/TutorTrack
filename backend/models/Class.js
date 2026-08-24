const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema(
    {
        classId: {
            type: String,
            unique: true,
            sparse: true,
            immutable: true,
            uppercase: true,
            trim: true,
        },
        className: {
            type: String,
            required: [true, 'Please add a class name'],
            trim: true,
        },
        subject: {
            type: String,
            required: [true, 'Please add a subject'],
        },
        grade: {
            type: String,
            enum: ['6', '7', '8', '9', '10', '11'],
            required: [true, 'Please add a grade level'],
        },
        location: {
            type: String,
            required: [true, 'Please add a class location'],
            trim: true,
        },
        contactNumber: {
            type: String,
            required: [true, 'Please add a class contact number'],
            trim: true,
        },
        day: {
            type: String,
            required: [true, 'Please specify the day of the week'],
        },
        startTime: {
            type: String,
            default: '',
        },
        endTime: {
            type: String,
            default: '',
        },
        monthlyFee: {
            type: Number,
            min: [0, 'Monthly fee cannot be negative'],
            default: null,
        },
        feeDueRule: {
            type: String,
            enum: ['AfterSessions', 'FixedDay', 'MonthStart'],
            default: 'AfterSessions',
        },
        feeDueAfterSessions: {
            type: Number,
            min: 1,
            max: 12,
            default: 4,
        },
        feeDueDay: {
            type: Number,
            min: 1,
            max: 28,
            default: 10,
        },
        description: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Reverse populate enrollment records to calculate active class membership.
ClassSchema.virtual('enrollments', {
    ref: 'Enrollment',
    localField: '_id',
    foreignField: 'assignedClass',
    justOne: false,
});

module.exports = mongoose.model('Class', ClassSchema);
