const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getLowStockItems,
} = require('../controllers/itemController');
const { protect, authorizeRead, authorizeWrite } = require('../middleware/auth');

// All roles can view items
router.get('/low-stock', protect, authorizeRead('admin', 'staff', 'inventory_manager', 'sales_manager'), getLowStockItems);
router.get('/', protect, authorizeRead('admin', 'staff', 'inventory_manager', 'sales_manager'), getItems);
router.get('/:id', protect, authorizeRead('admin', 'staff', 'inventory_manager', 'sales_manager'), getItem);
// Only admin can modify
router.post('/', protect, authorizeWrite('admin'), createItem);
router.put('/:id', protect, authorizeWrite('admin'), updateItem);
router.delete('/:id', protect, authorizeWrite('admin'), deleteItem);

module.exports = router;
