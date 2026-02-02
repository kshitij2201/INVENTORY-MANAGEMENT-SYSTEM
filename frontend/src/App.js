import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SidebarProvider } from './context/SidebarContext';
import PrivateRoute from './components/PrivateRoute';
import MobileMenuButton from './components/MobileMenuButton';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Vendors from './pages/Vendors';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseBills from './pages/PurchaseBills';
import SalesOrders from './pages/SalesOrders';
import SalesInvoices from './pages/SalesInvoices';
import SalesReturns from './pages/SalesReturns';
import StockMovements from './pages/StockMovements';
import Alerts from './pages/Alerts';
import Users from './pages/Users';

// Component to protect routes based on feature access
const FeatureRoute = ({ feature, children }) => {
  const { canRead } = useAuth();
  
  if (!canRead(feature)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <PrivateRoute>{children}</PrivateRoute>;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SidebarProvider>
          <BrowserRouter>
            <MobileMenuButton />
            <Routes>
            <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/items"
            element={
              <FeatureRoute feature="items">
                <Items />
              </FeatureRoute>
            }
          />
          
          <Route
            path="/vendors"
            element={
              <FeatureRoute feature="vendors">
                <Vendors />
              </FeatureRoute>
            }
          />
          
          <Route
            path="/purchase-orders"
            element={
              <FeatureRoute feature="purchaseOrders">
                <PurchaseOrders />
              </FeatureRoute>
            }
          />
          
          <Route
            path="/purchase-bills"
            element={
              <FeatureRoute feature="purchaseBills">
                <PurchaseBills />
              </FeatureRoute>
            }
          />
          
          <Route
            path="/sales-orders"
            element={
              <FeatureRoute feature="salesOrders">
                <SalesOrders />
              </FeatureRoute>
            }
          />
          
          <Route
            path="/sales-invoices"
            element={
              <FeatureRoute feature="salesInvoices">
                <SalesInvoices />
              </FeatureRoute>
            }
          />
          
          <Route
            path="/sales-returns"
            element={
              <FeatureRoute feature="salesReturns">
                <SalesReturns />
              </FeatureRoute>
            }
          />
          
          <Route
            path="/stock-movements"
            element={
              <FeatureRoute feature="stockMovements">
                <StockMovements />
              </FeatureRoute>
            }
          />
          
          <Route
            path="/alerts"
            element={
              <FeatureRoute feature="alerts">
                <Alerts />
              </FeatureRoute>
            }
          />
          
          <Route
            path="/users"
            element={
              <FeatureRoute feature="users">
                <Users />
              </FeatureRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
        </SidebarProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
