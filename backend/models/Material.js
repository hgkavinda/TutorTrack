const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title for the material'],
            trim: true,
        },
        subject: {
            type: String,
            required: [true, 'Please add a subject'],
        },
        assignedClass: {
            type: mongoose.Schema.ObjectId,
            ref: 'Class',
            required: [true, 'Please assign the material to a class'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
        },
        fileUrl: {
            type: String, // Can be placeholder string for basic file handling
            required: [true, 'Please specify the file link or placeholder'],
        },
        uploadDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Material', MaterialSchema);
