const mongoose = require('mongoose');

const PaymentTransactionSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
        },
        receiptNumber: {
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
        invoices: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Fee',
            required: true,
        }],
        totalAmount: {
            type: Number,
            required: true,
            min: 0.01,
        },
        paymentDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        method: {
            type: String,
            enum: ['Cash', 'Bank Transfer', 'Card', 'Other'],
            required: true,
        },
        note: {
            type: String,
            default: '',
            trim: true,
        },
        recordedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'Teacher',
            required: true,
        },
    },
    { timestamps: true }
);

PaymentTransactionSchema.index({ student: 1, paymentDate: -1 });

module.exports = mongoose.model('PaymentTransaction', PaymentTransactionSchema);
