const mongoose = require('mongoose');
const SalesReturn = require('../models/SalesReturn');
const SalesInvoice = require('../models/SalesInvoice');
const { updateStock } = require('../utils/stockUtils');

// @desc    Get all sales returns
// @route   GET /api/sales-returns
// @access  Private
exports.getSalesReturns = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.customerName = { $regex: search, $options: 'i' };
    }

    const salesReturns = await SalesReturn.find(query)
      .populate('salesInvoice', 'invoiceNumber customerName')
      .populate('items.item', 'name sku unit')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: salesReturns.length,
      data: salesReturns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching sales returns',
    });
  }
};

// @desc    Get single sales return
// @route   GET /api/sales-returns/:id
// @access  Private
exports.getSalesReturn = async (req, res) => {
  try {
    const salesReturn = await SalesReturn.findById(req.params.id)
      .populate('salesInvoice')
      .populate('items.item')
      .populate('createdBy', 'name');

    if (!salesReturn) {
      return res.status(404).json({
        success: false,
        message: 'Sales return not found',
      });
    }

    res.status(200).json({
      success: true,
      data: salesReturn,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching sales return',
    });
  }
};

// @desc    Create sales return
// @route   POST /api/sales-returns
// @access  Private (Admin, Sales Manager)
exports.createSalesReturn = async (req, res) => {
  try {
    // Verify invoice exists
    const invoice = await SalesInvoice.findById(req.body.salesInvoice);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Sales invoice not found',
      });
    }

    if (invoice.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only create returns for completed invoices',
      });
    }

    req.body.createdBy = req.user.id;
    req.body.customerName = invoice.customerName;

    const salesReturn = await SalesReturn.create(req.body);

    // If return is completed, update stock and invoice
    if (req.body.status === 'Completed') {
      for (const item of req.body.items) {
        await updateStock(
          item.item,
          item.quantity,
          'IN',
          'RETURN',
          salesReturn._id,
          salesReturn.returnNumber,
          req.user.id
        );
      }
      salesReturn.completedAt = new Date();
      await salesReturn.save();
      
      // Update invoice totalReturned
      await SalesInvoice.findByIdAndUpdate(
        invoice._id,
        { $inc: { totalReturned: salesReturn.totalAmount } }
      );
    }

    res.status(201).json({
      success: true,
      data: salesReturn,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating sales return',
    });
  }
};

// @desc    Complete sales return (update stock)
// @route   PATCH /api/sales-returns/:id/complete
// @access  Private (Admin, Sales Manager)
exports.completeSalesReturn = async (req, res) => {
  try {
    const salesReturn = await SalesReturn.findById(req.params.id);

    if (!salesReturn) {
      return res.status(404).json({
        success: false,
        message: 'Sales return not found',
      });
    }

    if (salesReturn.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Sales return is already completed',
      });
    }

    // Update stock for each item
    for (const item of salesReturn.items) {
      await updateStock(
        item.item,
        item.quantity,
        'IN',
        'RETURN',
        salesReturn._id,
        salesReturn.returnNumber,
        req.user.id
      );
    }

    salesReturn.status = 'Completed';
    salesReturn.completedAt = new Date();
    await salesReturn.save();
    
    // Update invoice totalReturned
    const invoice = await SalesInvoice.findById(salesReturn.salesInvoice);
    if (invoice) {
      await SalesInvoice.findByIdAndUpdate(
        invoice._id,
        { $inc: { totalReturned: salesReturn.totalAmount } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Sales return completed, stock updated, and invoice adjusted',
      data: salesReturn,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error completing sales return',
    });
  }
};

// @desc    Delete sales return
// @route   DELETE /api/sales-returns/:id
// @access  Private (Admin only)
exports.deleteSalesReturn = async (req, res) => {
  try {
    const salesReturn = await SalesReturn.findById(req.params.id);

    if (!salesReturn) {
      return res.status(404).json({
        success: false,
        message: 'Sales return not found',
      });
    }

    // Only allow deletion of draft returns
    if (salesReturn.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft returns can be deleted',
      });
    }

    await salesReturn.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sales return deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting sales return',
    });
  }
};
