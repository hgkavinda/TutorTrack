const express = require('express');
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcements');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.route('/').get(getAnnouncements).post(createAnnouncement);
router.route('/:id').put(updateAnnouncement).delete(deleteAnnouncement);

module.exports = router;
