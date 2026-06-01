import { useEffect, useState } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../api/api';
import Loading from '../components/Loading';
import Message from '../components/Message';

const EMPTY_FORM = { full_name: '', email: '', phone_number: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const fetchCustomers = () => {
    setLoading(true);
    getCustomers()
      .then((res) => setCustomers(res.data))
      .catch(() => setError('Failed to load customers.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      await createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone_number: form.phone_number.trim() || null,
      });
      setSuccess('Customer added successfully!');
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create customer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"? All their orders will also be deleted.`)) return;
    try {
      await deleteCustomer(id);
      setSuccess(`Customer "${name}" deleted.`);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete customer.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customer records</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setForm(EMPTY_FORM); setValidationErrors({}); }}>
          + Add Customer
        </button>
      </div>

      <Message type="success" message={success} onClose={() => setSuccess('')} />
      <Message type="error" message={error} onClose={() => setError('')} autoDismiss={0} />

      {showForm && (
        <div className="card form-card">
          <h2 className="card-title">Add New Customer</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="cust-name">Full Name *</label>
                <input
                  id="cust-name"
                  className={`form-input ${validationErrors.full_name ? 'input-error' : ''}`}
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
                {validationErrors.full_name && <span className="field-error">{validationErrors.full_name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cust-email">Email Address *</label>
                <input
                  id="cust-email"
                  className={`form-input ${validationErrors.email ? 'input-error' : ''}`}
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {validationErrors.email && <span className="field-error">{validationErrors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cust-phone">Phone Number (optional)</label>
                <input
                  id="cust-phone"
                  className="form-input"
                  type="tel"
                  placeholder="+1 555 000 1234"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Add Customer'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Loading text="Loading customers…" />
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <p>No customers yet. Add your first customer above.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone_number || <span className="text-muted">—</span>}</td>
                  <td className="text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id, c.full_name)}>
                      Delete
                    </button>
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
