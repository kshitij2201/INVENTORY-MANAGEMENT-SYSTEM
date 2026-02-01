import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { vendorsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstNumber: '',
  });
  
  const { canWrite } = useAuth();

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll({ search: searchTerm });
      setVendors(response.data.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await vendorsAPI.update(editingVendor._id, formData);
      } else {
        await vendorsAPI.create(formData);
      }
      setShowForm(false);
      setEditingVendor(null);
      resetForm();
      fetchVendors();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving vendor');
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      gstNumber: vendor.gstNumber,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await vendorsAPI.delete(id);
        fetchVendors();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting vendor');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      gstNumber: '',
    });
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
              <h1>🏢 Vendors Management</h1>
              <p>Manage your suppliers and vendors</p>
            </div>
            {canWrite('vendors') && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowForm(true);
                  setEditingVendor(null);
                  resetForm();
                }}
              >
                + Add Vendor
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="content-card">
            <h2>{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
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
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">GST Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                </div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="flex gap-10 mt-20">
                <button type="submit" className="btn btn-primary">
                  {editingVendor ? 'Update' : 'Create'} Vendor
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVendor(null);
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
            <h2>All Vendors ({vendors.length})</h2>
            <input
              type="text"
              className="form-input"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={fetchVendors}
              style={{ maxWidth: '300px' }}
            />
          </div>
          
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>GST Number</th>
                <th>Address</th>
                <th>Status</th>
                {canWrite('vendors') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>{vendor.name}</td>
                  <td>{vendor.email}</td>
                  <td>{vendor.phone}</td>
                  <td>{vendor.gstNumber || '-'}</td>
                  <td>{vendor.address || '-'}</td>
                  <td>
                    <span className={`badge ${vendor.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {canWrite('vendors') && (
                    <td>
                      <div className="flex gap-10">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(vendor)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(vendor._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vendors;
