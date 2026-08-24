const express = require('express');
const {
    getExams,
    createExam,
    getExamRoster,
    saveDraftResults,
    publishExam,
    getStudentRatings,
} = require('../controllers/marks');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.route('/exams').get(getExams).post(createExam);
router.get('/exams/:examId', getExamRoster);
router.put('/exams/:examId/results', saveDraftResults);
router.post('/exams/:examId/publish', publishExam);
router.get('/student/:studentId/ratings', getStudentRatings);

module.exports = router;
