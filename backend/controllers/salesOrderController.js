const mongoose = require('mongoose');
const SalesOrder = require('../models/SalesOrder');

// @desc    Get all sales orders
// @route   GET /api/sales-orders
// @access  Private
exports.getSalesOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.customerName = { $regex: search, $options: 'i' };
    }

    const salesOrders = await SalesOrder.find(query)
      .populate('items.item', 'name sku unit sellingPrice')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: salesOrders.length,
      data: salesOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching sales orders',
    });
  }
};

// @desc    Get single sales order
// @route   GET /api/sales-orders/:id
// @access  Private
exports.getSalesOrder = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findById(req.params.id)
      .populate('items.item')
      .populate('createdBy', 'name');

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: salesOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching sales order',
    });
  }
};

// @desc    Create sales order
// @route   POST /api/sales-orders
// @access  Private (Admin, Staff, Sales Manager)
exports.createSalesOrder = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;

    const salesOrder = await SalesOrder.create(req.body);

    res.status(201).json({
      success: true,
      data: salesOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating sales order',
    });
  }
};

// @desc    Update sales order
// @route   PUT /api/sales-orders/:id
// @access  Private (Admin, Staff, Sales Manager)
exports.updateSalesOrder = async (req, res) => {
  try {
    let salesOrder = await SalesOrder.findById(req.params.id);

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found',
      });
    }

    // Prevent updates to cancelled orders
    if (salesOrder.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update cancelled sales order',
      });
    }

    salesOrder = await SalesOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: salesOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating sales order',
    });
  }
};

// @desc    Update sales order status
// @route   PATCH /api/sales-orders/:id/status
// @access  Private (Admin, Sales Manager)
exports.updateSalesOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const salesOrder = await SalesOrder.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: salesOrder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating status',
    });
  }
};

// @desc    Delete sales order
// @route   DELETE /api/sales-orders/:id
// @access  Private (Admin only)
exports.deleteSalesOrder = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findById(req.params.id);

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found',
      });
    }

    // Only allow deletion of draft orders
    if (salesOrder.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft orders can be deleted',
      });
    }

    await salesOrder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sales order deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting sales order',
    });
  }
};
