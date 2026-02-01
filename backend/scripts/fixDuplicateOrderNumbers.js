const mongoose = require('mongoose');
const PurchaseOrder = require('../models/PurchaseOrder');

async function fixDuplicates() {
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory_db_dev');
    console.log('Connected to database...\n');

    // Find duplicates
    const duplicates = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: '$orderNumber',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('No duplicate order numbers found.');
      process.exit(0);
    }

    console.log(`Found ${duplicates.length} duplicate order number(s):\n`);

    for (const dup of duplicates) {
      console.log(`\n📋 Order Number: ${dup._id} (${dup.count} duplicates)`);
      
      const orders = await PurchaseOrder.find({ orderNumber: dup._id })
        .sort({ createdAt: 1 })
        .populate('vendor', 'name')
        .populate('createdBy', 'name');

      console.log('  Keeping the oldest one, regenerating numbers for others...\n');

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        console.log(`  ${i + 1}. ID: ${order._id}`);
        console.log(`     Created: ${order.createdAt}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Vendor: ${order.vendor?.name || 'N/A'}`);
        console.log(`     CreatedBy: ${order.createdBy?.name || 'N/A'}`);

        if (i > 0) {
          // Find the next available order number
          const lastOrder = await PurchaseOrder.findOne({ 
            orderNumber: { $exists: true, $ne: null } 
          })
          .sort({ orderNumber: -1 })
          .select('orderNumber');

          let nextNumber = 1;
          if (lastOrder && lastOrder.orderNumber) {
            const lastNumber = parseInt(lastOrder.orderNumber.replace('PO', ''));
            nextNumber = lastNumber + 1;
          }

          const newOrderNumber = `PO${String(nextNumber).padStart(6, '0')}`;
          
          // Update without triggering pre-save hook
          await PurchaseOrder.updateOne(
            { _id: order._id },
            { $set: { orderNumber: newOrderNumber } }
          );
          
          console.log(`     ✅ Updated to: ${newOrderNumber}`);
        } else {
          console.log(`     ✅ Keeping this one`);
        }
      }
    }

    console.log('\n✅ All duplicates fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixDuplicates();
