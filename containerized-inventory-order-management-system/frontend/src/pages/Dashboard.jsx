import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary, getOrders } from '../api/api';
import Loading from '../components/Loading';
import Message from '../components/Message';

function HealthRing({ pct }) {
  const r = 48, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <div className="health-ring-wrap">
      <div className="health-ring">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8eaef" strokeWidth="10" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7c6ff7" strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        </svg>
        <div className="health-ring-label">
          <span className="health-ring-pct">{pct}%</span>
          <span className="health-ring-sub">In Stock</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboardSummary(), getOrders()])
      .then(([sumRes, ordRes]) => {
        setSummary(sumRes.data);
        setRecentOrders(ordRes.data.slice(0, 3));
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading dashboard…" />;

  const inStock    = summary ? summary.total_products - summary.low_stock_products.filter(p => p.quantity_in_stock === 0).length - summary.low_stock_products.filter(p => p.quantity_in_stock > 0).length : 0;
  const lowStock   = summary ? summary.low_stock_products.filter(p => p.quantity_in_stock > 0).length : 0;
  const outOfStock = summary ? summary.low_stock_products.filter(p => p.quantity_in_stock === 0).length : 0;
  const healthPct  = summary && summary.total_products > 0
    ? Math.round(((summary.total_products - outOfStock) / summary.total_products) * 100) : 0;

  const statusClass = s =>
    s === 'confirmed' ? 'status-confirmed' : s === 'cancelled' ? 'status-cancelled' : 'status-pending';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your inventory and orders</p>
        </div>
        <div className="welcome-card">
          <p className="welcome-text">
            Welcome back! Here's what's happening with your store today.
          </p>
          <div className="welcome-icon">〜</div>
        </div>
      </div>

      {error && <Message type="error" message={error} onClose={() => setError('')} autoDismiss={0} />}

      {summary && (
        <>
          {/* Stats */}
          <div className="stats-grid">
            <Link to="/products" className="stat-card">
              <div className="stat-icon-wrap purple">📦</div>
              <div>
                <div className="stat-value">{summary.total_products}</div>
                <div className="stat-label">Total Products</div>
                <div className="stat-delta">↑ 0% from yesterday</div>
              </div>
            </Link>
            <Link to="/customers" className="stat-card">
              <div className="stat-icon-wrap blue">👤</div>
              <div>
                <div className="stat-value">{summary.total_customers}</div>
                <div className="stat-label">Total Customers</div>
                <div className="stat-delta">— 0% from yesterday</div>
              </div>
            </Link>
            <Link to="/orders" className="stat-card">
              <div className="stat-icon-wrap green">📋</div>
              <div>
                <div className="stat-value">{summary.total_orders}</div>
                <div className="stat-label">Total Orders</div>
                <div className="stat-delta">↑ 0% from yesterday</div>
              </div>
            </Link>
            <div className="stat-card">
              <div className="stat-icon-wrap orange">⚠️</div>
              <div>
                <div className="stat-value">{summary.low_stock_products.length}</div>
                <div className="stat-label">Low Stock Alerts</div>
                <div className="stat-delta" style={{ color: 'var(--color-orange)' }}>
                  ↑ {summary.low_stock_products.length} from yesterday
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="dashboard-grid">
            {/* Inventory Health */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Inventory Health</span>
              </div>
              <HealthRing pct={healthPct} />
              <div className="health-legend">
                <div className="health-legend-item">
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="health-dot" style={{ background: 'var(--color-green)' }} />
                    In Stock
                  </span>
                  <span>{inStock} items</span>
                </div>
                <div className="health-legend-item">
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="health-dot" style={{ background: 'var(--color-yellow)' }} />
                    Low Stock
                  </span>
                  <span>{lowStock} items</span>
                </div>
                <div className="health-legend-item">
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="health-dot" style={{ background: 'var(--color-red)' }} />
                    Out of Stock
                  </span>
                  <span>{outOfStock} items</span>
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-5)' }}>
                <Link to="/products" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  View all products →
                </Link>
              </div>
            </div>

            {/* Middle: Low Stock + Recent Orders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {/* Low Stock */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">⚠️ Low Stock Products</span>
                  <span className="badge badge-primary">{summary.low_stock_products.length} item{summary.low_stock_products.length !== 1 ? 's' : ''}</span>
                </div>
                {summary.low_stock_products.length === 0 ? (
                  <div className="empty-state" style={{ padding: '1.5rem' }}>
                    <span className="empty-icon">✅</span>
                    <p style={{ fontSize: 'var(--font-size-sm)' }}>All products are sufficiently stocked</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>SKU</th>
                          <th>Stock Remaining</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.low_stock_products.map(p => (
                          <tr key={p.id}>
                            <td className="font-medium">{p.name}</td>
                            <td><span className="sku-badge">{p.sku}</span></td>
                            <td>
                              <span className={p.quantity_in_stock === 0 ? 'stock-badge out' : 'stock-badge low'}>
                                {p.quantity_in_stock}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${p.quantity_in_stock === 0 ? 'status-cancelled' : 'status-pending'}`}>
                                {p.quantity_in_stock === 0 ? 'Out of Stock' : 'Low Stock'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">🛒 Recent Orders</span>
                  <Link to="/orders" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="empty-state" style={{ padding: '1.5rem' }}>
                    <span className="empty-icon">🛒</span>
                    <p style={{ fontSize: 'var(--font-size-sm)' }}>No recent orders</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Your latest orders will appear here.</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((o, i) => (
                          <tr key={o.id}>
                            <td className="font-medium">#{recentOrders.length - i}</td>
                            <td>{o.customer?.full_name}</td>
                            <td>${parseFloat(o.total_amount).toFixed(2)}</td>
                            <td><span className={`status-badge ${statusClass(o.status)}`}>{o.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">⚡ Quick Actions</span>
              </div>
              <div className="quick-actions" style={{ flexDirection: 'column' }}>
                <Link to="/products" className="quick-action-btn" style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 'var(--space-3)' }}
                  onClick={() => setTimeout(() => document.querySelector('.btn-primary')?.click(), 100)}>
                  <div className="quick-action-icon" style={{ background: 'var(--color-primary-light)' }}>➕</div>
                  <span>Add Product</span>
                </Link>
                <Link to="/customers" className="quick-action-btn" style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 'var(--space-3)' }}>
                  <div className="quick-action-icon" style={{ background: 'var(--color-blue-light)' }}>👤</div>
                  <span>Add Customer</span>
                </Link>
                <Link to="/orders" className="quick-action-btn" style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 'var(--space-3)' }}>
                  <div className="quick-action-icon" style={{ background: 'var(--color-green-light)' }}>🛒</div>
                  <span>Create Order</span>
                </Link>
              </div>

              {/* Tip */}
              <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.2rem' }}>🌟</span>
                <div>
                  <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 2 }}>You're all set! 🎉</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Keep your inventory updated to maintain accurate stock levels.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
