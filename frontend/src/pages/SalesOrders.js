import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { salesOrdersAPI, itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    items: [{ item: '', quantity: '', rate: '', amount: 0 }],
    notes: '',
  });
  
  const { canWrite } = useAuth();

  useEffect(() => {
    fetchOrders();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await salesOrdersAPI.getAll();
      setOrders(response.data.data);
      
      // Extract unique customers from orders
      const uniqueCustomers = [];
      const customerMap = new Map();
      
      response.data.data.forEach(order => {
        const key = order.customerName.toLowerCase();
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            name: order.customerName,
            email: order.customerEmail || '',
            phone: order.customerPhone || '',
          });
          uniqueCustomers.push({
            name: order.customerName,
            email: order.customerEmail || '',
            phone: order.customerPhone || '',
          });
        }
      });
      
      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error('Error fetching sales orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerNameChange = (value) => {
    setFormData({ ...formData, customerName: value });
    
    if (value.length > 0) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(filtered.length > 0);
    } else {
      setShowCustomerDropdown(false);
    }
  };

  const selectCustomer = (customer) => {
    setFormData({
      ...formData,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
    });
    setShowCustomerDropdown(false);
  };

  const fetchItems = async () => {
    try {
      const response = await itemsAPI.getAll();
      setItems(response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = qty * rate;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item: '', quantity: '', rate: '', amount: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        ...formData,
        totalAmount: calculateTotal(),
      };
      
      await salesOrdersAPI.create(orderData);
      setShowForm(false);
      resetForm();
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving sales order');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (window.confirm(`Are you sure you want to change status to ${status}?`)) {
      try {
        await salesOrdersAPI.updateStatus(id, status);
        fetchOrders();
      } catch (error) {
        alert(error.response?.data?.message || 'Error updating status');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sales order?')) {
      try {
        await salesOrdersAPI.delete(id);
        fetchOrders();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting sales order');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      items: [{ item: '', quantity: '', rate: '', amount: 0 }],
      notes: '',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      Draft: 'badge-secondary',
      Confirmed: 'badge-success',
      Cancelled: 'badge-danger',
    };
    return badges[status] || 'badge-secondary';
  };

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div className="flex justify-between align-center">
            <div>
              <h1>🛒 Sales Orders</h1>
              <p>Manage customer sales orders</p>
            </div>
            {canWrite('salesOrders') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(true);
                  resetForm();
                }}
              >
                + New Sales Order
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="content-card">
            <h2>New Sales Order</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label className="form-label">Customer Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.customerName}
                    onChange={(e) => handleCustomerNameChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                    required
                    placeholder="Start typing customer name..."
                  />
                  {showCustomerDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      marginTop: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}>
                      {filteredCustomers.map((customer, index) => (
                        <div
                          key={index}
                          onClick={() => selectCustomer(customer)}
                          style={{
                            padding: '10px 15px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f1f5f9',
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                        >
                          <div style={{ fontWeight: '500' }}>{customer.name}</div>
                          {customer.phone && (
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Customer Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Customer Phone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '20px' }}>Items</h3>
              {formData.items.map((orderItem, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <select
                    className="form-select"
                    value={orderItem.item}
                    onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                    required
                  >
                    <option value="">Select Item</option>
                    {items.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} ({item.sku}) - Stock: {item.currentStock}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Quantity"
                    value={orderItem.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                    min="1"
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Rate"
                    value={orderItem.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                  <input
                    type="number"
                    className="form-input"
                    value={orderItem.amount.toFixed(2)}
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addItem}>
                + Add Item
              </button>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>

              <div style={{ marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                Total Amount: ₹{calculateTotal().toFixed(2)}
              </div>

              <div className="flex gap-10 mt-20">
                <button type="submit" className="btn btn-primary">
                  Create Sales Order
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="content-card">
          <h2>All Sales Orders ({orders.length})</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>{order.customerPhone}</td>
                  <td>₹{(order.totalAmount || 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-10">
                      {canWrite('salesOrders') && order.status === 'Draft' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusUpdate(order._id, 'Confirmed')}
                          >
                            Confirm
                          </button>
                          {canWrite('salesOrders') && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(order._id)}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                      {order.status === 'Confirmed' && (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesOrders;
