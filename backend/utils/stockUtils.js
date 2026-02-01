const Item = require('../models/Item');
const StockMovement = require('../models/StockMovement');
const Alert = require('../models/Alert');

// Update stock and create movement log
exports.updateStock = async (itemId, quantity, movementType, refType, refId, refNumber, userId) => {
  try {
    const item = await Item.findById(itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    const beforeStock = item.currentStock;
    let afterStock;

    if (movementType === 'IN') {
      afterStock = beforeStock + quantity;
    } else if (movementType === 'OUT') {
      if (beforeStock < quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Available: ${beforeStock}, Required: ${quantity}`);
      }
      afterStock = beforeStock - quantity;
    } else {
      throw new Error('Invalid movement type');
    }

    // Update item stock
    item.currentStock = afterStock;
    await item.save();

    // Create stock movement log
    const stockMovement = await StockMovement.create({
      item: itemId,
      refType,
      refId,
      refNumber,
      beforeStock,
      afterStock,
      quantity,
      movementType,
      createdBy: userId,
    });

    // Check for low stock and create alert if needed
    await this.checkLowStockAlert(item);

    return { item, stockMovement };
  } catch (error) {
    throw error;
  }
};

// Check and create/resolve low stock alerts
exports.checkLowStockAlert = async (item) => {
  try {
    const existingAlert = await Alert.findOne({
      item: item._id,
      isResolved: false,
    });

    // If stock is low and no alert exists, create one
    if (item.currentStock <= item.minStockLevel && !existingAlert) {
      const severity = item.currentStock === 0 ? 'critical' : 'low';
      const message = item.currentStock === 0 
        ? `${item.name} is out of stock!`
        : `${item.name} stock is low (${item.currentStock} ${item.unit} remaining)`;

      await Alert.create({
        item: item._id,
        message,
        severity,
      });
    }
    
    // If stock is sufficient and alert exists, resolve it
    if (item.currentStock > item.minStockLevel && existingAlert) {
      existingAlert.isResolved = true;
      existingAlert.resolvedAt = new Date();
      await existingAlert.save();
    }
  } catch (error) {
    console.error('Error checking low stock alert:', error);
  }
};
