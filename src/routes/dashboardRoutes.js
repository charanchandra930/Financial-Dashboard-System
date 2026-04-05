const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

// Viewers, Analysts, and Admins can access dashboard summary
router.route('/summary').get(authorize('viewer', 'analyst', 'admin'), getDashboardSummary);

module.exports = router;
