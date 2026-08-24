const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Please add a full name'],
            trim: true,
        },
        studentId: {
            type: String,
            required: [true, 'Please add a student ID'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            default: 'Other',
        },
        dateOfBirth: {
            type: Date,
        },
        parentName: {
            type: String,
            default: '',
        },
        parentPhone: {
            type: String,
            default: '',
        },
        email: {
            type: String,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        address: {
            type: String,
            default: '',
        },
        joinedDate: {
            type: Date,
            default: Date.now,
        },
        grade: {
            type: String,
            enum: ['6', '7', '8', '9', '10', '11'],
            required: [true, 'Please assign a grade'],
        },
        academicYear: {
            type: Number,
            required: [true, 'Please add an academic year'],
            default: () => new Date().getFullYear(),
            min: [2000, 'Please add a valid academic year'],
            max: [2100, 'Please add a valid academic year'],
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        password: {
            type: String,
            required: [true, 'Please add a temporary password'],
            minlength: 8,
            select: false,
        },
        mustChangePassword: {
            type: Boolean,
            default: true,
        },
        accountStatus: {
            type: String,
            enum: ['active', 'disabled'],
            default: 'active',
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                delete ret.password;
                return ret;
            },
        },
    }
);

StudentSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

StudentSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);
