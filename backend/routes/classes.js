const express = require('express');
const {
    getClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass,
} = require('../controllers/classes');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(getClasses)
    .post(createClass);

router
    .route('/:id')
    .get(getClass)
    .put(updateClass)
    .delete(deleteClass);

module.exports = router;
