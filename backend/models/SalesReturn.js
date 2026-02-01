const mongoose = require('mongoose');

const salesReturnSchema = new mongoose.Schema({
  returnNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  salesInvoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesInvoice',
    required: [true, 'Sales Invoice is required'],
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    amount: {
      type: Number,
      required: true,
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  reason: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Completed'],
    default: 'Draft',
  },
  completedAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

// Auto-generate return number
salesReturnSchema.pre('save', async function(next) {
  if (!this.returnNumber || this.returnNumber === '') {
    // Find the highest existing return number
    const lastReturn = await this.constructor
      .findOne({ returnNumber: { $exists: true, $ne: null } })
      .sort({ returnNumber: -1 })
      .select('returnNumber');
    
    let nextNumber = 1;
    if (lastReturn && lastReturn.returnNumber) {
      const lastNumber = parseInt(lastReturn.returnNumber.replace('SR', ''));
      nextNumber = lastNumber + 1;
    }
    
    this.returnNumber = `SR${String(nextNumber).padStart(6, '0')}`;
  }
  
  // Calculate total amount
  this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SalesReturn', salesReturnSchema);
