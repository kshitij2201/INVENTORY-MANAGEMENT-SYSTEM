import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit: 'pcs',
    purchasePrice: '',
    sellingPrice: '',
    currentStock: '',
    minStockLevel: '',
  });
  
  const { canWrite } = useAuth();

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh items when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchItems();
      }
    };

    const handleFocus = () => {
      fetchItems();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchItems = async () => {
    try {
      const response = await itemsAPI.getAll({ search: searchTerm });
      setItems(response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await itemsAPI.update(editingItem._id, formData);
      } else {
        await itemsAPI.create(formData);
      }
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      fetchItems();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      unit: item.unit,
      purchasePrice: item.purchasePrice,
      sellingPrice: item.sellingPrice,
      currentStock: item.currentStock,
      minStockLevel: item.minStockLevel,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemsAPI.delete(id);
        fetchItems();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting item');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      unit: 'pcs',
      purchasePrice: '',
      sellingPrice: '',
      currentStock: '',
      minStockLevel: '',
    });
  };

  const getStockStatus = (item) => {
    if (item.currentStock === 0) return { badge: 'badge-danger', text: 'Out of Stock' };
    if (item.currentStock <= item.minStockLevel) return { badge: 'badge-warning', text: 'Low Stock' };
    return { badge: 'badge-success', text: 'In Stock' };
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
              <h1>Items Management</h1>
              <p>Manage your inventory items</p>
            </div>
            {canWrite('items') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(true);
                  setEditingItem(null);
                  resetForm();
                }}
              >
                + Add Item
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="content-card">
            <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <select
                    className="form-select"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilogram</option>
                    <option value="box">Box</option>
                    <option value="ltr">Liter</option>
                    <option value="mtr">Meter</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Purchase Price *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
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
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Current Stock {!editingItem && '*'}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    required={!editingItem}
                    min="0"
                    placeholder={editingItem ? "Manual stock adjustment" : "Initial stock quantity"}
                  />
                  {editingItem && (
                    <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                      ⚠️ Changing stock directly bypasses audit trail. Use Purchase Bills for proper tracking.
                    </small>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Min Stock Level *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                    required
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex gap-10 mt-20">
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Create'} Item
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingItem(null);
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
          <div className="flex justify-between align-center mb-20">
            <h2>All Items ({items.length})</h2>
            <input
              type="text"
              className="form-input"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={fetchItems}
              style={{ maxWidth: '300px' }}
            />
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                <th>Current Stock</th>
                <th>Min Level</th>
                <th>Status</th>
                {canWrite('items') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={item._id}>
                    <td>{item.sku}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>${item.purchasePrice}</td>
                    <td>${item.sellingPrice}</td>
                    <td>{item.currentStock} {item.unit}</td>
                    <td>{item.minStockLevel} {item.unit}</td>
                    <td>
                      <span className={`badge ${status.badge}`}>
                        {status.text}
                      </span>
                    </td>
                    {canWrite('items') && (
                      <td>
                        <div className="flex gap-10">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(item._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Items;
