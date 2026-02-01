const express = require('express');
const router = express.Router();
const {
  getSalesOrders,
  getSalesOrder,
  createSalesOrder,
  updateSalesOrder,
  updateSalesOrderStatus,
  deleteSalesOrder,
} = require('../controllers/salesOrderController');
const { protect, authorizeRead, authorizeWrite } = require('../middleware/auth');

// All roles can view
router.get('/', protect, authorizeRead('admin', 'staff', 'inventory_manager', 'sales_manager'), getSalesOrders);
router.get('/:id', protect, authorizeRead('admin', 'staff', 'inventory_manager', 'sales_manager'), getSalesOrder);
// Admin, Staff, Sales Manager can modify
router.post('/', protect, authorizeWrite('admin', 'staff', 'sales_manager'), createSalesOrder);
router.put('/:id', protect, authorizeWrite('admin', 'staff', 'sales_manager'), updateSalesOrder);
router.patch('/:id/status', protect, authorizeWrite('admin'), updateSalesOrderStatus);
router.delete('/:id', protect, authorizeWrite('admin'), deleteSalesOrder);

module.exports = router;
