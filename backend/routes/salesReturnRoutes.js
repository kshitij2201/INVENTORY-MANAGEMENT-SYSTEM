const express = require('express');
const router = express.Router();
const {
  getSalesReturns,
  getSalesReturn,
  createSalesReturn,
  completeSalesReturn,
  deleteSalesReturn,
} = require('../controllers/salesReturnController');
const { protect, authorizeRead, authorizeWrite } = require('../middleware/auth');

// Admin and Sales Manager have access
router.get('/', protect, authorizeRead('admin', 'sales_manager'), getSalesReturns);
router.get('/:id', protect, authorizeRead('admin', 'sales_manager'), getSalesReturn);
router.post('/', protect, authorizeWrite('admin', 'sales_manager'), createSalesReturn);
router.patch('/:id/complete', protect, authorizeWrite('admin', 'sales_manager'), completeSalesReturn);
router.delete('/:id', protect, authorizeWrite('admin'), deleteSalesReturn);

module.exports = router;
