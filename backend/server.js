const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const purchaseBillRoutes = require('./routes/purchaseBillRoutes');
const salesOrderRoutes = require('./routes/salesOrderRoutes');
const salesInvoiceRoutes = require('./routes/salesInvoiceRoutes');
const salesReturnRoutes = require('./routes/salesReturnRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');
const alertRoutes = require('./routes/alertRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
const corsOptions = {
  origin: [
    'https://inventory-management-system-ie71.vercel.app', // Production frontend
    'http://localhost:3000', // Local development
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/purchase-bills', purchaseBillRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/sales-invoices', salesInvoiceRoutes);
app.use('/api/sales-returns', salesReturnRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
