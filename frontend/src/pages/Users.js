import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    permissions: {
      items: { read: true, write: false },
      vendors: { read: true, write: false },
      purchaseOrders: { read: false, write: false },
      purchaseBills: { read: false, write: false },
      salesOrders: { read: true, write: true },
      salesInvoices: { read: false, write: false },
      salesReturns: { read: false, write: false },
      stockMovements: { read: true, write: false },
      alerts: { read: true, write: false },
    },
  });
  
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register(formData);
      setShowForm(false);
      resetForm();
      fetchUsers();
      alert('User created successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser.id) {
      alert('You cannot change your own role!');
      return;
    }
    
    if (window.confirm(`Change user role to ${newRole}?`)) {
      try {
        await authAPI.updateUserRole(userId, { role: newRole });
        fetchUsers();
        alert('User role updated successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Error updating user role');
      }
    }
  };

  const handleDeactivate = async (userId) => {
    if (userId === currentUser.id) {
      alert('You cannot deactivate your own account!');
      return;
    }
    
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await authAPI.deactivateUser(userId);
        fetchUsers();
        alert('User deactivated successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Error deactivating user');
      }
    }
  };

  const handleEditPermissions = (user) => {
    console.log('User object:', user);
    console.log('User featurePermissions:', user.featurePermissions);
    
    setEditingUser(user);
    
    // Convert featurePermissions (which might be a Map or Object) to the format we need
    let userPermissions = rolePermissions[user.role] || rolePermissions.staff;
    
    // Check if featurePermissions exists and is not empty
    if (user.featurePermissions && Object.keys(user.featurePermissions).length > 0) {
      // If featurePermissions exists and has data, use it
      userPermissions = {};
      features.forEach(feature => {
        if (user.featurePermissions[feature.key]) {
          userPermissions[feature.key] = {
            read: user.featurePermissions[feature.key].read || false,
            write: user.featurePermissions[feature.key].write || false,
          };
        } else {
          userPermissions[feature.key] = { read: false, write: false };
        }
      });
    }
    // Otherwise use role-based defaults (already set above)
    
    console.log('Final permissions to set:', userPermissions);
    
    setFormData({
      ...formData,
      permissions: userPermissions,
    });
    setShowPermissionsModal(true);
  };

  const handleUpdatePermissions = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateUserPermissions(editingUser._id, { permissions: formData.permissions });
      setShowPermissionsModal(false);
      setEditingUser(null);
      fetchUsers();
      alert('Permissions updated successfully! User needs to log out and log back in for changes to take effect.');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating permissions');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      permissions: {
        items: { read: true, write: false },
        vendors: { read: true, write: false },
        purchaseOrders: { read: false, write: false },
        purchaseBills: { read: false, write: false },
        salesOrders: { read: true, write: true },
        salesInvoices: { read: false, write: false },
        salesReturns: { read: false, write: false },
        stockMovements: { read: true, write: false },
        alerts: { read: true, write: false },
      },
    });
  };

  const handlePermissionChange = (feature, type) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [feature]: {
          ...formData.permissions[feature],
          [type]: !formData.permissions[feature][type],
        },
      },
    });
  };

  // Role-based permission presets based on RBAC table
  const rolePermissions = {
    admin: {
      items: { read: true, write: true },
      vendors: { read: true, write: true },
      purchaseOrders: { read: true, write: true },
      purchaseBills: { read: true, write: true },
      salesOrders: { read: true, write: true },
      salesInvoices: { read: true, write: true },
      salesReturns: { read: true, write: true },
      stockMovements: { read: true, write: true },
      alerts: { read: true, write: true },
    },
    staff: {
      items: { read: true, write: false },
      vendors: { read: true, write: false },
      purchaseOrders: { read: true, write: true },
      purchaseBills: { read: false, write: false },
      salesOrders: { read: true, write: true },
      salesInvoices: { read: false, write: false },
      salesReturns: { read: false, write: false },
      stockMovements: { read: true, write: false },
      alerts: { read: true, write: false },
    },
    inventory_manager: {
      items: { read: true, write: false },
      vendors: { read: true, write: false },
      purchaseOrders: { read: true, write: false },
      purchaseBills: { read: true, write: true },
      salesOrders: { read: true, write: false },
      salesInvoices: { read: false, write: false },
      salesReturns: { read: false, write: false },
      stockMovements: { read: true, write: true },
      alerts: { read: true, write: true },
    },
    sales_manager: {
      items: { read: true, write: false },
      vendors: { read: false, write: false },
      purchaseOrders: { read: false, write: false },
      purchaseBills: { read: false, write: false },
      salesOrders: { read: true, write: true },
      salesInvoices: { read: true, write: true },
      salesReturns: { read: true, write: true },
      stockMovements: { read: true, write: false },
      alerts: { read: false, write: false },
    },
  };

  const handleRoleChangeInForm = (newRole) => {
    setFormData({
      ...formData,
      role: newRole,
      permissions: rolePermissions[newRole] || rolePermissions.staff,
    });
  };

  const features = [
    { key: 'items', label: ' Items', section: 'general' },
    { key: 'vendors', label: ' Vendors', section: 'general' },
    { key: 'purchaseOrders', label: ' Purchase Orders', section: 'purchase' },
    { key: 'purchaseBills', label: ' Purchase Bills', section: 'purchase' },
    { key: 'salesOrders', label: ' Sales Orders', section: 'sales' },
    { key: 'salesInvoices', label: ' Sales Invoices', section: 'sales' },
    { key: 'salesReturns', label: ' Sales Returns', section: 'sales' },
    { key: 'stockMovements', label: ' Stock Movements', section: 'inventory' },
    { key: 'alerts', label: ' Alerts', section: 'inventory' },
  ];

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-danger',
      staff: 'badge-primary',
      inventory_manager: 'badge-warning',
      sales_manager: 'badge-success',
    };
    return badges[role] || 'badge-secondary';
  };

  const formatRole = (role) => {
    return role.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
              <h1>👥 User Management</h1>
              <p>Manage system users and their roles</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowForm(true);
                resetForm();
              }}
            >
              + Add New User
            </button>
          </div>
        </div>

        {showForm && (
          <div className="content-card">
            <h2>Create New User</h2>
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
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => handleRoleChangeInForm(e.target.value)}
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="inventory_manager">Inventory Manager</option>
                    <option value="sales_manager">Sales Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <small style={{ display: 'block', marginTop: '5px', color: '#64748b', fontSize: '12px' }}>
                    Permissions will be auto-populated based on role, but you can customize them below
                  </small>
                </div>
              </div>

              <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                  Feature Permissions
                </h3>
                <div style={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  padding: '20px',
                  backgroundColor: '#f8fafc'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ textAlign: 'left', padding: '10px', fontWeight: '600' }}>Feature</th>
                        <th style={{ textAlign: 'center', padding: '10px', fontWeight: '600' }}>View</th>
                        <th style={{ textAlign: 'center', padding: '10px', fontWeight: '600' }}>Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature) => (
                        <tr key={feature.key} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px', fontSize: '14px' }}>
                            {feature.label}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px' }}>
                            <input
                              type="checkbox"
                              checked={formData.permissions[feature.key]?.read || false}
                              onChange={() => handlePermissionChange(feature.key, 'read')}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px' }}>
                            <input
                              type="checkbox"
                              checked={formData.permissions[feature.key]?.write || false}
                              onChange={() => handlePermissionChange(feature.key, 'write')}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '15px', fontSize: '13px', color: '#64748b', padding: '10px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    💡 <strong>Tip:</strong> Check "View" to allow read access, check "Edit" to allow create/update/delete access
                  </div>
                </div>
              </div>

              <div className="flex gap-10 mt-20">
                <button type="submit" className="btn btn-primary">
                  Create User
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
          <h2>All Users ({users.length})</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    {user.name}
                    {user._id === currentUser.id && (
                      <span style={{ marginLeft: '8px', color: '#3b82f6', fontSize: '12px' }}>
                        (You)
                      </span>
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${getRoleBadge(user.role)}`}>
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-10">
                      {user._id !== currentUser.id && user.isActive && (
                        <>
                          <select
                            className="form-select"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            style={{ padding: '4px 8px', fontSize: '14px' }}
                          >
                            <option value="staff">Staff</option>
                            <option value="inventory_manager">Inventory Manager</option>
                            <option value="sales_manager">Sales Manager</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEditPermissions(user)}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            ✏️ Edit Permissions
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeactivate(user._id)}
                          >
                            Deactivate
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Permissions Modal */}
        {showPermissionsModal && editingUser && (
          <div className="modal-overlay" onClick={() => setShowPermissionsModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
              <div className="modal-header">
                <h2>Edit Permissions - {editingUser.name}</h2>
                <button className="modal-close" onClick={() => setShowPermissionsModal(false)}>×</button>
              </div>
              <form onSubmit={handleUpdatePermissions}>
                <div className="modal-body">
                  <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <strong>Current Role:</strong> {formatRole(editingUser.role)}
                  </div>
                  
                  <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>Feature Permissions</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                        <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Feature</th>
                        <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>View</th>
                        <th style={{ textAlign: 'center', padding: '12px', fontWeight: '600' }}>Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((feature) => (
                        <tr key={feature.key} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px', fontSize: '14px' }}>
                            {feature.label}
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px' }}>
                            <input
                              type="checkbox"
                              checked={formData.permissions[feature.key]?.read || false}
                              onChange={() => handlePermissionChange(feature.key, 'read')}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px' }}>
                            <input
                              type="checkbox"
                              checked={formData.permissions[feature.key]?.write || false}
                              onChange={() => handlePermissionChange(feature.key, 'write')}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '15px', fontSize: '13px', color: '#64748b', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffc107' }}>
                    💡 <strong>Tip:</strong> Check "View" to allow read access, check "Edit" to allow create/update/delete access. User needs to log out and log back in for changes to take effect.
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Update Permissions
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPermissionsModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
