const asyncHandler = require('../middleware/asyncHandler');
const Announcement = require('../models/Announcement');

exports.getAnnouncements = asyncHandler(async (req, res, next) => {
    const announcements = await Announcement.find()
        .populate({ path: 'targetClass', select: 'className' })
        .sort('-createdAt');

    res.status(200).json({ success: true, count: announcements.length, data: announcements });
});

exports.createAnnouncement = asyncHandler(async (req, res, next) => {
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ success: true, data: announcement });
});

exports.updateAnnouncement = asyncHandler(async (req, res, next) => {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!announcement) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json({ success: true, data: announcement });
});

exports.deleteAnnouncement = asyncHandler(async (req, res, next) => {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, error: 'Not found' });
    await announcement.deleteOne();
    res.status(200).json({ success: true, data: {} });
});
