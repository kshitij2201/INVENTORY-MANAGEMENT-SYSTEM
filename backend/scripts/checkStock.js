const mongoose = require('mongoose');
const Item = require('../models/Item');
const PurchaseBill = require('../models/PurchaseBill');
const StockMovement = require('../models/StockMovement');

async function checkStock() {
  try {
    await mongoose.connect('mongodb://localhost:27017/inventory_db_dev');
    
    console.log('=== ITEMS ===');
    const items = await Item.find();
    items.forEach(i => console.log(`${i.sku}: ${i.name} - Stock: ${i.currentStock} ${i.unit}`));
    
    console.log('\n=== PURCHASE BILLS ===');
    const bills = await PurchaseBill.find().populate('items.item', 'name sku');
    bills.forEach(b => {
      console.log(`${b.billNumber} - Status: ${b.status} - Created: ${b.createdAt}`);
      b.items.forEach(item => console.log(`  - ${item.item?.sku}: qty ${item.quantity}`));
    });
    
    console.log('\n=== STOCK MOVEMENTS ===');
    const movements = await StockMovement.find()
      .populate('item', 'name sku')
      .sort({ createdAt: -1 })
      .limit(10);
    
    movements.forEach(m => console.log(`${m.item?.sku}: ${m.type} ${m.quantity} (${m.movementType}) - ${m.createdAt}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkStock();
