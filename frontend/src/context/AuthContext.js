import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') {
      return user.role === roles;
    }
    return roles.includes(user.role);
  };

  // Check if user has read access to a feature
  const canRead = (feature) => {
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    // Use feature permissions if available
    if (user.featurePermissions && user.featurePermissions[feature]) {
      return user.featurePermissions[feature].read === true;
    }
    
    // Fallback to default role-based permissions for backward compatibility
    const defaultPermissions = {
      items: ['admin', 'staff', 'inventory_manager', 'sales_manager'],
      vendors: ['admin', 'staff', 'inventory_manager'],
      purchaseOrders: ['admin', 'staff', 'inventory_manager'],
      purchaseBills: ['admin', 'inventory_manager'],
      salesOrders: ['admin', 'staff', 'inventory_manager', 'sales_manager'],
      salesInvoices: ['admin', 'sales_manager'],
      salesReturns: ['admin', 'sales_manager'],
      stockMovements: ['admin', 'staff', 'inventory_manager', 'sales_manager'],
      alerts: ['admin', 'staff', 'inventory_manager'],
      users: ['admin'],
    };
    return defaultPermissions[feature]?.includes(user.role) || false;
  };

  // Check if user has write access to a feature
  const canWrite = (feature) => {
    if (!user) return false;
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    // Use feature permissions if available
    if (user.featurePermissions && user.featurePermissions[feature]) {
      return user.featurePermissions[feature].write === true;
    }
    
    // Fallback to default role-based permissions for backward compatibility
    const defaultPermissions = {
      items: ['admin'],
      vendors: ['admin'],
      purchaseOrders: ['admin', 'staff'],
      purchaseBills: ['admin', 'inventory_manager'],
      salesOrders: ['admin', 'staff', 'sales_manager'],
      salesInvoices: ['admin', 'sales_manager'],
      salesReturns: ['admin', 'sales_manager'],
      stockMovements: ['admin', 'inventory_manager'],
      alerts: ['admin', 'inventory_manager'],
      users: ['admin'],
    };
    return defaultPermissions[feature]?.includes(user.role) || false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    canRead,
    canWrite,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
