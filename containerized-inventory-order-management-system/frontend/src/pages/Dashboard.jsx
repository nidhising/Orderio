import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../api/api';
import Loading from '../components/Loading';
import Message from '../components/Message';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardSummary()
      .then((res) => setSummary(res.data))
      .catch(() => setError('Failed to load dashboard data. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Loading dashboard…" />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your inventory and orders</p>
      </div>

      {error && <Message type="error" message={error} onClose={() => setError('')} autoDismiss={0} />}

      {summary && (
        <>
          <div className="stats-grid">
            <Link to="/products" className="stat-card stat-blue">
              <div className="stat-icon">🗃️</div>
              <div className="stat-content">
                <div className="stat-value">{summary.total_products}</div>
                <div className="stat-label">Total Products</div>
              </div>
            </Link>
            <Link to="/customers" className="stat-card stat-purple">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{summary.total_customers}</div>
                <div className="stat-label">Total Customers</div>
              </div>
            </Link>
            <Link to="/orders" className="stat-card stat-green">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-value">{summary.total_orders}</div>
                <div className="stat-label">Total Orders</div>
              </div>
            </Link>
            <div className="stat-card stat-orange">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <div className="stat-value">{summary.low_stock_products.length}</div>
                <div className="stat-label">Low Stock Alerts</div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2 className="section-title">⚠️ Low Stock Products</h2>
              <span className="badge badge-warning">{summary.low_stock_products.length} items</span>
            </div>

            {summary.low_stock_products.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <p>All products are sufficiently stocked</p>
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
                    {summary.low_stock_products.map((p) => (
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
        </>
      )}
    </div>
  );
}
