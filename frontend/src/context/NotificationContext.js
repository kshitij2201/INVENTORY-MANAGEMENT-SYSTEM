import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Toast from '../components/Toast';
import { alertsAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [lastChecked, setLastChecked] = useState(Date.now());

  const showNotification = useCallback((message, severity = 'info') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, severity }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  // Check for new alerts every 30 seconds
  useEffect(() => {
    // Only check for alerts if user is logged in (token exists)
    const token = localStorage.getItem('token');
    if (!token) {
      return; // Don't set up polling if not authenticated
    }

    const checkForNewAlerts = async () => {
      try {
        const response = await alertsAPI.getAll({ isResolved: false });
        const activeAlerts = response.data.data;

        // Filter alerts created after last check
        const newAlerts = activeAlerts.filter(
          (alert) => new Date(alert.createdAt) > new Date(lastChecked)
        );

        // Show notification for each new alert
        newAlerts.forEach((alert) => {
          showNotification(alert.message, alert.severity);
        });

        setLastChecked(Date.now());
      } catch (error) {
        // Only log error if it's not a 401 (unauthorized)
        if (error.response?.status !== 401) {
          console.error('Error checking for new alerts:', error);
        }
      }
    };

    // Initial check after 5 seconds
    const initialTimer = setTimeout(checkForNewAlerts, 5000);

    // Then check every 30 seconds
    const interval = setInterval(checkForNewAlerts, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [lastChecked, showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000 }}>
        {notifications.map((notification, index) => (
          <div key={notification.id} style={{ marginBottom: index > 0 ? '10px' : '0' }}>
            <Toast
              message={notification.message}
              severity={notification.severity}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
