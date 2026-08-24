const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema(
    {
        examId: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
        },
        name: {
            type: String,
            required: [true, 'Please add an exam name'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['Weekly Test', 'Monthly Exam', 'Term Exam', 'Model Paper', 'Revision Test', 'Assignment'],
            required: true,
        },
        weight: {
            type: Number,
            required: true,
            immutable: true,
        },
        grade: {
            type: String,
            enum: ['6', '7', '8', '9', '10', '11'],
            required: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        examDate: {
            type: Date,
            required: true,
        },
        totalMarks: {
            type: Number,
            required: true,
            min: 1,
        },
        academicYear: {
            type: Number,
            required: true,
            min: 2000,
            max: 2100,
        },
        status: {
            type: String,
            enum: ['Draft', 'Published'],
            default: 'Draft',
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'Teacher',
            required: true,
        },
        publishedAt: Date,
    },
    { timestamps: true }
);

ExamSchema.index({ grade: 1, subject: 1, academicYear: 1, examDate: -1 });

module.exports = mongoose.model('Exam', ExamSchema);
