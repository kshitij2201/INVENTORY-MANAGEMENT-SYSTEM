const express = require('express');
const router = express.Router();
const {
  getSalesInvoices,
  getSalesInvoice,
  createSalesInvoice,
  updateSalesInvoice,
  completeSalesInvoice,
  deleteSalesInvoice,
  addPayment,
  getPayments,
} = require('../controllers/salesInvoiceController');
const { protect, authorizeRead, authorizeWrite } = require('../middleware/auth');

// Only Admin and Sales Manager have access
router.get('/', protect, authorizeRead('admin', 'sales_manager'), getSalesInvoices);
router.get('/:id', protect, authorizeRead('admin', 'sales_manager'), getSalesInvoice);
router.post('/', protect, authorizeWrite('admin', 'sales_manager'), createSalesInvoice);
router.put('/:id', protect, authorizeWrite('admin', 'sales_manager'), updateSalesInvoice);
router.patch('/:id/complete', protect, authorizeWrite('admin', 'sales_manager'), completeSalesInvoice);
router.delete('/:id', protect, authorizeWrite('admin'), deleteSalesInvoice);

// Payment routes
router.post('/:id/payments', protect, authorizeWrite('admin', 'sales_manager'), addPayment);
router.get('/:id/payments', protect, authorizeRead('admin', 'sales_manager'), getPayments);

module.exports = router;
