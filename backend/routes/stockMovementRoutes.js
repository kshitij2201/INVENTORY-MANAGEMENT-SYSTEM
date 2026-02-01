const express = require('express');
const router = express.Router();
const {
  getStockMovements,
  getStockMovementsByItem,
} = require('../controllers/stockMovementController');
const { protect, authorizeRead } = require('../middleware/auth');

// All roles can view stock movements
router.get('/', protect, authorizeRead('admin', 'staff', 'inventory_manager', 'sales_manager'), getStockMovements);
router.get('/item/:itemId', protect, authorizeRead('admin', 'staff', 'inventory_manager', 'sales_manager'), getStockMovementsByItem);

module.exports = router;
