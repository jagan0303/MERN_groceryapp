import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import './Admin.css';

const CATEGORIES = ['all', 'vegetables', 'fruits', 'dairy', 'grains', 'beverages', 'snacks', 'other'];

const EMPTY_FORM = { name: '', price: '', desc: '', category: '', unit: '' };

function AdminProducts() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = add mode
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // product to confirm delete
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    if (!admin) { navigate('/login'); return; }
    fetchProducts();
    // Open add form if navigated with ?action=add
    if (new URLSearchParams(location.search).get('action') === 'add') {
      openAddForm();
    }
    // eslint-disable-next-line
  }, []);

  const fetchProducts = async function () {
    try {
      const res = await API.get('/api/show-products');
      setProducts(res.data.newProducts);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = function () {
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setImage(null);
    setImagePreview(null);
    setMsg('');
    setError('');
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('product-form-top')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const openEditForm = function (product) {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      desc: product.desc || '',
      category: product.category || '',
      unit: product.unit || '',
    });
    setImage(null);
    setImagePreview('http://localhost:8000' + product.image);
    setMsg('');
    setError('');
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('product-form-top')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const closeForm = function () {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(EMPTY_FORM);
    setImage(null);
    setImagePreview(null);
    setMsg('');
    setError('');
  };

  const handleChange = function (e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = function (e) {
    const file = e.target.files[0];
    setImage(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async function (e) {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('desc', formData.desc);
      data.append('category', formData.category);
      data.append('unit', formData.unit);
      if (image) data.append('image', image);

      if (editingProduct) {
        await API.put('/api/update-product/' + editingProduct._id, data, {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMsg('Product updated successfully!');
      } else {
        await API.post('/api/add-product', data, {
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMsg('Product added successfully!');
      }

      closeForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async function () {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await API.delete('/api/delete-product/' + deleteTarget._id, {
        headers: { Authorization: 'Bearer ' + token },
      });
      setProducts(products.filter((p) => p._id !== deleteTarget._id));
      setDeleteTarget(null);
      setMsg('Product deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete product');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter(function (p) {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLogout = function () { logout(); navigate('/login'); };

  if (!admin) return null;

  return (
    <div className="admin-container">

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ marginBottom: 8, color: '#222' }}>Delete Product?</h3>
            <p style={{ color: '#666', marginBottom: 24, fontSize: 14 }}>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={styles.deleteBtn}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{admin.name}</p>
          <p className="admin-email">{admin.email}</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-item">Dashboard</Link>
          <Link to="/admin/products" className="nav-item active">Products</Link>
          <Link to="/admin/orders" className="nav-item">Orders</Link>
          <Link to="/" className="nav-item">View Store</Link>
        </nav>
        <button onClick={handleLogout} className="sidebar-logout">Logout</button>
      </div>

      {/* Main */}
      <div className="admin-main">
        <div id="product-form-top" />

        <div className="admin-header">
          <div>
            <h1>Products</h1>
            <p style={{ color: '#888', marginTop: 4, fontSize: 14 }}>
              {products.length} product{products.length !== 1 ? 's' : ''} listed
            </p>
          </div>
          <button
            className="add-btn"
            onClick={showForm && !editingProduct ? closeForm : openAddForm}
          >
            {showForm && !editingProduct ? 'Cancel' : '+ Add New Product'}
          </button>
        </div>

        {msg && <div className="admin-success">{msg}</div>}
        {error && <div className="admin-error">{error}</div>}

        {/* Add / Edit Form */}
        {showForm && (
          <div className="product-form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
              <button onClick={closeForm} style={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Fresh Tomato"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (Rs.)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="e.g. 30"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Select category</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="dairy">Dairy</option>
                    <option value="grains">Grains</option>
                    <option value="beverages">Beverages</option>
                    <option value="snacks">Snacks</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input
                    type="text"
                    name="unit"
                    placeholder="e.g. 1kg, 500g, piece"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="desc"
                  placeholder="Brief description of the product"
                  value={formData.desc}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label>Product Image {editingProduct && '(leave blank to keep existing)'}</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ marginTop: 10, width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? (editingProduct ? 'Updating...' : 'Adding...') : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
                <button type="button" onClick={closeForm} style={styles.cancelFormBtn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filter */}
        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <div style={styles.categoryTabs}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  ...styles.categoryTab,
                  ...(filterCategory === cat ? styles.categoryTabActive : {}),
                }}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="admin-loading">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="coming-soon">
            <span>📦</span>
            <h2>No products found</h2>
            <p>{search || filterCategory !== 'all' ? 'Try a different search or category.' : 'Add your first product above.'}</p>
          </div>
        ) : (
          <div className="admin-products-grid">
            {filteredProducts.map(function (product) {
              return (
                <div key={product._id} className="admin-product-card">
                  <img
                    src={'http://localhost:8000' + product.image}
                    alt={product.name}
                    onError={function (e) { e.target.src = '/placeholder.png'; }}
                  />
                  <div className="admin-product-info">
                    <span className="admin-product-cat">{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>{product.desc}</p>
                    <div className="admin-product-footer">
                      <span className="admin-product-price">
                        Rs.{product.price} / {product.unit}
                      </span>
                    </div>
                    <div style={styles.cardActions}>
                      <button
                        onClick={() => openEditForm(product)}
                        style={styles.editBtn}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        style={styles.deleteCardBtn}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000,
  },
  modalBox: {
    background: 'white', borderRadius: 16, padding: '36px 32px',
    textAlign: 'center', maxWidth: 380, width: '90%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
  },
  cancelBtn: {
    padding: '10px 24px', borderRadius: 8, border: '1.5px solid #ddd',
    background: 'white', color: '#444', fontWeight: 600, cursor: 'pointer', fontSize: 14,
  },
  deleteBtn: {
    padding: '10px 24px', borderRadius: 8, border: 'none',
    background: '#c62828', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14,
  },
  closeBtn: {
    background: 'none', border: 'none', fontSize: 20,
    cursor: 'pointer', color: '#888', lineHeight: 1,
  },
  cancelFormBtn: {
    padding: '12px 24px', borderRadius: 8, border: '1.5px solid #ddd',
    background: 'white', color: '#444', fontWeight: 600, cursor: 'pointer', fontSize: 15,
  },
  filterBar: {
    marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12,
  },
  searchInput: {
    padding: '10px 16px', borderRadius: 8, border: '1.5px solid #ddd',
    fontSize: 14, width: '100%', maxWidth: 360, boxSizing: 'border-box',
    outline: 'none',
  },
  categoryTabs: {
    display: 'flex', flexWrap: 'wrap', gap: 8,
  },
  categoryTab: {
    padding: '6px 14px', borderRadius: 20, border: '1.5px solid #ddd',
    background: 'white', color: '#555', fontSize: 13, cursor: 'pointer',
    fontWeight: 500, transition: 'all 0.15s',
  },
  categoryTabActive: {
    background: '#2e7d32', color: 'white', border: '1.5px solid #2e7d32',
  },
  cardActions: {
    display: 'flex', gap: 8, marginTop: 10,
  },
  editBtn: {
    flex: 1, padding: '7px 0', borderRadius: 7, border: '1.5px solid #2e7d32',
    background: 'white', color: '#2e7d32', fontWeight: 600, fontSize: 12,
    cursor: 'pointer',
  },
  deleteCardBtn: {
    flex: 1, padding: '7px 0', borderRadius: 7, border: '1.5px solid #c62828',
    background: 'white', color: '#c62828', fontWeight: 600, fontSize: 12,
    cursor: 'pointer',
  },
};

export default AdminProducts;