const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined until pre-save hook runs
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required'],
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
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Approved', 'Cancelled'],
    default: 'Draft',
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
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate order number
purchaseOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber || this.orderNumber === '') {
    // Find the highest existing order number
    const lastOrder = await this.constructor
      .findOne({ orderNumber: { $exists: true, $ne: null } })
      .sort({ orderNumber: -1 })
      .select('orderNumber');
    
    let nextNumber = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastNumber = parseInt(lastOrder.orderNumber.replace('PO', ''));
      nextNumber = lastNumber + 1;
    }
    
    this.orderNumber = `PO${String(nextNumber).padStart(6, '0')}`;
  }
  
  // Calculate total amount
  this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
