const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('../models/User');
const Item = require('../models/Item');
const Vendor = require('../models/Vendor');

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Database connected for seeding'))
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany();
    await Item.deleteMany();
    await Vendor.deleteMany();

    // Create users
    console.log('👤 Creating users...');
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@inventory.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Staff Member',
        email: 'staff@inventory.com',
        password: 'staff123',
        role: 'staff',
      },
      {
        name: 'Inventory Manager',
        email: 'inventory@inventory.com',
        password: 'inventory123',
        role: 'inventory_manager',
      },
      {
        name: 'Sales Manager',
        email: 'sales@inventory.com',
        password: 'sales123',
        role: 'sales_manager',
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create vendors
    console.log('🏢 Creating vendors...');
    const vendors = await Vendor.create([
      {
        name: 'ABC Suppliers',
        email: 'contact@abcsuppliers.com',
        phone: '+1234567890',
        address: '123 Main Street, New York, NY 10001',
        gstNumber: 'GST123456789',
      },
      {
        name: 'XYZ Distributors',
        email: 'info@xyzdist.com',
        phone: '+1987654321',
        address: '456 Park Avenue, Los Angeles, CA 90001',
        gstNumber: 'GST987654321',
      },
      {
        name: 'Global Trade Co',
        email: 'sales@globaltrade.com',
        phone: '+1122334455',
        address: '789 Commerce Blvd, Chicago, IL 60601',
        gstNumber: 'GST456789123',
      },
    ]);
    console.log(`✅ Created ${vendors.length} vendors`);

    // Create items
    console.log('📦 Creating items...');
    const items = await Item.create([
      {
        name: 'Laptop Dell XPS 13',
        sku: 'DELL-XPS13',
        category: 'Electronics',
        unit: 'pcs',
        purchasePrice: 800,
        sellingPrice: 1200,
        currentStock: 15,
        minStockLevel: 5,
      },
      {
        name: 'Wireless Mouse Logitech',
        sku: 'LOG-MOUSE',
        category: 'Electronics',
        unit: 'pcs',
        purchasePrice: 15,
        sellingPrice: 25,
        currentStock: 50,
        minStockLevel: 10,
      },
      {
        name: 'Office Chair Ergonomic',
        sku: 'CHAIR-ERG',
        category: 'Furniture',
        unit: 'pcs',
        purchasePrice: 120,
        sellingPrice: 200,
        currentStock: 8,
        minStockLevel: 5,
      },
      {
        name: 'Printer HP LaserJet',
        sku: 'HP-LASER',
        category: 'Electronics',
        unit: 'pcs',
        purchasePrice: 250,
        sellingPrice: 400,
        currentStock: 3,
        minStockLevel: 5,
      },
      {
        name: 'A4 Paper Ream',
        sku: 'PAPER-A4',
        category: 'Stationery',
        unit: 'box',
        purchasePrice: 3,
        sellingPrice: 5,
        currentStock: 100,
        minStockLevel: 20,
      },
      {
        name: 'Whiteboard Markers',
        sku: 'MARKER-WB',
        category: 'Stationery',
        unit: 'box',
        purchasePrice: 8,
        sellingPrice: 12,
        currentStock: 2,
        minStockLevel: 10,
      },
      {
        name: 'USB Flash Drive 32GB',
        sku: 'USB-32GB',
        category: 'Electronics',
        unit: 'pcs',
        purchasePrice: 6,
        sellingPrice: 10,
        currentStock: 0,
        minStockLevel: 15,
      },
      {
        name: 'Desk Lamp LED',
        sku: 'LAMP-LED',
        category: 'Furniture',
        unit: 'pcs',
        purchasePrice: 20,
        sellingPrice: 35,
        currentStock: 12,
        minStockLevel: 5,
      },
      {
        name: 'Keyboard Mechanical',
        sku: 'KB-MECH',
        category: 'Electronics',
        unit: 'pcs',
        purchasePrice: 50,
        sellingPrice: 80,
        currentStock: 20,
        minStockLevel: 8,
      },
      {
        name: 'Monitor 24 inch',
        sku: 'MON-24',
        category: 'Electronics',
        unit: 'pcs',
        purchasePrice: 150,
        sellingPrice: 250,
        currentStock: 10,
        minStockLevel: 5,
      },
    ]);
    console.log(`✅ Created ${items.length} items`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('--------------------');
    console.log('Admin:');
    console.log('  Email: admin@inventory.com');
    console.log('  Password: admin123');
    console.log('\nStaff:');
    console.log('  Email: staff@inventory.com');
    console.log('  Password: staff123');
    console.log('\nInventory Manager:');
    console.log('  Email: inventory@inventory.com');
    console.log('  Password: inventory123');
    console.log('\nSales Manager:');
    console.log('  Email: sales@inventory.com');
    console.log('  Password: sales123');
    console.log('--------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
