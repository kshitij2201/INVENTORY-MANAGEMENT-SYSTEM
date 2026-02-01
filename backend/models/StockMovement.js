const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  refType: {
    type: String,
    enum: ['PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT'],
    required: true,
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  refNumber: {
    type: String,
  },
  beforeStock: {
    type: Number,
    required: true,
  },
  afterStock: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  movementType: {
    type: String,
    enum: ['IN', 'OUT'],
    required: true,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StockMovement', stockMovementSchema);
