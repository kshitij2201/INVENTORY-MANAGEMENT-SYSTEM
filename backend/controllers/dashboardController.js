const Item = require('../models/Item');
const PurchaseBill = require('../models/PurchaseBill');
const SalesInvoice = require('../models/SalesInvoice');
const Alert = require('../models/Alert');
const StockMovement = require('../models/StockMovement');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Total items
    const totalItems = await Item.countDocuments({ isActive: true });
    
    // Low stock items
    const lowStockItems = await Item.countDocuments({
      isActive: true,
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    });
    
    // Out of stock items
    const outOfStockItems = await Item.countDocuments({
      isActive: true,
      currentStock: 0
    });
    
    // Active alerts
    const activeAlerts = await Alert.countDocuments({ isResolved: false });
    
    // Critical alerts
    const criticalAlerts = await Alert.countDocuments({
      isResolved: false,
      severity: 'critical'
    });
    
    // Total stock value
    const items = await Item.find({ isActive: true });
    const totalStockValue = items.reduce((sum, item) => {
      return sum + (item.currentStock * item.purchasePrice);
    }, 0);
    
    // Recent purchase bills (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPurchases = await PurchaseBill.countDocuments({
      status: 'Completed',
      completedAt: { $gte: thirtyDaysAgo }
    });
    
    const purchaseStats = await PurchaseBill.aggregate([
      {
        $match: {
          status: 'Completed',
          completedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$grandTotal' },
          paid: { $sum: '$paidAmount' }
        }
      }
    ]);
    
    const totalPurchaseAmount = purchaseStats[0]?.total || 0;
    const paidPurchaseAmount = purchaseStats[0]?.paid || 0;
    const pendingPurchaseAmount = totalPurchaseAmount - paidPurchaseAmount;
    
    // Recent sales invoices (last 30 days)
    const recentSales = await SalesInvoice.countDocuments({
      status: 'Completed',
      completedAt: { $gte: thirtyDaysAgo }
    });
    
    const salesStats = await SalesInvoice.aggregate([
      {
        $match: {
          status: 'Completed',
          completedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$grandTotal' },
          paid: { $sum: '$paidAmount' },
          returned: { $sum: '$returnedAmount' }
        }
      }
    ]);
    
    const totalSalesAmount = salesStats[0]?.total || 0;
    const paidSalesAmount = salesStats[0]?.paid || 0;
    const returnedSalesAmount = salesStats[0]?.returned || 0;
    const adjustedSalesAmount = totalSalesAmount - returnedSalesAmount;
    const pendingSalesAmount = adjustedSalesAmount - paidSalesAmount;

    res.status(200).json({
      success: true,
      data: {
        inventory: {
          totalItems,
          lowStockItems,
          outOfStockItems,
          totalStockValue: totalStockValue.toFixed(2),
        },
        alerts: {
          activeAlerts,
          criticalAlerts,
        },
        purchases: {
          count: recentPurchases,
          totalAmount: totalPurchaseAmount,
          paidAmount: paidPurchaseAmount,
          pendingAmount: pendingPurchaseAmount,
          // Legacy field for backward compatibility
          amount: totalPurchaseAmount,
        },
        sales: {
          count: recentSales,
          totalAmount: totalSalesAmount,
          returnedAmount: returnedSalesAmount,
          adjustedAmount: adjustedSalesAmount,
          paidAmount: paidSalesAmount,
          pendingAmount: pendingSalesAmount,
          // Legacy field for backward compatibility
          amount: totalSalesAmount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dashboard stats',
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentMovements = await StockMovement.find()
      .populate('item', 'name sku')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: recentMovements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching recent activities',
    });
  }
};

// @desc    Get chart data for purchases and sales
// @route   GET /api/dashboard/chart-data
// @access  Private
exports.getChartData = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Purchase data
    const purchaseData = await PurchaseBill.aggregate([
      {
        $match: {
          status: 'Completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          amount: { $sum: '$grandTotal' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Sales data
    const salesData = await SalesInvoice.aggregate([
      {
        $match: {
          status: 'Completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          amount: { $sum: '$grandTotal' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        purchases: purchaseData,
        sales: salesData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching chart data',
    });
  }
};
