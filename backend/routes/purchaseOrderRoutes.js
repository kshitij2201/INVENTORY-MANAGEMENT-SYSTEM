const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
} = require('../controllers/purchaseOrderController');
const { protect, authorizeRead, authorizeWrite } = require('../middleware/auth');

// Admin, Staff, Inventory Manager can view (Sales Manager excluded)
router.get('/', protect, authorizeRead('admin', 'staff', 'inventory_manager'), getPurchaseOrders);
router.get('/:id', protect, authorizeRead('admin', 'staff', 'inventory_manager'), getPurchaseOrder);
// Admin and Staff can create/modify
router.post('/', protect, authorizeWrite('admin', 'staff'), createPurchaseOrder);
router.put('/:id', protect, authorizeWrite('admin', 'staff'), updatePurchaseOrder);
router.patch('/:id/status', protect, authorizeWrite('admin'), updatePurchaseOrderStatus);
router.delete('/:id', protect, authorizeWrite('admin'), deletePurchaseOrder);

module.exports = router;
