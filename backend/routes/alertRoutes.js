const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getAlert,
  resolveAlert,
  deleteAlert,
} = require('../controllers/alertController');
const { protect, authorizeRead, authorizeWrite } = require('../middleware/auth');

// Admin, Staff, Inventory Manager can view (Sales Manager excluded)
router.get('/', protect, authorizeRead('admin', 'staff', 'inventory_manager'), getAlerts);
router.get('/:id', protect, authorizeRead('admin', 'staff', 'inventory_manager'), getAlert);
// Admin and Inventory Manager can modify
router.patch('/:id/resolve', protect, authorizeWrite('admin', 'inventory_manager'), resolveAlert);
router.delete('/:id', protect, authorizeWrite('admin'), deleteAlert);

module.exports = router;
