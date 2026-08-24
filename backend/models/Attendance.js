const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
    {
        session: {
            type: mongoose.Schema.ObjectId,
            ref: 'ClassSession',
            required: [true, 'Please associate a class session'],
        },
        student: {
            type: mongoose.Schema.ObjectId,
            ref: 'Student',
            required: [true, 'Please add a student'],
        },
        assignedClass: {
            type: mongoose.Schema.ObjectId,
            ref: 'Class',
            required: [true, 'Please add a class'],
        },
        date: {
            type: Date,
            required: [true, 'Please add a date'],
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late', 'Excused'],
            required: [true, 'Please add attendance status'],
        },
        note: {
            type: String,
            default: '',
            trim: true,
        },
        markedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'Teacher',
            required: [true, 'Please associate the teacher marking the attendance'],
        },
    },
    {
        timestamps: true,
    }
);

// Prevent marking attendance twice for the same student on the same day for a class
AttendanceSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
