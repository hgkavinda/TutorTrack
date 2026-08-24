const express = require('express');
const {
    getFees,
    generateMonthlyInvoices,
    getCollectionSheet,
    updateConcessions,
    collectBulk,
    getStudentArrears,
    getFeesByStudent,
} = require('../controllers/fees');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getFees);
router.post('/generate', generateMonthlyInvoices);
router.get('/collection-sheet', getCollectionSheet);
router.put('/concessions', updateConcessions);
router.post('/collect', collectBulk);
router.get('/student/:studentId/arrears', getStudentArrears);
router.get('/student/:studentId', getFeesByStudent);

module.exports = router;
