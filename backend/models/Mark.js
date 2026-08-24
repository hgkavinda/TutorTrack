const mongoose = require('mongoose');

const MarkSchema = new mongoose.Schema(
    {
        exam: {
            type: mongoose.Schema.ObjectId,
            ref: 'Exam',
            required: true,
        },
        student: {
            type: mongoose.Schema.ObjectId,
            ref: 'Student',
            required: true,
        },
        resultStatus: {
            type: String,
            enum: ['Completed', 'Absent', 'Excused', 'Pending'],
            default: 'Pending',
        },
        marksObtained: {
            type: Number,
            min: 0,
            default: null,
        },
        percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: null,
        },
        performanceGrade: String,
        remarks: {
            type: String,
            default: '',
            trim: true,
        },
        gradeRank: Number,
        cohortSize: Number,
        percentile: Number,
        overallRating: Number,
        ratingGrade: String,
        ratingChange: Number,
        ratingStatus: {
            type: String,
            enum: ['Provisional', 'Full'],
        },
        ratingComponents: {
            recentPerformance: Number,
            gradePosition: Number,
            improvement: Number,
            consistency: Number,
        },
    },
    { timestamps: true }
);

MarkSchema.index({ exam: 1, student: 1 }, { unique: true });
MarkSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('Mark', MarkSchema);
