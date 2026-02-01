import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout, canRead } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={closeMobileSidebar}
        />
      )}

      <div className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Inventory System</h2>
          <div className="user-info">
            <div>{user?.name}</div>
            <div style={{ textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
        
        <ul className="sidebar-nav">
          <li>
            <Link to="/dashboard" className={isActive('/dashboard')} onClick={closeMobileSidebar}>
              📊 Dashboard
            </Link>
          </li>
          
          {canRead('items') && (
            <li>
              <Link to="/items" className={isActive('/items')} onClick={closeMobileSidebar}>
                📦 Items
              </Link>
            </li>
          )}
          
          {canRead('vendors') && (
            <li>
              <Link to="/vendors" className={isActive('/vendors')} onClick={closeMobileSidebar}>
                🏢 Vendors
              </Link>
            </li>
          )}
          
          {(canRead('purchaseOrders') || canRead('purchaseBills')) && (
            <li style={{ marginTop: '20px', paddingLeft: '20px', fontSize: '12px', color: '#94a3b8' }}>
              PURCHASE
            </li>
          )}
          
          {canRead('purchaseOrders') && (
            <li>
              <Link to="/purchase-orders" className={isActive('/purchase-orders')} onClick={closeMobileSidebar}>
                📋 Purchase Orders
              </Link>
            </li>
          )}
          
          {canRead('purchaseBills') && (
            <li>
              <Link to="/purchase-bills" className={isActive('/purchase-bills')} onClick={closeMobileSidebar}>
                🧾 Purchase Bills
              </Link>
            </li>
          )}
          
          {(canRead('salesOrders') || canRead('salesInvoices') || canRead('salesReturns')) && (
            <li style={{ marginTop: '20px', paddingLeft: '20px', fontSize: '12px', color: '#94a3b8' }}>
              SALES
            </li>
          )}
          
          {canRead('salesOrders') && (
            <li>
              <Link to="/sales-orders" className={isActive('/sales-orders')} onClick={closeMobileSidebar}>
                🛒 Sales Orders
              </Link>
            </li>
          )}
          
          {canRead('salesInvoices') && (
            <li>
              <Link to="/sales-invoices" className={isActive('/sales-invoices')} onClick={closeMobileSidebar}>
                💰 Sales Invoices
              </Link>
            </li>
          )}
          
          {canRead('salesReturns') && (
            <li>
              <Link to="/sales-returns" className={isActive('/sales-returns')} onClick={closeMobileSidebar}>
                ↩️ Sales Returns
              </Link>
            </li>
          )}
          
          {(canRead('stockMovements') || canRead('alerts')) && (
            <li style={{ marginTop: '20px', paddingLeft: '20px', fontSize: '12px', color: '#94a3b8' }}>
              INVENTORY
            </li>
          )}
          
          {canRead('stockMovements') && (
            <li>
              <Link to="/stock-movements" className={isActive('/stock-movements')} onClick={closeMobileSidebar}>
                📈 Stock Movements
              </Link>
            </li>
          )}
          
          {canRead('alerts') && (
            <li>
              <Link to="/alerts" className={isActive('/alerts')} onClick={closeMobileSidebar}>
                ⚠️ Alerts
              </Link>
            </li>
          )}
          
          {canRead('users') && (
            <>
              <li style={{ marginTop: '20px', paddingLeft: '20px', fontSize: '12px', color: '#94a3b8' }}>
                ADMIN
              </li>
              <li>
                <Link to="/users" className={isActive('/users')} onClick={closeMobileSidebar}>
                  👥 User Management
                </Link>
              </li>
            </>
          )}
          
          <li style={{ marginTop: '30px' }}>
            <button onClick={() => { logout(); closeMobileSidebar(); }} style={{ color: '#ef4444' }}>
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
