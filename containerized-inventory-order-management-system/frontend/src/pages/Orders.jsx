import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, getCustomers, getProducts, createOrder, deleteOrder, updateOrderStatus } from '../api/api';
import Loading from '../components/Loading';
import Message from '../components/Message';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [validationErrors, setValidationErrors] = useState({});

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([ordRes, custRes, prodRes]) => {
        setOrders(ordRes.data);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      })
      .catch(() => setError('Failed to load data. Is the backend running?'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const addItem = () => setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  const removeItem = (index) => setOrderItems(orderItems.filter((_, i) => i !== index));
  const updateItem = (index, field, value) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const validate = () => {
    const errs = {};
    if (!selectedCustomer) errs.customer = 'Please select a customer';
    const itemErrors = [];
    const usedProducts = new Set();
    orderItems.forEach((item, i) => {
      const e = {};
      if (!item.product_id) { e.product_id = 'Select a product'; }
      else if (usedProducts.has(item.product_id)) { e.product_id = 'Duplicate product — combine quantities instead'; }
      else { usedProducts.add(item.product_id); }
      const qty = parseInt(item.quantity, 10);
      if (!item.quantity || isNaN(qty) || qty <= 0) e.quantity = 'Quantity must be > 0';
      itemErrors.push(e);
    });
    if (itemErrors.some((e) => Object.keys(e).length > 0)) errs.items = itemErrors;
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      await createOrder({
        customer_id: parseInt(selectedCustomer),
        items: orderItems.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
        })),
      });
      setSuccess('Order created successfully!');
      setSelectedCustomer('');
      setOrderItems([{ product_id: '', quantity: 1 }]);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this order? Product stock will be restored.')) return;
    try {
      await deleteOrder(id);
      setSuccess('Order cancelled and stock restored.');
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel order.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      setSuccess(`Order status updated to "${newStatus}".`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update order status.');
    }
  };

  const statusClass = (s) =>
    s === 'confirmed' ? 'status-confirmed' : s === 'cancelled' ? 'status-cancelled' : 'status-pending';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Create and manage customer orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Order</button>
      </div>

      <Message type="success" message={success} onClose={() => setSuccess('')} />
      <Message type="error" message={error} onClose={() => setError('')} autoDismiss={0} />

      {showForm && (
        <div className="card form-card">
          <h2 className="card-title">Create New Order</h2>
          <form onSubmit={handleSubmit} noValidate>
            {/* Customer */}
            <div className="form-group">
              <label className="form-label" htmlFor="order-customer">Customer *</label>
              <select
                id="order-customer"
                className={`form-input ${validationErrors.customer ? 'input-error' : ''}`}
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">— Select a customer —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                ))}
              </select>
              {validationErrors.customer && <span className="field-error">{validationErrors.customer}</span>}
            </div>

            {/* Order Items */}
            <div className="form-group">
              <label className="form-label">Order Items *</label>
              <div className="order-items-list">
                {orderItems.map((item, index) => {
                  const selectedProduct = products.find((p) => p.id === parseInt(item.product_id));
                  const itemErr = validationErrors.items?.[index] || {};
                  return (
                    <div key={index} className="order-item-row">
                      <div className="order-item-fields">
                        <div className="form-group flex-1">
                          <select
                            className={`form-input ${itemErr.product_id ? 'input-error' : ''}`}
                            value={item.product_id}
                            onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                          >
                            <option value="">— Select product —</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (Stock: {p.quantity_in_stock}) — ₹{parseFloat(p.price).toFixed(2)}
                              </option>
                            ))}
                          </select>
                          {itemErr.product_id && <span className="field-error">{itemErr.product_id}</span>}
                        </div>
                        <div className="form-group qty-field">
                          <input
                            className={`form-input ${itemErr.quantity ? 'input-error' : ''}`}
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          />
                          {itemErr.quantity && <span className="field-error">{itemErr.quantity}</span>}
                        </div>
                        {selectedProduct && (
                          <div className="item-subtotal">
                            ₹{(parseFloat(selectedProduct.price) * parseInt(item.quantity || 0)).toFixed(2)}
                          </div>
                        )}
                        {orderItems.length > 1 && (
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(index)}>✕</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>+ Add Item</button>
            </div>

            {/* Estimated total */}
            <div className="order-total-preview">
              Estimated Total: <strong>
                ₹{orderItems.reduce((sum, item) => {
                  const p = products.find((p) => p.id === parseInt(item.product_id));
                  return sum + (p ? parseFloat(p.price) * parseInt(item.quantity || 0) : 0);
                }, 0).toFixed(2)}
              </strong>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Placing Order…' : 'Place Order'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Loading text="Loading orders…" />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>No orders yet. Create your first order above.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, index) => (
                <tr key={o.id}>
                  {/* Sequential display number: newest = #1 (list is sorted desc by date) */}
                  <td className="font-medium">#{orders.length - index}</td>
                  <td>{o.customer?.full_name}</td>
                  <td className="font-medium">₹{parseFloat(o.total_amount).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${statusClass(o.status)}`}>{o.status}</span>
                  </td>
                  <td className="text-muted">{new Date(o.created_at).toLocaleString()}</td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/orders/${o.id}`} className="btn btn-sm btn-secondary">Details</Link>
                      {o.status === 'pending' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleStatusChange(o.id, 'confirmed')}
                          title="Mark as Confirmed"
                        >
                          ✓ Confirm
                        </button>
                      )}
                      {o.status !== 'cancelled' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(o.id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
