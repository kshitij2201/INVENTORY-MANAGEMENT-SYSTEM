const express = require('express');
const router = express.Router();
const {
  getVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
} = require('../controllers/vendorController');
const { protect, authorizeRead, authorizeWrite } = require('../middleware/auth');

// Admin, Staff, Inventory Manager can view (Sales Manager excluded)
router.get('/', protect, authorizeRead('admin', 'staff', 'inventory_manager'), getVendors);
router.get('/:id', protect, authorizeRead('admin', 'staff', 'inventory_manager'), getVendor);
// Only admin can modify
router.post('/', protect, authorizeWrite('admin'), createVendor);
router.put('/:id', protect, authorizeWrite('admin'), updateVendor);
router.delete('/:id', protect, authorizeWrite('admin'), deleteVendor);

module.exports = router;
