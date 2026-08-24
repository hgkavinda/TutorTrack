const express = require('express');
const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    addEnrollment,
    endEnrollment,
    resetStudentPassword,
    getStudentReport,
} = require('../controllers/students');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getStudents)
    .post(createStudent);

router.get('/:id/report', getStudentReport);

router
    .route('/:id')
    .get(getStudent)
    .put(updateStudent)
    .delete(deleteStudent);

router.post('/:id/enrollments', addEnrollment);
router.put('/:id/enrollments/:enrollmentId/end', endEnrollment);
router.post('/:id/reset-password', resetStudentPassword);

module.exports = router;
