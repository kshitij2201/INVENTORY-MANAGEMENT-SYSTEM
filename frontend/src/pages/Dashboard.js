import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { dashboardAPI, alertsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activitiesRes, chartRes, alertsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivities({ limit: 5 }),
        dashboardAPI.getChartData({ days: 7 }),
        alertsAPI.getAll({ isResolved: false }),
      ]);

      setStats(statsRes.data.data);
      setActivities(activitiesRes.data.data);
      setChartData(chartRes.data.data);
      setAlerts(alertsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
          <h1>Dashboard</h1>
          <p>Overview of your inventory system</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Items</h3>
            <div className="stat-value">{stats?.inventory?.totalItems || 0}</div>
          </div>
          
          <div className="stat-card">
            <h3>Low Stock Items</h3>
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {stats?.inventory?.lowStockItems || 0}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Out of Stock</h3>
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {stats?.inventory?.outOfStockItems || 0}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Active Alerts</h3>
            <div className="stat-value" style={{ color: '#ef4444' }}>
              {stats?.alerts?.activeAlerts || 0}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Stock Value</h3>
            <div className="stat-value" style={{ color: '#10b981' }}>
              ${stats?.inventory?.totalStockValue || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
              Total inventory worth
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Monthly Purchases</h3>
            <div className="stat-value">{stats?.purchases?.count || 0}</div>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
              Total: ${stats?.purchases?.totalAmount?.toFixed(2) || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '2px' }}>
              Paid: ${stats?.purchases?.paidAmount?.toFixed(2) || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
              Pending: ${stats?.purchases?.pendingAmount?.toFixed(2) || 0}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Monthly Sales</h3>
            <div className="stat-value">{stats?.sales?.count || 0}</div>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>
              Total: ${stats?.sales?.totalAmount?.toFixed(2) || 0}
            </div>
            {stats?.sales?.returnedAmount > 0 && (
              <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '2px' }}>
                Returned: ${stats?.sales?.returnedAmount?.toFixed(2) || 0}
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '2px' }}>
              Received: ${stats?.sales?.paidAmount?.toFixed(2) || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
              Pending: ${stats?.sales?.pendingAmount?.toFixed(2) || 0}
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="content-card">
            <h2 style={{ marginBottom: '15px' }}>⚠️ Active Alerts</h2>
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert._id}
                className={`alert ${alert.severity === 'critical' ? 'alert-error' : 'alert-warning'}`}
                style={{ marginBottom: '10px' }}
              >
                <strong>{alert.item?.name}:</strong> {alert.message}
              </div>
            ))}
          </div>
        )}

        {chartData && (
          <div className="content-card">
            <h2 style={{ marginBottom: '20px' }}>Sales & Purchase Trends (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#10b981" name="Sales" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="content-card">
          <h2 style={{ marginBottom: '15px' }}>Recent Stock Movements</h2>
          {activities.length === 0 ? (
            <p>No recent activities</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Movement</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity._id}>
                    <td>{activity.item?.name}</td>
                    <td>
                      <span className={`badge badge-${
                        activity.refType === 'PURCHASE' ? 'success' :
                        activity.refType === 'SALE' ? 'info' :
                        'warning'
                      }`}>
                        {activity.refType}
                      </span>
                    </td>
                    <td>{activity.quantity}</td>
                    <td>
                      <span className={`badge ${
                        activity.movementType === 'IN' ? 'badge-success' : 'badge-danger'
                      }`}>
                        {activity.movementType}
                      </span>
                    </td>
                    <td>{new Date(activity.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
