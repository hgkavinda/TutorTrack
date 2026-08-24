const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema(
    {
        invoiceId: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
        },
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
        billingMonth: {
            type: String,
            required: true,
            match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Billing month must use YYYY-MM format'],
        },
        standardAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        concessionType: {
            type: String,
            enum: ['Full', 'Half', 'Free', 'Custom'],
            default: 'Full',
        },
        discountAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        paidAmount: {
            type: Number,
            default: 0,
        },
        balance: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['Paid', 'Unpaid', 'Waived'],
            default: 'Unpaid',
        },
        dueDate: Date,
        concessionReason: {
            type: String,
            default: '',
            trim: true,
        },
        paymentTransaction: {
            type: mongoose.Schema.ObjectId,
            ref: 'PaymentTransaction',
        },
        receiptNumber: String,
        paymentDate: Date,
        paymentMethod: {
            type: String,
            enum: ['Cash', 'Bank Transfer', 'Card', 'Other'],
        },
        paymentNote: {
            type: String,
            default: '',
        },
        generatedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'Teacher',
            required: true,
        },
    },
    { timestamps: true }
);

FeeSchema.index({ student: 1, assignedClass: 1, billingMonth: 1 }, { unique: true });
FeeSchema.index({ billingMonth: 1, status: 1, assignedClass: 1 });

module.exports = mongoose.model('Fee', FeeSchema);
