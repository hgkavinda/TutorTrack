const express = require('express');
const {
    getDashboard,
    getResults,
    getAttendance,
    getFees,
    getNotifications,
    getProfile,
} = require('../controllers/studentPortal');
const { protectStudent } = require('../middleware/auth');

const router = express.Router();
router.use(protectStudent);

router.get('/dashboard', getDashboard);
router.get('/results', getResults);
router.get('/attendance', getAttendance);
router.get('/fees', getFees);
router.get('/notifications', getNotifications);
router.get('/profile', getProfile);

module.exports = router;
