import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { stockMovementsAPI, itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    item: '',
    refType: '',
    movementType: '',
  });

  useEffect(() => {
    fetchMovements();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMovements = async () => {
    try {
      const params = {};
      if (filters.item) params.item = filters.item;
      if (filters.refType) params.refType = filters.refType;
      if (filters.movementType) params.movementType = filters.movementType;

      const response = await stockMovementsAPI.getAll(params);
      setMovements(response.data.data);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    } finally {
      setLoading(false);
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

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const applyFilters = () => {
    setLoading(true);
    fetchMovements();
  };

  const clearFilters = () => {
    setFilters({
      item: '',
      refType: '',
      movementType: '',
    });
    setLoading(true);
    setTimeout(() => {
      fetchMovements();
    }, 100);
  };

  const getMovementBadge = (type) => {
    return type === 'IN' ? 'badge-success' : 'badge-danger';
  };

  const getRefTypeBadge = (type) => {
    const badges = {
      PURCHASE: 'badge-info',
      SALE: 'badge-primary',
      RETURN: 'badge-warning',
      ADJUSTMENT: 'badge-secondary',
    };
    return badges[type] || 'badge-secondary';
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
          <div>
            <h1>📈 Stock Movements</h1>
            <p>Complete audit trail of all stock changes</p>
          </div>
        </div>

        <div className="content-card">
          <h2>Filters</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '15px', alignItems: 'end' }}>
            <div className="form-group">
              <label className="form-label">Item</label>
              <select
                className="form-select"
                value={filters.item}
                onChange={(e) => handleFilterChange('item', e.target.value)}
              >
                <option value="">All Items</option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reference Type</label>
              <select
                className="form-select"
                value={filters.refType}
                onChange={(e) => handleFilterChange('refType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="PURCHASE">Purchase</option>
                <option value="SALE">Sale</option>
                <option value="RETURN">Return</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Movement Type</label>
              <select
                className="form-select"
                value={filters.movementType}
                onChange={(e) => handleFilterChange('movementType', e.target.value)}
              >
                <option value="">All Movements</option>
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
              </select>
            </div>

            <button className="btn btn-primary" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>

        <div className="content-card">
          <h2>Stock Movement History ({movements.length} records)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Item</th>
                  <th>Movement</th>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Quantity</th>
                  <th>Before</th>
                  <th>After</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                      No stock movements found
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement._id}>
                      <td>
                        {new Date(movement.createdAt).toLocaleDateString()}<br />
                        <small style={{ color: '#6c757d' }}>
                          {new Date(movement.createdAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <strong>{movement.item?.name || 'N/A'}</strong><br />
                        <small style={{ color: '#6c757d' }}>{movement.item?.sku || 'N/A'}</small>
                      </td>
                      <td>
                        <span className={`badge ${getMovementBadge(movement.movementType)}`}>
                          {movement.movementType === 'IN' ? '↑ IN' : '↓ OUT'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getRefTypeBadge(movement.refType)}`}>
                          {movement.refType}
                        </span>
                      </td>
                      <td>{movement.refNumber || '-'}</td>
                      <td style={{ fontWeight: 'bold' }}>
                        {movement.movementType === 'IN' ? '+' : '-'}
                        {movement.quantity} {movement.item?.unit || ''}
                      </td>
                      <td>{movement.beforeStock} {movement.item?.unit || ''}</td>
                      <td style={{ fontWeight: 'bold', color: movement.movementType === 'IN' ? '#28a745' : '#dc3545' }}>
                        {movement.afterStock} {movement.item?.unit || ''}
                      </td>
                      <td>{movement.createdBy?.name || 'System'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="content-card">
          <h2>Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {movements.filter(m => m.movementType === 'IN').length}
              </div>
              <div style={{ color: '#6c757d' }}>Stock In Movements</div>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {movements.filter(m => m.movementType === 'OUT').length}
              </div>
              <div style={{ color: '#6c757d' }}>Stock Out Movements</div>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {movements.filter(m => m.refType === 'PURCHASE').length}
              </div>
              <div style={{ color: '#6c757d' }}>Purchase Transactions</div>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {movements.filter(m => m.refType === 'SALE').length}
              </div>
              <div style={{ color: '#6c757d' }}>Sales Transactions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMovements;
