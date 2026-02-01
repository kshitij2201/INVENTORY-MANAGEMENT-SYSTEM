const mongoose = require('mongoose');
const PurchaseBill = require('../models/PurchaseBill');
const { updateStock } = require('../utils/stockUtils');

// @desc    Get all purchase bills
// @route   GET /api/purchase-bills
// @access  Private
exports.getPurchaseBills = async (req, res) => {
  try {
    const { status, vendor } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (vendor) {
      query.vendor = vendor;
    }

    const purchaseBills = await PurchaseBill.find(query)
      .populate('vendor', 'name email')
      .populate('purchaseOrder', 'orderNumber')
      .populate('items.item', 'name sku unit')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: purchaseBills.length,
      data: purchaseBills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching purchase bills',
    });
  }
};

// @desc    Get single purchase bill
// @route   GET /api/purchase-bills/:id
// @access  Private
exports.getPurchaseBill = async (req, res) => {
  try {
    const purchaseBill = await PurchaseBill.findById(req.params.id)
      .populate('vendor')
      .populate('purchaseOrder')
      .populate('items.item')
      .populate('createdBy', 'name');

    if (!purchaseBill) {
      return res.status(404).json({
        success: false,
        message: 'Purchase bill not found',
      });
    }

    res.status(200).json({
      success: true,
      data: purchaseBill,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching purchase bill',
    });
  }
};

// @desc    Create purchase bill
// @route   POST /api/purchase-bills
// @access  Private (Admin, Inventory Manager)
exports.createPurchaseBill = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const purchaseBill = await PurchaseBill.create(req.body);

    // If bill is completed, update stock
    if (req.body.status === 'Completed') {
      for (const item of req.body.items) {
        await updateStock(
          item.item,
          item.quantity,
          'IN',
          'PURCHASE',
          purchaseBill._id,
          purchaseBill.billNumber,
          req.user.id
        );
      }
      purchaseBill.completedAt = new Date();
      await purchaseBill.save();
    }

    res.status(201).json({
      success: true,
      data: purchaseBill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating purchase bill',
    });
  }
};

// @desc    Update purchase bill (Draft only)
// @route   PUT /api/purchase-bills/:id
// @access  Private (Admin, Inventory Manager)
exports.updatePurchaseBill = async (req, res) => {
  try {
    let purchaseBill = await PurchaseBill.findById(req.params.id);

    if (!purchaseBill) {
      return res.status(404).json({
        success: false,
        message: 'Purchase bill not found',
      });
    }

    // Prevent updates to completed bills
    if (purchaseBill.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update completed purchase bill',
      });
    }

    purchaseBill = await PurchaseBill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: purchaseBill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating purchase bill',
    });
  }
};

// @desc    Complete purchase bill (update stock)
// @route   PATCH /api/purchase-bills/:id/complete
// @access  Private (Admin, Inventory Manager)
exports.completePurchaseBill = async (req, res) => {
  try {
    const purchaseBill = await PurchaseBill.findById(req.params.id);

    if (!purchaseBill) {
      return res.status(404).json({
        success: false,
        message: 'Purchase bill not found',
      });
    }

    if (purchaseBill.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Purchase bill is already completed',
      });
    }

    // Update stock for each item
    for (const item of purchaseBill.items) {
      await updateStock(
        item.item,
        item.quantity,
        'IN',
        'PURCHASE',
        purchaseBill._id,
        purchaseBill.billNumber,
        req.user.id
      );
    }

    purchaseBill.status = 'Completed';
    purchaseBill.completedAt = new Date();
    await purchaseBill.save();

    res.status(200).json({
      success: true,
      message: 'Purchase bill completed and stock updated',
      data: purchaseBill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error completing purchase bill',
    });
  }
};

// @desc    Delete purchase bill
// @route   DELETE /api/purchase-bills/:id
// @access  Private (Admin only)
exports.deletePurchaseBill = async (req, res) => {
  try {
    const purchaseBill = await PurchaseBill.findById(req.params.id);

    if (!purchaseBill) {
      return res.status(404).json({
        success: false,
        message: 'Purchase bill not found',
      });
    }

    // Only allow deletion of draft bills
    if (purchaseBill.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft bills can be deleted',
      });
    }

    await purchaseBill.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Purchase bill deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting purchase bill',
    });
  }
};

// @desc    Add payment to purchase bill
// @route   POST /api/purchase-bills/:id/payments
// @access  Private (Admin, Inventory Manager)
exports.addPayment = async (req, res) => {
  try {
    const purchaseBill = await PurchaseBill.findById(req.params.id);

    if (!purchaseBill) {
      return res.status(404).json({
        success: false,
        message: 'Purchase bill not found',
      });
    }

    if (purchaseBill.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only add payments to completed bills',
      });
    }

    const { amount, paymentDate, paymentMethod, reference, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than 0',
      });
    }

    const currentPaid = purchaseBill.paidAmount || 0;
    const remaining = purchaseBill.grandTotal - currentPaid;

    if (amount > remaining) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${amount}) exceeds remaining balance (${remaining.toFixed(2)})`,
      });
    }

    purchaseBill.payments.push({
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod: paymentMethod || 'Cash',
      reference,
      notes,
      recordedBy: req.user.id,
    });

    await purchaseBill.save();

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: purchaseBill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error recording payment',
    });
  }
};

// @desc    Get payment history
// @route   GET /api/purchase-bills/:id/payments
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    const purchaseBill = await PurchaseBill.findById(req.params.id)
      .populate('payments.recordedBy', 'name');

    if (!purchaseBill) {
      return res.status(404).json({
        success: false,
        message: 'Purchase bill not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        grandTotal: purchaseBill.grandTotal,
        paidAmount: purchaseBill.paidAmount,
        remainingAmount: purchaseBill.grandTotal - purchaseBill.paidAmount,
        paymentStatus: purchaseBill.paymentStatus,
        payments: purchaseBill.payments,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching payments',
    });
  }
};

