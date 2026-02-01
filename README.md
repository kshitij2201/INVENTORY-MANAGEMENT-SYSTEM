# 📦 Inventory Management System

> A full-stack inventory management application built with the MERN stack, featuring role-based access control, real-time stock tracking, and comprehensive business workflows for purchase and sales operations.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)

**Design by** [Kshitij Meshram](https://kshitij-kappa.vercel.app/)

---

## 🌟 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-Based Access Control (RBAC)** with 4 user roles:
  - **Admin** - Full system access
  - **Staff** - Standard operations access
  - **Inventory Manager** - Inventory and purchase focused
  - **Sales Manager** - Sales focused operations
- **Custom feature permissions** - Granular read/write controls per user
- **User management** - Create, edit, deactivate users and manage permissions

### 📦 Inventory Management
- **Items/Products Management**
  - Create, read, update, delete items
  - Auto-generated SKU codes
  - Minimum stock level thresholds
  - Real-time stock tracking
  - Multiple units of measurement (kg, pcs, liters, etc.)
  - Purchase and selling price management
- **Stock Movement Audit Trail**
  - Complete history of all stock changes
  - Reference to source documents (bills, invoices, returns)
  - Before/after stock levels
  - Movement type tracking (purchase, sale, return, adjustment)

### 🛒 Purchase Management
- **Vendors Management**
  - Supplier database with contact details
  - GST number tracking
  - Purchase history per vendor
- **Purchase Orders (PO)**
  - Create draft orders (no stock impact)
  - Status management (draft, pending, completed)
  - Multi-item purchase orders
- **Purchase Bills**
  - Convert orders to actual bills
  - **Automatic stock increase** on bill completion
  - Lock completed bills (prevent accidental edits)
  - Payment tracking (total, paid, pending amounts)

### 💰 Sales Management
- **Sales Orders**
  - Customer order creation
  - Status tracking (pending, completed, cancelled)
  - Multi-item orders
- **Sales Invoices**
  - Convert orders to invoices
  - **Automatic stock decrease** on invoice completion
  - Payment tracking with detailed breakdown
  - Lock completed invoices
- **Sales Returns**
  - Process customer returns
  - **Automatic stock adjustment** (adds back to inventory)
  - Linked to original invoice
  - Return tracking and reporting

### 🔔 Alerts System
- **Automated low stock alerts**
  - Auto-generated when stock falls below minimum level
  - Severity levels: Low Stock, Critical (out of stock)
  - Auto-resolution when stock replenished
  - Prevents duplicate alerts for same item
- **Alert Management**
  - Filter by severity and status
  - Manual resolution with user tracking
  - Alert history and audit trail

### 📊 Dashboard & Analytics
- **Real-time statistics**
  - Total items and stock value
  - Purchase and sales totals
  - Payment tracking (paid vs pending)
  - Sales returns overview
- **Recent activity feed** - Latest transactions across the system
- **Active alerts** - Quick view of pending stock issues
- **Payment breakdown**
  - Purchase: Total amount, paid amount, pending amount
  - Sales: Total amount, paid amount, returned amount, pending amount

### 🎨 Modern UI/UX
- **Professional black & white theme**
- **Responsive design** - Works on desktop, tablet, and mobile
- **Custom font** - Lexend Deca for modern typography
- **Gradient effects** and smooth animations
- **Interactive forms** with real-time validation
- **Data tables** with sorting, filtering, and search
- **Modal dialogs** for create/edit operations
- **Role-based UI** - Show/hide features based on permissions

---

## 🏗️ Architecture

### Backend Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Secure authentication
- **bcrypt** - Password hashing

### Frontend Stack
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Context API** - State management (Auth, Notifications)
- **Axios** - HTTP client
- **CSS3** - Modern styling with variables and animations

### Security Features
- **Helmet.js** - Security headers
- **express-rate-limit** - Rate limiting (100 req/15min, 5 login attempts/15min)
- **Compression** - Response compression (gzip)
- **CORS** - Cross-Origin Resource Sharing
- **Input validation** - Request payload limits (10MB max)
- **MongoDB connection pooling** - Efficient database connections

---

## 📁 Project Structure

```
Inventory/
├── backend/
│   ├── controllers/          # Business logic (11 controllers)
│   │   ├── authController.js         # User auth & management
│   │   ├── itemController.js         # Items CRUD
│   │   ├── vendorController.js       # Vendors CRUD
│   │   ├── purchaseOrderController.js
│   │   ├── purchaseBillController.js
│   │   ├── salesOrderController.js
│   │   ├── salesInvoiceController.js
│   │   ├── salesReturnController.js
│   │   ├── stockMovementController.js
│   │   ├── alertController.js
│   │   └── dashboardController.js
│   ├── models/               # MongoDB schemas (10 models)
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Vendor.js
│   │   ├── PurchaseOrder.js
│   │   ├── PurchaseBill.js
│   │   ├── SalesOrder.js
│   │   ├── SalesInvoice.js
│   │   ├── SalesReturn.js
│   │   ├── StockMovement.js
│   │   └── Alert.js
│   ├── routes/               # API endpoints (11 route files)
│   ├── middleware/
│   │   └── auth.js          # JWT auth & RBAC middleware
│   ├── utils/
│   │   ├── stockUtils.js    # Stock update logic
│   │   └── tokenUtils.js    # JWT helpers
│   ├── seeds/
│   │   └── seedData.js      # Sample data generator
│   ├── server.js            # Express app entry
│   └── package.json
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   ├── IMSlogo.png      # Application logo
    │   └── favicon
    ├── src/
    │   ├── components/
    │   │   ├── PrivateRoute.js       # Auth-protected routes
    │   │   ├── RoleBasedRender.js    # Conditional rendering
    │   │   └── Sidebar.js            # Navigation menu
    │   ├── context/
    │   │   ├── AuthContext.js        # Auth state & permissions
    │   │   └── NotificationContext.js
    │   ├── pages/              # 11 pages
    │   │   ├── Login.js              # Authentication
    │   │   ├── Dashboard.js          # Analytics overview
    │   │   ├── Items.js              # Inventory management
    │   │   ├── Vendors.js            # Supplier management
    │   │   ├── PurchaseOrders.js
    │   │   ├── PurchaseBills.js
    │   │   ├── SalesOrders.js
    │   │   ├── SalesInvoices.js
    │   │   ├── SalesReturns.js
    │   │   ├── StockMovements.js     # Audit trail
    │   │   ├── Alerts.js             # Stock alerts
    │   │   └── Users.js              # User management (Admin)
    │   ├── services/
    │   │   └── api.js        # Axios API client
    │   ├── App.js            # Routes & providers
    │   ├── index.css         # Global styles
    │   └── index.js          # React entry point
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/kshitij2201/INVENTORY-MANAGEMENT-SYSTEM.git
cd INVENTORY-MANAGEMENT-SYSTEM
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the content below and save as .env
```

Create `backend/.env` file:
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/inventory_db_dev

# JWT Secret (Change this to a random secure string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Optional: MongoDB Atlas (Cloud Database)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory_db?retryWrites=true&w=majority
```

```bash
# Seed the database with sample data (optional)
node seeds/seedData.js

# Start the backend server
npm run dev
```

Backend will run on **http://localhost:5000**

#### 3. Frontend Setup

```bash
# Open new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
echo REACT_APP_API_URL=http://localhost:5000/api > .env

# Start the frontend development server
npm start
```

Frontend will open automatically at **http://localhost:3000**

---

## 👤 Default Login Credentials

After running the seed script, you can login with:

### Admin Account
- **Email:** `admin@inventory.com`
- **Password:** `admin123`
- **Access:** Full system access

### Staff Account
- **Email:** `staff@inventory.com`
- **Password:** `staff123`
- **Access:** Standard operations

### Inventory Manager
- **Email:** `inventory@inventory.com`
- **Password:** `inventory123`
- **Access:** Inventory and purchase operations

### Sales Manager
- **Email:** `sales@inventory.com`
- **Password:** `sales123`
- **Access:** Sales focused operations

> ⚠️ **Important:** Change these passwords in production!

---

## 🔑 Role-Based Permissions

| Feature | Admin | Staff | Inventory Manager | Sales Manager |
|---------|-------|-------|-------------------|---------------|
| **Dashboard** | ✅ View | ✅ View | ✅ View | ✅ View |
| **Items** | ✅ Full | ✅ View | ✅ View | ✅ View |
| **Vendors** | ✅ Full | ✅ View | ✅ View | ❌ No Access |
| **Purchase Orders** | ✅ Full | ✅ Full | ✅ Full | ❌ No Access |
| **Purchase Bills** | ✅ Full | ✅ Full | ✅ Full | ❌ No Access |
| **Sales Orders** | ✅ Full | ✅ Full | ✅ View | ✅ Full |
| **Sales Invoices** | ✅ Full | ✅ Full | ✅ View | ✅ Full |
| **Sales Returns** | ✅ Full | ✅ Full | ✅ View | ✅ Full |
| **Stock Movements** | ✅ View | ✅ View | ✅ View | ✅ View |
| **Alerts** | ✅ Full | ✅ View | ✅ Full | ❌ No Access |
| **Users** | ✅ Full | ❌ No Access | ❌ No Access | ❌ No Access |

**Custom Permissions:** Admin can assign custom read/write permissions to individual users, overriding default role permissions.

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          Register new user (Admin only in production)
POST   /api/auth/login             User login
GET    /api/auth/me                Get current user
GET    /api/auth/users             Get all users (Admin only)
PUT    /api/auth/users/:id/role    Update user role (Admin only)
PUT    /api/auth/users/:id/permissions  Update user permissions (Admin only)
PUT    /api/auth/users/:id/deactivate   Deactivate user (Admin only)
```

### Items
```
GET    /api/items                  Get all items
GET    /api/items/low-stock        Get low stock items
GET    /api/items/:id              Get single item
POST   /api/items                  Create item (Admin only)
PUT    /api/items/:id              Update item (Admin only)
DELETE /api/items/:id              Delete item (Admin only)
```

### Vendors
```
GET    /api/vendors                Get all vendors
GET    /api/vendors/:id            Get single vendor
POST   /api/vendors                Create vendor (Admin only)
PUT    /api/vendors/:id            Update vendor (Admin only)
DELETE /api/vendors/:id            Delete vendor (Admin only)
```

### Purchase Orders
```
GET    /api/purchase-orders        Get all purchase orders
GET    /api/purchase-orders/:id    Get single purchase order
POST   /api/purchase-orders        Create purchase order
PUT    /api/purchase-orders/:id    Update purchase order
PATCH  /api/purchase-orders/:id/status  Update status
DELETE /api/purchase-orders/:id    Delete purchase order
```

### Purchase Bills
```
GET    /api/purchase-bills         Get all purchase bills
GET    /api/purchase-bills/:id     Get single purchase bill
POST   /api/purchase-bills         Create purchase bill (updates stock)
PUT    /api/purchase-bills/:id     Update purchase bill
PATCH  /api/purchase-bills/:id/status  Complete bill (updates stock)
PATCH  /api/purchase-bills/:id/payment Update payment
DELETE /api/purchase-bills/:id     Delete purchase bill
```

### Sales Orders
```
GET    /api/sales-orders           Get all sales orders
GET    /api/sales-orders/:id       Get single sales order
POST   /api/sales-orders           Create sales order
PUT    /api/sales-orders/:id       Update sales order
PATCH  /api/sales-orders/:id/status  Update status
DELETE /api/sales-orders/:id       Delete sales order
```

### Sales Invoices
```
GET    /api/sales-invoices         Get all sales invoices
GET    /api/sales-invoices/:id     Get single sales invoice
POST   /api/sales-invoices         Create sales invoice (updates stock)
PUT    /api/sales-invoices/:id     Update sales invoice
PATCH  /api/sales-invoices/:id/status  Complete invoice (updates stock)
PATCH  /api/sales-invoices/:id/payment Update payment
DELETE /api/sales-invoices/:id     Delete sales invoice
```

### Sales Returns
```
GET    /api/sales-returns          Get all sales returns
GET    /api/sales-returns/:id      Get single sales return
POST   /api/sales-returns          Create sales return (updates stock)
DELETE /api/sales-returns/:id      Delete sales return
```

### Stock Movements
```
GET    /api/stock-movements        Get all stock movements (audit trail)
GET    /api/stock-movements/item/:itemId  Get movements for specific item
```

### Alerts
```
GET    /api/alerts                 Get all alerts
GET    /api/alerts/:id             Get single alert
PATCH  /api/alerts/:id/resolve     Resolve alert
DELETE /api/alerts/:id             Delete alert
```

### Dashboard
```
GET    /api/dashboard/stats        Get dashboard statistics
GET    /api/dashboard/recent-activities  Get recent activities
GET    /api/dashboard/chart-data   Get chart data
```

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## 🔧 Configuration

### Backend Configuration Options

#### Rate Limiting
Located in `server.js`:
```javascript
// General API rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
});

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 login attempts per window
});
```

#### Database Connection Pooling
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,  // Maximum connections
  minPoolSize: 2,   // Minimum connections
});
```

#### Security Headers
Configured via Helmet.js - automatically enabled.

### Frontend Configuration

#### API URL
Set in `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production deployment, update to your backend URL.

---

## 🚀 Production Deployment

### Recommended Deployment Stack
- **Frontend:** Vercel (free tier available)
- **Backend:** Railway or Render (free tier available)
- **Database:** MongoDB Atlas (free tier available)

### Quick Deployment Steps

#### 1. Deploy Database (MongoDB Atlas)
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all)
5. Get connection string

#### 2. Deploy Backend (Railway)
```bash
cd backend

# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Add environment variables in Railway dashboard:
# - NODE_ENV=production
# - MONGODB_URI=<your_atlas_connection_string>
# - JWT_SECRET=<your_secure_secret>
```

#### 3. Deploy Frontend (Vercel)
```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel login
vercel --prod

# Add environment variable in Vercel dashboard:
# - REACT_APP_API_URL=<your_railway_backend_url>/api
```

**Total Cost:** $0/month (all free tiers)

---

## 🧪 Testing

### Seed Database
```bash
cd backend
node seeds/seedData.js
```

This creates:
- 4 users (one for each role)
- 20 sample items
- 5 vendors
- Sample purchase orders, bills, invoices, returns
- Stock movements and alerts

### Manual Testing Checklist
- [ ] Login with each role
- [ ] Create new item
- [ ] Create purchase order → Convert to bill → Verify stock increase
- [ ] Create sales order → Convert to invoice → Verify stock decrease
- [ ] Create sales return → Verify stock increase
- [ ] Check stock movements log
- [ ] Verify low stock alerts are generated
- [ ] Test permission restrictions per role
- [ ] Edit user permissions (Admin)

---

## 🛠️ Development

### Available Scripts

#### Backend
```bash
npm run dev      # Start with nodemon (auto-restart)
npm start        # Start production server
```

#### Frontend
```bash
npm start        # Development server (port 3000)
npm run build    # Production build
npm test         # Run tests
```

### Adding New Features

1. **Backend:**
   - Create model in `models/`
   - Add controller in `controllers/`
   - Define routes in `routes/`
   - Update middleware if needed

2. **Frontend:**
   - Create page component in `pages/`
   - Add route in `App.js`
   - Update `AuthContext` for permissions
   - Add menu item in `Sidebar.js`
   - Create API methods in `services/api.js`

---

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in backend `.env` or kill process using the port

#### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Verify `REACT_APP_API_URL` in frontend `.env` matches backend URL

#### JWT Token Expired
**Solution:** Login again to get new token

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Kshitij Meshram**
- Portfolio: [https://kshitij-kappa.vercel.app/](https://kshitij-kappa.vercel.app/)
- GitHub: [@kshitij2201](https://github.com/kshitij2201)

---


