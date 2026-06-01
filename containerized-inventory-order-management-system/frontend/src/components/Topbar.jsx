import { useState, useEffect, useRef } from 'react';
import { getDashboardSummary } from '../api/api';

export default function Topbar() {
  const [open, setOpen]     = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [read, setRead]     = useState(false);   // true once the dropdown has been opened
  const ref = useRef(null);

  useEffect(() => {
    getDashboardSummary()
      .then(res => setAlerts(res.data.low_stock_products))
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = () => {
    setOpen(o => !o);
    setRead(true);   // mark as read when user opens the panel
  };

  const unread = !read && alerts.length > 0;

  return (
    <header className="topbar">
      <div className="topbar-right" ref={ref}>
        <button
          className="topbar-bell"
          onClick={handleBellClick}
          title="Notifications"
        >
          🔔
          {unread && (
            <span className="notif-badge">{alerts.length}</span>
          )}
        </button>

        {open && (
          <div className="notif-dropdown">
            <div className="notif-header">
              <span className="notif-title">Notifications</span>
              {alerts.length > 0 && (
                <span className="badge badge-primary">{alerts.length} alert{alerts.length > 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="notif-list">
              {alerts.length === 0 ? (
                <div className="notif-empty">
                  <span>✅</span>
                  <p>All products are stocked!</p>
                </div>
              ) : (
                alerts.map(p => (
                  <div key={p.id} className="notif-item">
                    <div className="notif-item-icon">
                      {p.quantity_in_stock === 0 ? '🔴' : '🟡'}
                    </div>
                    <div className="notif-item-body">
                      <p className="notif-item-title">{p.name}</p>
                      <p className="notif-item-sub">
                        {p.quantity_in_stock === 0
                          ? 'Out of stock'
                          : `Only ${p.quantity_in_stock} left in stock`}
                        {' · '}<span className="notif-sku">{p.sku}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {alerts.length > 0 && (
              <div className="notif-footer">
                <span>Go to <a href="/products" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Products</a> to restock</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
