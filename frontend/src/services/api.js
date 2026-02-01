import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Avoid redirect loop: only redirect if not already on login page
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/users'),
  updateUserRole: (id, data) => api.put(`/auth/users/${id}/role`, data),
  updateUserPermissions: (id, data) => api.put(`/auth/users/${id}/permissions`, data),
  deactivateUser: (id) => api.put(`/auth/users/${id}/deactivate`),
};

// Items
export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getOne: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
  getLowStock: () => api.get('/items/low-stock'),
};

// Vendors
export const vendorsAPI = {
  getAll: (params) => api.get('/vendors', { params }),
  getOne: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};

// Purchase Orders
export const purchaseOrdersAPI = {
  getAll: (params) => api.get('/purchase-orders', { params }),
  getOne: (id) => api.get(`/purchase-orders/${id}`),
  create: (data) => api.post('/purchase-orders', data),
  update: (id, data) => api.put(`/purchase-orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/purchase-orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/purchase-orders/${id}`),
};

// Purchase Bills
export const purchaseBillsAPI = {
  getAll: (params) => api.get('/purchase-bills', { params }),
  getOne: (id) => api.get(`/purchase-bills/${id}`),
  create: (data) => api.post('/purchase-bills', data),
  update: (id, data) => api.put(`/purchase-bills/${id}`, data),
  complete: (id) => api.patch(`/purchase-bills/${id}/complete`),
  delete: (id) => api.delete(`/purchase-bills/${id}`),
  addPayment: (id, data) => api.post(`/purchase-bills/${id}/payments`, data),
  getPayments: (id) => api.get(`/purchase-bills/${id}/payments`),
};

// Sales Orders
export const salesOrdersAPI = {
  getAll: (params) => api.get('/sales-orders', { params }),
  getOne: (id) => api.get(`/sales-orders/${id}`),
  create: (data) => api.post('/sales-orders', data),
  update: (id, data) => api.put(`/sales-orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/sales-orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/sales-orders/${id}`),
};

// Sales Invoices
export const salesInvoicesAPI = {
  getAll: (params) => api.get('/sales-invoices', { params }),
  getOne: (id) => api.get(`/sales-invoices/${id}`),
  create: (data) => api.post('/sales-invoices', data),
  update: (id, data) => api.put(`/sales-invoices/${id}`, data),
  complete: (id) => api.patch(`/sales-invoices/${id}/complete`),
  delete: (id) => api.delete(`/sales-invoices/${id}`),
  addPayment: (id, data) => api.post(`/sales-invoices/${id}/payments`, data),
  getPayments: (id) => api.get(`/sales-invoices/${id}/payments`),
};

// Sales Returns
export const salesReturnsAPI = {
  getAll: (params) => api.get('/sales-returns', { params }),
  getOne: (id) => api.get(`/sales-returns/${id}`),
  create: (data) => api.post('/sales-returns', data),
  complete: (id) => api.patch(`/sales-returns/${id}/complete`),
  delete: (id) => api.delete(`/sales-returns/${id}`),
};

// Stock Movements
export const stockMovementsAPI = {
  getAll: (params) => api.get('/stock-movements', { params }),
  getByItem: (itemId) => api.get(`/stock-movements/item/${itemId}`),
};

// Alerts
export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getOne: (id) => api.get(`/alerts/${id}`),
  resolve: (id) => api.patch(`/alerts/${id}/resolve`),
  delete: (id) => api.delete(`/alerts/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivities: (params) => api.get('/dashboard/recent-activities', { params }),
  getChartData: (params) => api.get('/dashboard/chart-data', { params }),
};

export default api;
