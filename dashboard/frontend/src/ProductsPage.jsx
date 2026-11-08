import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Scissors,
  Sparkles,
  Dumbbell,
  Salad,
  HeartHandshake,
  ClipboardList,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import StatCard from './StatCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const CATEGORY_ICONS = {
  'Hair Services': Scissors,
  Skincare: Sparkles,
  'Fitness Plans': Dumbbell,
  'Food Items': Salad,
  'Spa Services': HeartHandshake,
  Consultations: ClipboardList,
  'Hair Products': ShoppingBag,
};

const MOCK_PRODUCTS = [
  { product_id: '1', name: 'Hair Spa Premium', price_cents: 79900, category: 'Hair Services', status: 'Available', in_stock: true },
  { product_id: '2', name: 'Keratin Treatment', price_cents: 499900, category: 'Hair Services', status: 'Available', in_stock: true },
  { product_id: '3', name: 'Hydra Facial', price_cents: 249900, category: 'Skincare', status: 'Available', in_stock: true },
  { product_id: '4', name: 'Personal Training', price_cents: 249900, category: 'Fitness Plans', status: 'Available', in_stock: true, recurring: '/month' },
  { product_id: '5', name: 'Grilled Chicken Bowl', price_cents: 34900, category: 'Food Items', status: 'Available', in_stock: true },
  { product_id: '6', name: 'Full Body Massage', price_cents: 129900, category: 'Spa Services', status: 'Available', in_stock: true },
  { product_id: '7', name: 'Nutrition Consultation', price_cents: 99900, category: 'Consultations', status: 'Available', in_stock: true },
  { product_id: '8', name: 'Hair Care Kit', price_cents: 119900, category: 'Hair Products', status: 'Out of Stock', in_stock: false },
];

const CATEGORIES = ['Hair Services', 'Skincare', 'Fitness Plans', 'Food Items', 'Spa Services', 'Consultations', 'Hair Products'];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: CATEGORIES[0],
  status: 'Available',
  stock: 'In Stock',
};

function formatPrice(cents, recurring) {
  return `₹${((cents || 0) / 100).toLocaleString('en-IN')}${recurring || ''}`;
}

function useProducts() {
  const { accessToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
      setUsingFallback(false);
    } catch (err) {
      setProducts(MOCK_PRODUCTS);
      setUsingFallback(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) fetchProducts();
  }, [accessToken]);

  async function createProduct(payload) {
    if (usingFallback) {
      // No live backend -- append locally so the flow still works end-to-end.
      setProducts((prev) => [{ product_id: String(Date.now()), ...payload }, ...prev]);
      return { ok: true };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to create product');
      }
      await fetchProducts();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function updateProduct(productId, payload) {
    if (usingFallback) {
      setProducts((prev) => prev.map((p) => (p.product_id === productId ? { ...p, ...payload } : p)));
      return { ok: true };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to update product');
      }
      await fetchProducts();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function deleteProduct(productId) {
    if (usingFallback) {
      setProducts((prev) => prev.filter((p) => p.product_id !== productId));
      return { ok: true };
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to delete product');
      await fetchProducts();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return { products, loading, error, usingFallback, createProduct, updateProduct, deleteProduct };
}

function ProductFormPanel({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name || '',
              description: initial.description || '',
              price: initial.price_cents ? (initial.price_cents / 100).toString() : '',
              category: initial.category || CATEGORIES[0],
              status: initial.status || 'Available',
              stock: initial.in_stock === false ? 'Out of Stock' : 'In Stock',
            }
          : EMPTY_FORM
      );
      setImages([]);
      setError('');
    }
  }, [open, initial]);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFiles(fileList) {
    const files = Array.from(fileList).slice(0, 4 - images.length);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((results) => setImages((prev) => [...prev, ...results].slice(0, 4)));
  }

  async function handleSubmit() {
    setError('');
    if (!form.name.trim()) {
      setError('Product name is required');
      return;
    }
    const priceValue = parseFloat(form.price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      setError('Enter a valid price');
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price_cents: Math.round(priceValue * 100),
      category: form.category,
      status: form.status,
      in_stock: form.stock === 'In Stock',
    };
    const result = await onSubmit(payload);
    setSaving(false);
    if (result.ok) {
      onClose();
    } else {
      setError(result.error || 'Something went wrong');
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{initial ? 'Edit Product' : 'Add New Product'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {initial ? 'Update this product or service.' : 'Add a new product or service to your catalog.'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2.5">
              {error}
            </div>
          )}

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Product Name</span>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
              placeholder="e.g. Hair Spa Premium"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </label>

          <label className="block">
            <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</span>
            <textarea
              className="w-full h-24 px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
              placeholder="Describe the product or service..."
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price (₹)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
                placeholder="e.g. 799"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</span>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Status</span>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
                value={form.status}
                onChange={(e) => update('status', e.target.value)}
              >
                <option>Available</option>
                <option>Unavailable</option>
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Stock</span>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
                value={form.stock}
                onChange={(e) => update('stock', e.target.value)}
              >
                <option>In Stock</option>
                <option>Out of Stock</option>
              </select>
            </label>
          </div>

          <div>
            <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Upload Images</span>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl py-8 cursor-pointer hover:border-green-400 dark:hover:border-green-500 transition-colors">
              <Upload size={28} className="text-gray-300 dark:text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Drag & drop images here</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">or</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-4 py-1.5 rounded-lg">
                Browse Files
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, WEBP up to 5MB</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
            {images.length > 0 && (
              <div className="flex gap-2 mt-3">
                {images.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl py-2.5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { products, loading, usingFallback, createProduct, updateProduct, deleteProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [availabilityFilter, setAvailabilityFilter] = useState('Availability');
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search.trim() && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'All Categories' && p.category !== categoryFilter) return false;
      if (availabilityFilter === 'Available' && p.status !== 'Available') return false;
      if (availabilityFilter === 'Out of Stock' && p.in_stock !== false) return false;
      return true;
    });
  }, [products, search, categoryFilter, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const total = products.length;
    const categories = new Set(products.map((p) => p.category)).size;
    const active = products.filter((p) => p.status === 'Available').length;
    const outOfStock = products.filter((p) => p.in_stock === false).length;
    return { total, categories, active, outOfStock };
  }, [products]);

  async function handleDelete(productId) {
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(productId);
  }

  async function handleFormSubmit(payload) {
    if (editingProduct) {
      return updateProduct(editingProduct.product_id, payload);
    }
    return createProduct(payload);
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Product Catalog</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Manage products and services that your AI can recommend to customers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {usingFallback && (
            <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-800">
              Mock Data
            </span>
          )}
          <button
            onClick={() => {
              setEditingProduct(null);
              setPanelOpen(true);
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shrink-0"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option>All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none"
          value={availabilityFilter}
          onChange={(e) => {
            setAvailabilityFilter(e.target.value);
            setPage(1);
          }}
        >
          <option>Availability</option>
          <option>Available</option>
          <option>Out of Stock</option>
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Products" value={stats.total} trend={12} loading={loading} />
        <StatCard label="Categories" value={stats.categories} loading={loading} />
        <StatCard label="Active Products" value={stats.active} trend={8} loading={loading} />
        <StatCard label="Out of Stock" value={stats.outOfStock} trend={-2} loading={loading} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && !products.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-50 dark:bg-gray-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center text-gray-400 dark:text-gray-500 h-48">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pageItems.map((product) => {
              const CategoryIcon = CATEGORY_ICONS[product.category] || Package;
              return (
                <div key={product.product_id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                  <div className="h-32 bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
                    <CategoryIcon size={36} className="text-gray-400 dark:text-gray-500" />
                    <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-snug">{product.name}</h4>
                    <p className="text-green-700 dark:text-green-400 font-bold text-sm">{formatPrice(product.price_cents, product.recurring)}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{product.category}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${
                        product.status === 'Available' && product.in_stock !== false
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {product.in_stock === false ? 'Out of Stock' : product.status}
                    </span>
                    <div className="flex items-center gap-4 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700 text-xs font-semibold">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setPanelOpen(true);
                        }}
                        className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.product_id)}
                        className="flex items-center gap-1 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} products
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold ${
                  page === i + 1
                    ? 'bg-green-600 text-white'
                    : 'border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <ProductFormPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSubmit={handleFormSubmit}
        initial={editingProduct}
      />
    </div>
  );
}
