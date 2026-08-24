const mongoose = require('mongoose');

const ClassSessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
        },
        assignedClass: {
            type: mongoose.Schema.ObjectId,
            ref: 'Class',
            required: [true, 'Please select a class'],
        },
        date: {
            type: Date,
            required: [true, 'Please select a session date'],
        },
        startTime: {
            type: String,
            default: '',
        },
        endTime: {
            type: String,
            default: '',
        },
        location: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['Open', 'Completed', 'Cancelled'],
            default: 'Open',
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'Teacher',
            required: true,
        },
        completedAt: Date,
    },
    { timestamps: true }
);

ClassSessionSchema.index({ assignedClass: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ClassSession', ClassSessionSchema);
