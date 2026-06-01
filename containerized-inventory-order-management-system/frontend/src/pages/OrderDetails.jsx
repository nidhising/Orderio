import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, updateOrderStatus } from '../api/api';
import Loading from '../components/Loading';
import Message from '../components/Message';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrder = () => {
    setLoading(true);
    getOrder(id)
      .then((res) => setOrder(res.data))
      .catch(() => setError(`Could not load order #${id}.`))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrder(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setError('');
    try {
      await updateOrderStatus(id, newStatus);
      setSuccess(`Order status updated to "${newStatus}".`);
      loadOrder();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading text={`Loading order #${id}…`} />;
  if (!order && error) return (
    <div className="page">
      <Message type="error" message={error} onClose={() => {}} autoDismiss={0} />
      <Link to="/orders" className="btn btn-ghost">← Back to Orders</Link>
    </div>
  );

  const statusClass = (s) =>
    s === 'confirmed' ? 'status-confirmed' : s === 'cancelled' ? 'status-cancelled' : 'status-pending';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Order #{order.id}</h1>
          <p className="page-subtitle">Created on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Link to="/orders" className="btn btn-ghost">← Back to Orders</Link>
      </div>

      <Message type="success" message={success} onClose={() => setSuccess('')} />
      <Message type="error" message={error} onClose={() => setError('')} autoDismiss={0} />

      <div className="order-detail-grid">
        {/* Order Info */}
        <div className="card">
          <h2 className="card-title">Order Information</h2>
          <div className="detail-list">
            <div className="detail-row">
              <span className="detail-label">Order ID</span>
              <span className="detail-value font-medium">#{order.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span className={`status-badge ${statusClass(order.status)}`}>{order.status}</span>
                {order.status === 'pending' && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={updating}
                  >
                    {updating ? 'Updating…' : '✓ Mark as Confirmed'}
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={updating}
                  >
                    {updating ? 'Updating…' : '✕ Mark as Cancelled'}
                  </button>
                )}
              </div>
            </div>
            <div className="detail-row">
              <span className="detail-label">Order Date</span>
              <span className="detail-value">{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total Amount</span>
              <span className="detail-value total-amount">₹{parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="card">
          <h2 className="card-title">Customer Information</h2>
          <div className="detail-list">
            <div className="detail-row">
              <span className="detail-label">Name</span>
              <span className="detail-value font-medium">{order.customer?.full_name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{order.customer?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Phone</span>
              <span className="detail-value">{order.customer?.phone_number || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 className="card-title">Ordered Items</h2>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item, i) => (
                <tr key={item.id}>
                  <td className="text-muted">{i + 1}</td>
                  <td className="font-medium">{item.product?.name}</td>
                  <td><span className="sku-badge">{item.product?.sku}</span></td>
                  <td>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td className="font-medium">₹{parseFloat(item.line_total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="5" className="total-label">Order Total</td>
                <td className="total-amount">₹{parseFloat(order.total_amount).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
