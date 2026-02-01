const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentActivities,
  getChartData,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getDashboardStats);
router.get('/recent-activities', protect, getRecentActivities);
router.get('/chart-data', protect, getChartData);

module.exports = router;
