import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import './HomePage.css';


function HomePage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMsg, setCartMsg] = useState('');
  const [wishlistIds, setWishlistIds] = useState([]);
  const navigate = useNavigate();
  const customerToken = localStorage.getItem('customerToken');
  const { refreshCartCount } = useCart();

  useEffect(() => {
    fetchProducts();
    if (customerToken) fetchWishlist();
    // eslint-disable-next-line
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/api/show-products');
      const prods = res.data.newProducts;
      setProducts(prods);
      setFiltered(prods);
      const cats = ['All', ...new Set(prods.map(function(p) { return p.category; }).filter(Boolean))];
      setCategories(cats);
    } catch (err) {
      setError('Failed to load products. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async function() {
    try {
      const res = await API.get('/wishlist/my-wishlist', {
        headers: { Authorization: 'Bearer ' + customerToken }
      });
      const ids = res.data.products.map(function(p) { return p._id; });
      setWishlistIds(ids);
    } catch (err) {
      // silently ignore
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    filterProducts(val, category);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    filterProducts(search, cat);
  };

  const filterProducts = (searchVal, cat) => {
    let result = products;
    if (cat !== 'All') result = result.filter(function(p) { return p.category === cat; });
    if (searchVal) result = result.filter(function(p) {
      return p.name.toLowerCase().includes(searchVal.toLowerCase());
    });
    setFiltered(result);
  };

  const handleAddToCart = async (product) => {
    if (!customerToken) {
      navigate('/otp-login');
      return;
    }
    try {
      await API.post('/cart/add-to-cart',
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: 'Bearer ' + customerToken } }
      );
      setCartMsg('Added ' + product.name + ' to cart!');
      refreshCartCount();
      setTimeout(() => setCartMsg(''), 3000);
    } catch (err) {
      setCartMsg('Failed to add to cart.');
      setTimeout(() => setCartMsg(''), 3000);
    }
  };

  const handleToggleWishlist = async function(productId) {
    if (!customerToken) {
      navigate('/otp-login');
      return;
    }
    try {
      const res = await API.post('/wishlist/toggle',
        { productId },
        { headers: { Authorization: 'Bearer ' + customerToken } }
      );
      if (res.data.added) {
        setWishlistIds([...wishlistIds, productId]);
      } else {
        setWishlistIds(wishlistIds.filter(function(id) { return id !== productId; }));
      }
    } catch (err) {
      alert('Failed to update wishlist');
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error-screen">{error}</div>;

  return (
    <div className="home-container">

      <div className="hero">
        <h1>Fresh Groceries Delivered</h1>
        <p>Order fresh fruits, vegetables and more to your door</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {cartMsg && <div className="cart-toast">{cartMsg}</div>}

      <div className="category-bar">
        {categories.map(function(cat) {
          return (
            <button
              key={cat}
              className={'cat-btn ' + (category === cat ? 'active' : '')}
              onClick={function() { handleCategory(cat); }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="products-section">
        <h2>{category === 'All' ? 'All Products' : category}</h2>

        {filtered.length === 0 ? (
          <div className="no-products">
            <p>No products found</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map(function(product) {
              const isWishlisted = wishlistIds.includes(product._id);
              return (
                <div key={product._id} className="product-card">
                  <div className="product-img-wrap">
                    <button
                      className={'wishlist-heart-btn ' + (isWishlisted ? 'active' : '')}
                      onClick={function() { handleToggleWishlist(product._id); }}
                    >
                      {isWishlisted ? '❤️' : '🤍'}
                    </button>
                    <img
                      src={'http://localhost:8000' + product.image}
                      alt={product.name}
                      onError={function(e) { e.target.src = '/placeholder.png'; }}
                    />
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.desc}</p>
                    <div className="product-footer">
                      <div>
                        <span className="product-price">Rs.{product.price}</span>
                        <span className="product-unit"> / {product.unit}</span>
                      </div>
                      <button
                        className="add-cart-btn"
                        onClick={function() { handleAddToCart(product); }}
                      >
                        + Add
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

export default HomePage;