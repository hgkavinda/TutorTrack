const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All dashboard routes are protected

router.route('/').get(getDashboardStats);

module.exports = router;
