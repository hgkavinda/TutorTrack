const express = require('express');
const { getMaterials, createMaterial, updateMaterial, deleteMaterial } = require('../controllers/materials');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.route('/').get(getMaterials).post(createMaterial);
router.route('/:id').put(updateMaterial).delete(deleteMaterial);

module.exports = router;
