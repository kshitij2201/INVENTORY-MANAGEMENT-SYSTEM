const mongoose = require('mongoose');
const PurchaseOrder = require('../models/PurchaseOrder');

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
exports.getPurchaseOrders = async (req, res) => {
  try {
    const { status, vendor } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (vendor) {
      query.vendor = vendor;
    }

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('vendor', 'name email')
      .populate('items.item', 'name sku unit')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: purchaseOrders.length,
      data: purchaseOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching purchase orders',
    });
  }
};

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
// @access  Private
exports.getPurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('vendor')
      .populate('items.item')
      .populate('createdBy', 'name');

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: purchaseOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching purchase order',
    });
  }
};

// @desc    Create purchase order
// @route   POST /api/purchase-orders
// @access  Private (Admin, Staff)
exports.createPurchaseOrder = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const purchaseOrder = await PurchaseOrder.create(req.body);

    res.status(201).json({
      success: true,
      data: purchaseOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating purchase order',
    });
  }
};

// @desc    Update purchase order
// @route   PUT /api/purchase-orders/:id
// @access  Private (Admin, Staff)
exports.updatePurchaseOrder = async (req, res) => {
  try {
    let purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    // Prevent updates to approved or cancelled orders
    if (purchaseOrder.status === 'Approved' || purchaseOrder.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot update ${purchaseOrder.status.toLowerCase()} purchase order`,
      });
    }

    purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: purchaseOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating purchase order',
    });
  }
};

// @desc    Update purchase order status
// @route   PATCH /api/purchase-orders/:id/status
// @access  Private (Admin)
exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: purchaseOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating status',
    });
  }
};

// @desc    Delete purchase order
// @route   DELETE /api/purchase-orders/:id
// @access  Private (Admin only)
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found',
      });
    }

    // Only allow deletion of draft orders
    if (purchaseOrder.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft orders can be deleted',
      });
    }

    await purchaseOrder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Purchase order deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting purchase order',
    });
  }
};
