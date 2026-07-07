import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { getImageURL } from '../api/helpers';
import './WishlistPage.css';

function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const navigate = useNavigate();
  const customerToken = localStorage.getItem('customerToken');

  useEffect(function() {
    if (!customerToken) { navigate('/otp-login'); return; }
    fetchWishlist();
    // eslint-disable-next-line
  }, []);

  const fetchWishlist = async function() {
    try {
      const res = await API.get('/wishlist/my-wishlist', {
        headers: { Authorization: 'Bearer ' + customerToken }
      });
      setProducts(res.data.products || []);
    } catch (err) {
      setError('Failed to load wishlist.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = function(msg) {
    setToast(msg);
    setTimeout(function() { setToast(''); }, 2500);
  };

  const handleRemove = async function(productId) {
    try {
      await API.delete('/wishlist/remove/' + productId, {
        headers: { Authorization: 'Bearer ' + customerToken }
      });
      setProducts(products.filter(function(p) { return p._id !== productId; }));
      showToast('Removed from wishlist');
    } catch (err) {
      showToast('Failed to remove item');
    }
  };

  const handleAddToCart = async function(product) {
    try {
      await API.post('/cart/add-to-cart',
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: 'Bearer ' + customerToken } }
      );
      showToast('Added ' + product.name + ' to cart!');
    } catch (err) {
      showToast('Failed to add to cart');
    }
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-topbar">
        <button className="back-arrow" onClick={function() { navigate('/profile'); }}>‹</button>
        <h1>Your Wishlist</h1>
      </div>

      {toast && <div className="wishlist-toast">{toast}</div>}

      <div className="wishlist-content">
        {loading ? (
          <div className="wishlist-loading">Loading wishlist...</div>
        ) : error ? (
          <div className="wishlist-error">{error}</div>
        ) : products.length === 0 ? (
          <div className="wishlist-empty">
            <span>❤️</span>
            <h2>Your wishlist is empty</h2>
            <p>Tap the heart icon on any product to save it here</p>
            <button onClick={function() { navigate('/'); }} className="wishlist-shop-btn">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {products.map(function(product) {
              return (
                <div key={product._id} className="wishlist-card">
                  <button
                    className="wishlist-remove-heart"
                    onClick={function() { handleRemove(product._id); }}
                  >
                    ❤️
                  </button>
                  <img
                    src={getImageURL(product.image)}
                    alt={product.name}
                    onError={function(e) { e.target.src = '/placeholder.png'; }}
                  />
                  <div className="wishlist-info">
                    <span className="wishlist-category">{product.category}</span>
                    <h3>{product.name}</h3>
                    <div className="wishlist-footer">
                      <span className="wishlist-price">Rs.{product.price} / {product.unit}</span>
                      <button
                        className="wishlist-add-btn"
                        onClick={function() { handleAddToCart(product); }}
                      >
                        + Cart
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

export default WishlistPage;