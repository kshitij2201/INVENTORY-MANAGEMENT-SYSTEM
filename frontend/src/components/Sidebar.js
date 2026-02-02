import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const { user, logout, canRead } = useAuth();
  const location = useLocation();
  const { isMobileOpen, closeSidebar } = useSidebar();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={closeSidebar}
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
            <Link to="/dashboard" className={isActive('/dashboard')} onClick={closeSidebar}>
              📊 Dashboard
            </Link>
          </li>
          
          {canRead('items') && (
            <li>
              <Link to="/items" className={isActive('/items')} onClick={closeSidebar}>
                📦 Items
              </Link>
            </li>
          )}
          
          {canRead('vendors') && (
            <li>
              <Link to="/vendors" className={isActive('/vendors')} onClick={closeSidebar}>
                🏢 Vendors
              </Link>
            </li>
          )}
          
          {(canRead('purchaseOrders') || canRead('purchaseBills')) && (
            <li style={{ marginTop: '12px', paddingLeft: '12px', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
              PURCHASE
            </li>
          )}
          
          {canRead('purchaseOrders') && (
            <li>
              <Link to="/purchase-orders" className={isActive('/purchase-orders')} onClick={closeSidebar}>
                📋 Purchase Orders
              </Link>
            </li>
          )}
          
          {canRead('purchaseBills') && (
            <li>
              <Link to="/purchase-bills" className={isActive('/purchase-bills')} onClick={closeSidebar}>
                🧾 Purchase Bills
              </Link>
            </li>
          )}
          
          {(canRead('salesOrders') || canRead('salesInvoices') || canRead('salesReturns')) && (
            <li style={{ marginTop: '12px', paddingLeft: '12px', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
              SALES
            </li>
          )}
          
          {canRead('salesOrders') && (
            <li>
              <Link to="/sales-orders" className={isActive('/sales-orders')} onClick={closeSidebar}>
                🛒 Sales Orders
              </Link>
            </li>
          )}
          
          {canRead('salesInvoices') && (
            <li>
              <Link to="/sales-invoices" className={isActive('/sales-invoices')} onClick={closeSidebar}>
                💰 Sales Invoices
              </Link>
            </li>
          )}
          
          {canRead('salesReturns') && (
            <li>
              <Link to="/sales-returns" className={isActive('/sales-returns')} onClick={closeSidebar}>
                ↩️ Sales Returns
              </Link>
            </li>
          )}
          
          {(canRead('stockMovements') || canRead('alerts')) && (
            <li style={{ marginTop: '12px', paddingLeft: '12px', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
              INVENTORY
            </li>
          )}
          
          {canRead('stockMovements') && (
            <li>
              <Link to="/stock-movements" className={isActive('/stock-movements')} onClick={closeSidebar}>
                📈 Stock Movements
              </Link>
            </li>
          )}
          
          {canRead('alerts') && (
            <li>
              <Link to="/alerts" className={isActive('/alerts')} onClick={closeSidebar}>
                ⚠️ Alerts
              </Link>
            </li>
          )}
          
          {canRead('users') && (
            <>
              <li style={{ marginTop: '12px', paddingLeft: '12px', fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>
                ADMIN
              </li>
              <li>
                <Link to="/users" className={isActive('/users')} onClick={closeSidebar}>
                  👥 User Management
                </Link>
              </li>
            </>
          )}
          
          <li style={{ marginTop: '16px' }}>
            <button onClick={() => { logout(); closeSidebar(); }} style={{ color: '#ef4444' }}>
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
