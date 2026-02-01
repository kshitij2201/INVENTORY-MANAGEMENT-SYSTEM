const StockMovement = require('../models/StockMovement');

// @desc    Get all stock movements
// @route   GET /api/stock-movements
// @access  Private
exports.getStockMovements = async (req, res) => {
  try {
    const { item, refType, movementType } = req.query;
    
    let query = {};
    
    if (item) {
      query.item = item;
    }
    
    if (refType) {
      query.refType = refType;
    }
    
    if (movementType) {
      query.movementType = movementType;
    }

    const stockMovements = await StockMovement.find(query)
      .populate('item', 'name sku unit')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to recent 100 movements

    res.status(200).json({
      success: true,
      count: stockMovements.length,
      data: stockMovements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching stock movements',
    });
  }
};

// @desc    Get stock movement by item
// @route   GET /api/stock-movements/item/:itemId
// @access  Private
exports.getStockMovementsByItem = async (req, res) => {
  try {
    const stockMovements = await StockMovement.find({ item: req.params.itemId })
      .populate('item', 'name sku unit')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stockMovements.length,
      data: stockMovements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching stock movements',
    });
  }
};
