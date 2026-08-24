const express = require('express');
const {
    login,
    getMe,
    updateDetails,
    studentLogin,
    getStudentMe,
    changeStudentPassword,
} = require('../controllers/auth');
const { protect, protectStudent } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, updateDetails);
router.post('/student/login', studentLogin);
router.get('/student/me', protectStudent, getStudentMe);
router.put('/student/change-password', protectStudent, changeStudentPassword);

module.exports = router;
