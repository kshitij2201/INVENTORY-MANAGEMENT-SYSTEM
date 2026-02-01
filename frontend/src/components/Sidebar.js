import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout, canRead } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar">
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
          <Link to="/dashboard" className={isActive('/dashboard')}>
            📊 Dashboard
          </Link>
        </li>
        
        {canRead('items') && (
          <li>
            <Link to="/items" className={isActive('/items')}>
              📦 Items
            </Link>
          </li>
        )}
        
        {canRead('vendors') && (
          <li>
            <Link to="/vendors" className={isActive('/vendors')}>
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
            <Link to="/purchase-orders" className={isActive('/purchase-orders')}>
              📋 Purchase Orders
            </Link>
          </li>
        )}
        
        {canRead('purchaseBills') && (
          <li>
            <Link to="/purchase-bills" className={isActive('/purchase-bills')}>
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
            <Link to="/sales-orders" className={isActive('/sales-orders')}>
              🛒 Sales Orders
            </Link>
          </li>
        )}
        
        {canRead('salesInvoices') && (
          <li>
            <Link to="/sales-invoices" className={isActive('/sales-invoices')}>
              💰 Sales Invoices
            </Link>
          </li>
        )}
        
        {canRead('salesReturns') && (
          <li>
            <Link to="/sales-returns" className={isActive('/sales-returns')}>
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
            <Link to="/stock-movements" className={isActive('/stock-movements')}>
              📈 Stock Movements
            </Link>
          </li>
        )}
        
        {canRead('alerts') && (
          <li>
            <Link to="/alerts" className={isActive('/alerts')}>
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
              <Link to="/users" className={isActive('/users')}>
                👥 User Management
              </Link>
            </li>
          </>
        )}
        
        <li style={{ marginTop: '30px' }}>
          <button onClick={logout} style={{ color: '#ef4444' }}>
            🚪 Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
