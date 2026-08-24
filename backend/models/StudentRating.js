const mongoose = require('mongoose');

const StudentRatingSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.ObjectId,
            ref: 'Student',
            required: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        academicYear: {
            type: Number,
            required: true,
        },
        grade: {
            type: String,
            required: true,
        },
        overallRating: {
            type: Number,
            required: true,
        },
        ratingGrade: {
            type: String,
            required: true,
        },
        ratingStatus: {
            type: String,
            enum: ['Provisional', 'Full'],
            required: true,
        },
        previousRating: Number,
        change: {
            type: Number,
            default: 0,
        },
        latestExam: {
            type: mongoose.Schema.ObjectId,
            ref: 'Exam',
            required: true,
        },
        components: {
            recentPerformance: Number,
            gradePosition: Number,
            improvement: Number,
            consistency: Number,
        },
    },
    { timestamps: true }
);

StudentRatingSchema.index(
    { student: 1, subject: 1, academicYear: 1 },
    { unique: true }
);

module.exports = mongoose.model('StudentRating', StudentRatingSchema);
