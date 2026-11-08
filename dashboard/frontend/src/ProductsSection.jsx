import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function ProductsSection() {
  const { accessToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price_cents: '',
    material: '',
    sizes: '',
    colors: '',
    in_stock: true,
    is_returnable: true,
    return_window_days: 7,
    description: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchProducts();
    }
  }, [accessToken]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openForm = (product = null) => {
    if (product) {
      setEditingId(product.product_id);
      setFormData({
        name: product.name || '',
        price_cents: product.price_cents ? (product.price_cents / 100).toString() : '',
        material: product.material || '',
        sizes: product.sizes ? product.sizes.join(', ') : '',
        colors: product.colors ? product.colors.join(', ') : '',
        in_stock: product.in_stock ?? true,
        is_returnable: product.is_returnable ?? true,
        return_window_days: product.return_window_days ?? 7,
        description: product.description || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        price_cents: '',
        material: '',
        sizes: '',
        colors: '',
        in_stock: true,
        is_returnable: true,
        return_window_days: 7,
        description: ''
      });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Convert comma-separated strings to arrays
    const sizesArray = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);
    const colorsArray = formData.colors.split(',').map(s => s.trim()).filter(Boolean);
    const priceCents = Math.round(parseFloat(formData.price_cents) * 100) || 0;

    const payload = {
      name: formData.name,
      price_cents: priceCents,
      material: formData.material,
      sizes: sizesArray.length ? sizesArray : null,
      colors: colorsArray.length ? colorsArray : null,
      in_stock: formData.in_stock,
      is_returnable: formData.is_returnable,
      return_window_days: formData.is_returnable ? (parseInt(formData.return_window_days, 10) || null) : null,
      description: formData.description
    };

    try {
      const url = editingId
        ? `${API_BASE_URL}/products/${editingId}`
        : `${API_BASE_URL}/products`;

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to save product');
      }

      await fetchProducts();
      closeForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && !products.length) return <p className="status-muted">Loading products...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Product Catalog</h2>
        <button className="primary-btn" onClick={() => openForm()}>Add Product</button>
      </div>

      {error && <div className="status-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {isFormOpen && (
        <div className="panel" style={{ marginBottom: '24px', background: '#f8fbf8', border: '1px solid #c2e0c6' }}>
          <h3>{editingId ? 'Edit Product' : 'New Product'}</h3>
          <form onSubmit={handleSubmit} className="stacked-form" style={{ marginTop: '16px' }}>
            <div className="grid-two">
              <label>
                Name *
                <input name="name" value={formData.name} onChange={handleInputChange} required />
              </label>
              <label>
                Price (decimal) *
                <input name="price_cents" type="number" step="0.01" value={formData.price_cents} onChange={handleInputChange} required />
              </label>
            </div>
            <div className="grid-two">
              <label>
                Sizes (comma separated)
                <input name="sizes" value={formData.sizes} onChange={handleInputChange} placeholder="S, M, L, XL" />
              </label>
              <label>
                Colors (comma separated)
                <input name="colors" value={formData.colors} onChange={handleInputChange} placeholder="Red, Blue, Green" />
              </label>
            </div>
            <div className="grid-two">
              <label>
                Material
                <input name="material" value={formData.material} onChange={handleInputChange} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input name="in_stock" type="checkbox" checked={formData.in_stock} onChange={handleInputChange} style={{ width: 'auto', margin: 0 }} />
                <span>In Stock</span>
              </label>
            </div>
            <div className="grid-two">
              <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input name="is_returnable" type="checkbox" checked={formData.is_returnable} onChange={handleInputChange} style={{ width: 'auto', margin: 0 }} />
                <span>Returnable</span>
              </label>
              <label style={{ opacity: formData.is_returnable ? 1 : 0.5 }}>
                Return Window (Days)
                <input name="return_window_days" type="number" min="0" value={formData.return_window_days} onChange={handleInputChange} disabled={!formData.is_returnable} />
              </label>
            </div>
            <label>
              Description
              <input name="description" value={formData.description} onChange={handleInputChange} />
            </label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="primary-btn">Save Product</button>
              <button type="button" className="secondary-btn" onClick={closeForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Status</th>
              <th>Sizes / Colors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">No products found. Add your first product!</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.product_id}>
                  <td>
                    <strong>{product.name}</strong>
                    {product.material && <div className="status-muted" style={{ fontSize: '0.85em' }}>{product.material}</div>}
                  </td>
                  <td>{((product.price_cents || 0) / 100).toFixed(2)}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8em',
                      background: product.in_stock ? '#d1fae5' : '#fee2e2',
                      color: product.in_stock ? '#065f46' : '#991b1b'
                    }}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85em', color: '#666' }}>
                      {product.sizes?.length > 0 && <div>Sizes: {product.sizes.join(', ')}</div>}
                      {product.colors?.length > 0 && <div>Colors: {product.colors.join(', ')}</div>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openForm(product)} style={{ background: 'transparent', color: '#075e54', fontWeight: 'bold' }}>Edit</button>
                      <button onClick={() => handleDelete(product.product_id)} style={{ background: 'transparent', color: '#c2410c', fontWeight: 'bold' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
