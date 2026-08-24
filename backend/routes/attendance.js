const express = require('express');
const {
    getAttendances,
    getAttendanceByClass,
    getAttendanceByStudent,
    markAttendance,
    updateAttendance,
    openSession,
    getSessionRoster,
    completeSession,
    getStudentAttendanceSummary,
    getClassAttendanceHistory,
} = require('../controllers/attendance');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getAttendances)
    .post(markAttendance);

router.post('/sessions', openSession);
router.get('/classes/:classId/history', getClassAttendanceHistory);
router.get('/sessions/:sessionId', getSessionRoster);
router.put('/sessions/:sessionId/complete', completeSession);
router.get('/student/:studentId/summary', getStudentAttendanceSummary);
router.get('/student/:studentId', getAttendanceByStudent);
router.get('/class/:classId', getAttendanceByClass);
router.route('/:id').put(updateAttendance);

module.exports = router;
