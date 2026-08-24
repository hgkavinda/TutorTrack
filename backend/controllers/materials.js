const asyncHandler = require('../middleware/asyncHandler');
const Material = require('../models/Material');

exports.getMaterials = asyncHandler(async (req, res, next) => {
    let query = Material.find();
    if (req.query.assignedClass) {
        query = Material.find({ assignedClass: req.query.assignedClass });
    }

    const materials = await query.populate({ path: 'assignedClass', select: 'className subject' });

    res.status(200).json({ success: true, count: materials.length, data: materials });
});

exports.createMaterial = asyncHandler(async (req, res, next) => {
    const material = await Material.create(req.body);
    res.status(201).json({ success: true, data: material });
});

exports.updateMaterial = asyncHandler(async (req, res, next) => {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!material) return res.status(404).json({ success: false, error: 'Not found' });
    res.status(200).json({ success: true, data: material });
});

exports.deleteMaterial = asyncHandler(async (req, res, next) => {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, error: 'Not found' });
    await material.deleteOne();
    res.status(200).json({ success: true, data: {} });
});
