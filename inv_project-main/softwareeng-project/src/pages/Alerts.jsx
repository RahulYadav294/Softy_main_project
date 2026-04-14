import React, { useState, useEffect } from 'react';
import { AlertCircle, Bell } from 'lucide-react';
import api from '../api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data);
    } catch (e) {}
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Alerts & Notifications</h1>
          <p>System generated warnings about stock levels and operations</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {alerts.map(alert => (
            <div key={alert.alert_id} style={{ 
              display: 'flex', gap: '1.25rem', alignItems: 'flex-start', 
              padding: '1.5rem', background: '#FFFFFF', 
              borderRadius: '10px', border: '1px solid #E5E7EB',
              borderLeft: '4px solid var(--accent-danger)' 
            }}>
              <div style={{ color: 'var(--accent-danger)', paddingTop: '0.1rem' }}>
                <AlertCircle size={22} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                  {alert.message}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Product: <span style={{fontWeight: 500, color: 'var(--text-primary)'}}>{alert.product_name}</span>
                </p>
                <p style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>
                  Generated on {new Date(alert.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
              <Bell size={40} style={{ opacity: 0.3, marginBottom: '1.25rem', margin: '0 auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No alerts right now</h3>
              <p style={{ fontSize: '0.95rem' }}>Everything is running smoothly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
