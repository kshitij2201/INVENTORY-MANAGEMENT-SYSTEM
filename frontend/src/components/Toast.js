import React, { useEffect } from 'react';

const Toast = ({ message, severity, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'low':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default:
        return '⚠️';
    }
  };

  const getColor = () => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'low':
        return '#f59e0b';
      case 'success':
        return '#10b981';
      case 'info':
        return '#3b82f6';
      default:
        return '#f59e0b';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        minWidth: '300px',
        maxWidth: '400px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '16px',
        zIndex: 10000,
        borderLeft: `4px solid ${getColor()}`,
        animation: 'slideIn 0.3s ease-out',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <span style={{ fontSize: '20px', flexShrink: 0 }}>{getIcon()}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px', fontSize: '14px' }}>
          {severity === 'critical' ? 'Critical Alert' : severity === 'low' ? 'Low Stock Alert' : 'Notification'}
        </div>
        <div style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>
          {message}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '0',
          lineHeight: '1',
          flexShrink: 0,
        }}
      >
        ×
      </button>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;
