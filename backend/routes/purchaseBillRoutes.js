const express = require('express');
const router = express.Router();
const {
  getPurchaseBills,
  getPurchaseBill,
  createPurchaseBill,
  updatePurchaseBill,
  completePurchaseBill,
  deletePurchaseBill,
  addPayment,
  getPayments,
} = require('../controllers/purchaseBillController');
const { protect, authorizeRead, authorizeWrite } = require('../middleware/auth');

// Only Admin and Inventory Manager have access
router.get('/', protect, authorizeRead('admin', 'inventory_manager'), getPurchaseBills);
router.get('/:id', protect, authorizeRead('admin', 'inventory_manager'), getPurchaseBill);
router.post('/', protect, authorizeWrite('admin', 'inventory_manager'), createPurchaseBill);
router.put('/:id', protect, authorizeWrite('admin', 'inventory_manager'), updatePurchaseBill);
router.patch('/:id/complete', protect, authorizeWrite('admin', 'inventory_manager'), completePurchaseBill);
router.delete('/:id', protect, authorizeWrite('admin'), deletePurchaseBill);

// Payment routes
router.post('/:id/payments', protect, authorizeWrite('admin', 'inventory_manager'), addPayment);
router.get('/:id/payments', protect, authorizeRead('admin', 'inventory_manager'), getPayments);

module.exports = router;
