const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.ObjectId,
            ref: 'Student',
            required: true,
        },
        assignedClass: {
            type: mongoose.Schema.ObjectId,
            ref: 'Class',
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endDate: Date,
        status: {
            type: String,
            enum: ['active', 'completed'],
            default: 'active',
        },
        reason: {
            type: String,
            default: '',
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'Teacher',
            required: true,
        },
    },
    { timestamps: true }
);

EnrollmentSchema.index(
    { student: 1, assignedClass: 1 },
    { unique: true, partialFilterExpression: { status: 'active' } }
);
EnrollmentSchema.index({ assignedClass: 1, status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
