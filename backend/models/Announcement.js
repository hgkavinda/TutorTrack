const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please add a title for the announcement'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Please add the announcement message'],
        },
        targetClass: {
            type: mongoose.Schema.ObjectId, // null implies "All classes"
            ref: 'Class',
            default: null,
        },
        priorityLevel: {
            type: String,
            enum: ['Low', 'Normal', 'High'],
            default: 'Normal',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Announcement', AnnouncementSchema);
