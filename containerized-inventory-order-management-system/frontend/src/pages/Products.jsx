import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/api';
import Loading from '../components/Loading';
import Message from '../components/Message';

const EMPTY_FORM = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    getProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (form.price === '' || isNaN(Number(form.price))) errs.price = 'Valid price is required';
    else if (Number(form.price) < 0) errs.price = 'Price cannot be negative';
    if (form.quantity_in_stock === '' || isNaN(Number(form.quantity_in_stock))) errs.quantity_in_stock = 'Valid quantity is required';
    else if (Number(form.quantity_in_stock) < 0) errs.quantity_in_stock = 'Quantity cannot be negative';
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: parseFloat(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock, 10),
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        setSuccess('Product updated successfully!');
      } else {
        await createProduct(payload);
        setSuccess('Product created successfully!');
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setEditingId(product.id);
    setValidationErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      setSuccess(`Product "${name}" deleted.`);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete product.');
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setValidationErrors({});
    setShowForm(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog and inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => { handleCancel(); setShowForm(true); }}>
          + Add Product
        </button>
      </div>

      <Message type="success" message={success} onClose={() => setSuccess('')} />
      <Message type="error" message={error} onClose={() => setError('')} autoDismiss={0} />

      {showForm && (
        <div className="card form-card">
          <h2 className="card-title">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="product-name">Product Name *</label>
                <input
                  id="product-name"
                  className={`form-input ${validationErrors.name ? 'input-error' : ''}`}
                  type="text"
                  placeholder="e.g. Wireless Mouse"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {validationErrors.name && <span className="field-error">{validationErrors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="product-sku">SKU *</label>
                <input
                  id="product-sku"
                  className={`form-input ${validationErrors.sku ? 'input-error' : ''}`}
                  type="text"
                  placeholder="e.g. WM-001"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
                {validationErrors.sku && <span className="field-error">{validationErrors.sku}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="product-price">Price ($) *</label>
                <input
                  id="product-price"
                  className={`form-input ${validationErrors.price ? 'input-error' : ''}`}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                {validationErrors.price && <span className="field-error">{validationErrors.price}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="product-qty">Quantity in Stock *</label>
                <input
                  id="product-qty"
                  className={`form-input ${validationErrors.quantity_in_stock ? 'input-error' : ''}`}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.quantity_in_stock}
                  onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
                />
                {validationErrors.quantity_in_stock && <span className="field-error">{validationErrors.quantity_in_stock}</span>}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : editingId ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Loading text="Loading products…" />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🗃️</span>
          <p>No products yet. Add your first product above.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.name}</td>
                  <td><span className="sku-badge">{p.sku}</span></td>
                  <td className="font-medium">${parseFloat(p.price).toFixed(2)}</td>
                  <td>
                    <span className={
                      p.quantity_in_stock === 0 ? 'stock-badge out'
                      : p.quantity_in_stock <= 5 ? 'stock-badge low'
                      : 'stock-badge ok'
                    }>
                      {p.quantity_in_stock}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
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
