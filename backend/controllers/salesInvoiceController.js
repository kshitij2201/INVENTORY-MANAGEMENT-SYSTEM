const mongoose = require('mongoose');
const SalesInvoice = require('../models/SalesInvoice');
const { updateStock } = require('../utils/stockUtils');

// @desc    Get all sales invoices
// @route   GET /api/sales-invoices
// @access  Private
exports.getSalesInvoices = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.customerName = { $regex: search, $options: 'i' };
    }

    const salesInvoices = await SalesInvoice.find(query)
      .populate('salesOrder', 'orderNumber')
      .populate('items.item', 'name sku unit')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: salesInvoices.length,
      data: salesInvoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching sales invoices',
    });
  }
};

// @desc    Get single sales invoice
// @route   GET /api/sales-invoices/:id
// @access  Private
exports.getSalesInvoice = async (req, res) => {
  try {
    const salesInvoice = await SalesInvoice.findById(req.params.id)
      .populate('salesOrder')
      .populate('items.item')
      .populate('createdBy', 'name');

    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: salesInvoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching sales invoice',
    });
  }
};

// @desc    Create sales invoice
// @route   POST /api/sales-invoices
// @access  Private (Admin, Sales Manager)
exports.createSalesInvoice = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const salesInvoice = await SalesInvoice.create(req.body);

    // If invoice is completed, update stock
    if (req.body.status === 'Completed') {
      for (const item of req.body.items) {
        await updateStock(
          item.item,
          item.quantity,
          'OUT',
          'SALE',
          salesInvoice._id,
          salesInvoice.invoiceNumber,
          req.user.id
        );
      }
      salesInvoice.completedAt = new Date();
      await salesInvoice.save();
    }

    res.status(201).json({
      success: true,
      data: salesInvoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating sales invoice',
    });
  }
};

// @desc    Update sales invoice (Draft only)
// @route   PUT /api/sales-invoices/:id
// @access  Private (Admin, Sales Manager)
exports.updateSalesInvoice = async (req, res) => {
  try {
    let salesInvoice = await SalesInvoice.findById(req.params.id);

    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found',
      });
    }

    // Prevent updates to completed invoices
    if (salesInvoice.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed sales invoice',
      });
    }

    salesInvoice = await SalesInvoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: salesInvoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating sales invoice',
    });
  }
};

// @desc    Complete sales invoice (update stock)
// @route   PATCH /api/sales-invoices/:id/complete
// @access  Private (Admin, Sales Manager)
exports.completeSalesInvoice = async (req, res) => {
  try {
    const salesInvoice = await SalesInvoice.findById(req.params.id);

    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found',
      });
    }

    if (salesInvoice.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Sales invoice is already completed',
      });
    }

    // Update stock for each item
    for (const item of salesInvoice.items) {
      await updateStock(
        item.item,
        item.quantity,
        'OUT',
        'SALE',
        salesInvoice._id,
        salesInvoice.invoiceNumber,
        req.user.id
      );
    }

    salesInvoice.status = 'Completed';
    salesInvoice.completedAt = new Date();
    await salesInvoice.save();

    res.status(200).json({
      success: true,
      message: 'Sales invoice completed and stock updated',
      data: salesInvoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error completing sales invoice',
    });
  }
};

// @desc    Delete sales invoice
// @route   DELETE /api/sales-invoices/:id
// @access  Private (Admin only)
exports.deleteSalesInvoice = async (req, res) => {
  try {
    const salesInvoice = await SalesInvoice.findById(req.params.id);

    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found',
      });
    }

    // Only allow deletion of draft invoices
    if (salesInvoice.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft invoices can be deleted',
      });
    }

    await salesInvoice.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sales invoice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting sales invoice',
    });
  }
};

// @desc    Add payment to sales invoice
// @route   POST /api/sales-invoices/:id/payments
// @access  Private (Admin, Sales Manager)
exports.addPayment = async (req, res) => {
  try {
    const salesInvoice = await SalesInvoice.findById(req.params.id);

    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found',
      });
    }

    if (salesInvoice.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only add payments to completed invoices',
      });
    }

    const { amount, paymentDate, paymentMethod, reference, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than 0',
      });
    }

    const currentPaid = salesInvoice.paidAmount || 0;
    const adjustedTotal = salesInvoice.grandTotal - (salesInvoice.totalReturned || 0);
    const remaining = adjustedTotal - currentPaid;

    if (amount > remaining) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${amount}) exceeds remaining balance (${remaining.toFixed(2)})`,
      });
    }

    salesInvoice.payments.push({
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod: paymentMethod || 'Cash',
      reference,
      notes,
      recordedBy: req.user.id,
    });

    await salesInvoice.save();

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: salesInvoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error recording payment',
    });
  }
};

// @desc    Get payment history
// @route   GET /api/sales-invoices/:id/payments
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    const salesInvoice = await SalesInvoice.findById(req.params.id)
      .populate('payments.recordedBy', 'name');

    if (!salesInvoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        grandTotal: salesInvoice.grandTotal,
        totalReturned: salesInvoice.totalReturned || 0,
        adjustedTotal: salesInvoice.grandTotal - (salesInvoice.totalReturned || 0),
        paidAmount: salesInvoice.paidAmount,
        remainingAmount: (salesInvoice.grandTotal - (salesInvoice.totalReturned || 0)) - salesInvoice.paidAmount,
        paymentStatus: salesInvoice.paymentStatus,
        payments: salesInvoice.payments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payments',
    });
  }
};

