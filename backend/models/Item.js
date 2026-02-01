const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  unit: {
    type: String,
    enum: ['pcs', 'kg', 'box', 'ltr', 'mtr'],
    default: 'pcs',
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0,
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0,
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate SKU if not provided
itemSchema.pre('save', async function(next) {
  if (!this.sku || this.sku === '') {
    const count = await this.constructor.countDocuments();
    this.sku = `ITEM${String(count + 1).padStart(6, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Item', itemSchema);
