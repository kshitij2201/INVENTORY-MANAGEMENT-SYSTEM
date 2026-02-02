import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { purchaseOrdersAPI, vendorsAPI, itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showQuickAddItem, setShowQuickAddItem] = useState(false);
  const [quickItemData, setQuickItemData] = useState({
    name: '',
    sku: '',
    category: '',
    purchasePrice: '',
    sellingPrice: '',
    unit: 'pcs',
    minStockLevel: '10',
    currentStock: '0'
  });
  const [formData, setFormData] = useState({
    vendor: '',
    items: [{ item: '', quantity: '', rate: '', amount: 0 }],
    notes: '',
  });
  
  const { canWrite } = useAuth();

  useEffect(() => {
    fetchOrders();
    fetchVendors();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await purchaseOrdersAPI.getAll();
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll();
      setVendors(response.data.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
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
      
      if (editingOrder) {
        await purchaseOrdersAPI.update(editingOrder._id, orderData);
      } else {
        await purchaseOrdersAPI.create(orderData);
      }
      setShowForm(false);
      setEditingOrder(null);
      resetForm();
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving purchase order');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (window.confirm(`Are you sure you want to change status to ${status}?`)) {
      try {
        await purchaseOrdersAPI.updateStatus(id, status);
        fetchOrders();
      } catch (error) {
        alert(error.response?.data?.message || 'Error updating status');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        await purchaseOrdersAPI.delete(id);
        fetchOrders();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting purchase order');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      vendor: '',
      items: [{ item: '', quantity: '', rate: '', amount: 0 }],
      notes: '',
    });
  };

  const handleQuickAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await itemsAPI.create(quickItemData);
      const newItem = response.data.data;
      
      // Refresh items list
      await fetchItems();
      
      // Close modal
      setShowQuickAddItem(false);
      
      // Reset quick add form
      setQuickItemData({
        name: '',
        sku: '',
        category: '',
        purchasePrice: '',
        sellingPrice: '',
        unit: 'pcs',
        minStockLevel: '10',
        currentStock: '0'
      });
      
      alert('Item added successfully! You can now select it.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding item');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      Draft: 'badge-secondary',
      Sent: 'badge-info',
      Approved: 'badge-success',
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
              <h1>📋 Purchase Orders</h1>
              <p>Manage purchase orders from vendors</p>
            </div>
            {canWrite('purchaseOrders') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(true);
                  setEditingOrder(null);
                  resetForm();
                }}
              >
                + New Purchase Order
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="content-card">
            <h2>{editingOrder ? 'Edit Purchase Order' : 'New Purchase Order'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Vendor *</label>
                <select
                  className="form-select"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  required
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <h3>Items</h3>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowQuickAddItem(true)}
                  style={{ fontSize: '12px' }}
                >
                  + Add New Item
                </button>
              </div>
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
                        {item.name} ({item.sku})
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
                  {editingOrder ? 'Update' : 'Create'} Purchase Order
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingOrder(null);
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
          <h2>All Purchase Orders ({orders.length})</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Vendor</th>
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
                  <td>{order.vendor?.name}</td>
                  <td>₹{(order.totalAmount || 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-10">
                      {canWrite('purchaseOrders') && order.status === 'Draft' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusUpdate(order._id, 'Approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(order._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {order.status === 'Sent' && (
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

      {/* Quick Add Item Modal */}
      {showQuickAddItem && (
        <div className="modal-overlay" onClick={() => setShowQuickAddItem(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2>➕ Quick Add New Item</h2>
            <form onSubmit={handleQuickAddItem}>
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={quickItemData.name}
                  onChange={(e) => setQuickItemData({ ...quickItemData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={quickItemData.category}
                    onChange={(e) => setQuickItemData({ ...quickItemData, category: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <select
                    className="form-select"
                    value={quickItemData.unit}
                    onChange={(e) => setQuickItemData({ ...quickItemData, unit: e.target.value })}
                    required
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="ltr">Liters</option>
                    <option value="box">Boxes</option>
                    <option value="mtr">Meters</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Purchase Price *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={quickItemData.purchasePrice}
                    onChange={(e) => setQuickItemData({ ...quickItemData, purchasePrice: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Selling Price *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={quickItemData.sellingPrice}
                    onChange={(e) => setQuickItemData({ ...quickItemData, sellingPrice: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Initial Stock</label>
                  <input
                    type="number"
                    className="form-input"
                    value={quickItemData.currentStock}
                    onChange={(e) => setQuickItemData({ ...quickItemData, currentStock: e.target.value })}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Min Stock Level</label>
                  <input
                    type="number"
                    className="form-input"
                    value={quickItemData.minStockLevel}
                    onChange={(e) => setQuickItemData({ ...quickItemData, minStockLevel: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex gap-10 mt-20">
                <button type="submit" className="btn btn-primary">
                  Add Item
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowQuickAddItem(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
