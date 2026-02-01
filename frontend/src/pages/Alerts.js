import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { alertsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, resolved, critical
  
  const { canWrite } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (filter === 'active') params.isResolved = false;
      if (filter === 'resolved') params.isResolved = true;
      if (filter === 'critical') {
        params.severity = 'critical';
        params.isResolved = false;
      }

      const response = await alertsAPI.getAll(params);
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    if (window.confirm('Mark this alert as resolved?')) {
      try {
        await alertsAPI.resolve(id);
        fetchAlerts();
        showNotification('Alert resolved successfully', 'success');
      } catch (error) {
        alert(error.response?.data?.message || 'Error resolving alert');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await alertsAPI.delete(id);
        fetchAlerts();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting alert');
      }
    }
  };

  const getSeverityBadge = (severity) => {
    return severity === 'critical' ? 'badge-danger' : 'badge-warning';
  };

  const getSeverityIcon = (severity) => {
    return severity === 'critical' ? '🔴' : '⚠️';
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

  const activeAlerts = alerts.filter(a => !a.isResolved);
  const criticalAlerts = alerts.filter(a => !a.isResolved && a.severity === 'critical');

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>⚠️ Alerts</h1>
            <p>Monitor and manage inventory alerts</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#856404' }}>
              {activeAlerts.length}
            </div>
            <div style={{ color: '#856404', fontWeight: '500' }}>Active Alerts</div>
          </div>
          <div style={{ padding: '20px', background: '#f8d7da', borderRadius: '8px', border: '1px solid #dc3545' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#721c24' }}>
              {criticalAlerts.length}
            </div>
            <div style={{ color: '#721c24', fontWeight: '500' }}>Critical Alerts</div>
          </div>
          <div style={{ padding: '20px', background: '#d4edda', borderRadius: '8px', border: '1px solid #28a745' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#155724' }}>
              {alerts.filter(a => a.isResolved).length}
            </div>
            <div style={{ color: '#155724', fontWeight: '500' }}>Resolved</div>
          </div>
          <div style={{ padding: '20px', background: '#d1ecf1', borderRadius: '8px', border: '1px solid #17a2b8' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0c5460' }}>
              {alerts.length}
            </div>
            <div style={{ color: '#0c5460', fontWeight: '500' }}>Total Alerts</div>
          </div>
        </div>

        {/* Filters */}
        <div className="content-card">
          <div className="flex gap-10">
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('all')}
            >
              All Alerts
            </button>
            <button
              className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('active')}
            >
              Active Only
            </button>
            <button
              className={`btn ${filter === 'critical' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('critical')}
            >
              Critical Only
            </button>
            <button
              className={`btn ${filter === 'resolved' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('resolved')}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="content-card">
          <h2>
            {filter === 'all' && `All Alerts (${alerts.length})`}
            {filter === 'active' && `Active Alerts (${activeAlerts.length})`}
            {filter === 'critical' && `Critical Alerts (${criticalAlerts.length})`}
            {filter === 'resolved' && `Resolved Alerts (${alerts.filter(a => a.isResolved).length})`}
          </h2>
          
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
              <h3>No alerts found</h3>
              <p>All inventory levels are healthy!</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Item</th>
                  <th>Message</th>
                  <th>Current Stock</th>
                  <th>Min Level</th>
                  <th>Status</th>
                  <th>Created</th>
                  {canWrite('alerts') && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert._id} style={{ background: alert.isResolved ? '#f8f9fa' : 'white' }}>
                    <td>
                      <span className={`badge ${getSeverityBadge(alert.severity)}`}>
                        {getSeverityIcon(alert.severity)} {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <strong>{alert.item?.name || 'N/A'}</strong><br />
                      <small style={{ color: '#6c757d' }}>{alert.item?.sku || 'N/A'}</small>
                    </td>
                    <td>{alert.message}</td>
                    <td style={{ color: alert.item?.currentStock === 0 ? '#dc3545' : '#ffc107', fontWeight: 'bold' }}>
                      {alert.item?.currentStock || 0} {alert.item?.unit || ''}
                    </td>
                    <td>{alert.item?.minStockLevel || 0} {alert.item?.unit || ''}</td>
                    <td>
                      {alert.isResolved ? (
                        <span className="badge badge-success">
                          ✓ Resolved
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          ⚡ Active
                        </span>
                      )}
                    </td>
                    <td>
                      {new Date(alert.createdAt).toLocaleDateString()}<br />
                      <small style={{ color: '#6c757d' }}>
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </small>
                    </td>
                    {canWrite('alerts') && (
                      <td>
                        <div className="flex gap-10">
                          {!alert.isResolved && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleResolve(alert._id)}
                            >
                              Resolve
                            </button>
                          )}
                          {canWrite('alerts') && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(alert._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Info Box */}
        {activeAlerts.length > 0 && (
          <div style={{
            padding: '20px',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Action Required</h3>
            <p style={{ margin: 0, color: '#856404' }}>
              You have {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}.
              {criticalAlerts.length > 0 && ` ${criticalAlerts.length} of them ${criticalAlerts.length !== 1 ? 'are' : 'is'} critical (out of stock).`}
              {' '}Please review and take appropriate action to replenish stock.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
