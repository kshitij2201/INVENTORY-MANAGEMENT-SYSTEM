const mongoose = require('mongoose');

const purchaseBillSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
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
  grandTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid',
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  payments: [{
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card', 'UPI', 'Other'],
      default: 'Cash',
    },
    reference: {
      type: String,
    },
    notes: {
      type: String,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['Draft', 'Completed'],
    default: 'Draft',
  },
  completedAt: {
    type: Date,
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

// Auto-generate bill number
purchaseBillSchema.pre('save', async function(next) {
  if (!this.billNumber || this.billNumber === '') {
    const count = await this.constructor.countDocuments();
    this.billNumber = `PB${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate grand total
  this.grandTotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate paid amount and payment status
  this.paidAmount = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  if (this.paidAmount === 0) {
    this.paymentStatus = 'Unpaid';
  } else if (this.paidAmount >= this.grandTotal) {
    this.paymentStatus = 'Paid';
  } else {
    this.paymentStatus = 'Partially Paid';
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PurchaseBill', purchaseBillSchema);
