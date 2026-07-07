import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import './CartPage.css';

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  // eslint-disable-next-line
  const customerToken = localStorage.getItem('customerToken');

  useEffect(() => {
    if (!customerToken) {
      navigate('/otp-login');
      return;
    }
    fetchCart();
    // eslint-disable-next-line
  }, []);

  const fetchCart = async function() {
    try {
      const res = await API.get('/cart/cart-details', {
        headers: { Authorization: 'Bearer ' + customerToken }
      });
      setCart(res.data.cart);
    } catch (err) {
      setError('Failed to load cart.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async function(productId, quantity) {
    try {
      await API.put('/cart/update-cart',
        { productId, quantity },
        { headers: { Authorization: 'Bearer ' + customerToken } }
      );
      fetchCart();
      refreshCartCount();
    } catch (err) {
      alert('Failed to update quantity');
    }
  };

  const handleRemove = async function(productId) {
    try {
      await API.delete('/cart/delete/' + productId, {
        headers: { Authorization: 'Bearer ' + customerToken }
      });
      fetchCart();
      refreshCartCount();
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const handleClearCart = async function() {
    if (!window.confirm('Remove all items from your cart?')) return;

    setClearing(true);
    try {
      const productIds = cart.items.map(function(item) {
        return item.product._id;
      });

      for (let i = 0; i < productIds.length; i++) {
        await API.delete('/cart/delete/' + productIds[i], {
          headers: { Authorization: 'Bearer ' + customerToken }
        });
      }

      fetchCart();
      refreshCartCount();
    } catch (err) {
      alert('Failed to clear cart');
    } finally {
      setClearing(false);
    }
  };

  const getTotal = function() {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(function(sum, item) {
      return sum + (item.product ? item.product.price : 0) * item.quantity;
    }, 0);
  };

  if (loading) return <div className="cart-loading">Loading cart...</div>;
  if (error) return <div className="cart-error">{error}</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some fresh products!</p>
        <button onClick={function() { navigate('/'); }} className="shop-btn">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-title-row">
        <h1 className="cart-title">My Cart</h1>
        <button
          className="clear-cart-btn"
          onClick={handleClearCart}
          disabled={clearing}
        >
          {clearing ? 'Clearing...' : '🗑 Clear Cart'}
        </button>
      </div>

      <div className="cart-layout">

        <div className="cart-items">
          {cart.items.map(function(item) {
            return (
              <div key={item.product._id} className="cart-item">
                <img
                  src={'http://localhost:8000' + item.product.image}
                  alt={item.product.name}
                  onError={function(e) { e.target.src = '/placeholder.png'; }}
                />
                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <p className="item-category">{item.product.category}</p>
                  <p className="item-price">
                    Rs.{item.product.price} / {item.product.unit}
                  </p>
                </div>
                <div className="item-controls">
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={function() {
                        handleUpdateQuantity(item.product._id, item.quantity - 1);
                      }}
                    >
                      -
                    </button>
                    <span className="qty-num">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={function() {
                        handleUpdateQuantity(item.product._id, item.quantity + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <p className="item-subtotal">
                    Rs.{item.product.price * item.quantity}
                  </p>
                  <button
                    className="remove-btn"
                    onClick={function() { handleRemove(item.product._id); }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-rows">
            {cart.items.map(function(item) {
              return (
                <div key={item.product._id} className="summary-row">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>Rs.{item.product.price * item.quantity}</span>
                </div>
              );
            })}
          </div>
          <div className="summary-divider"></div>
          <div className="summary-total">
            <span>Total</span>
            <span>Rs.{getTotal()}</span>
          </div>
          <button
            className="checkout-btn"
            onClick={function() { navigate('/checkout'); }}
          >
            Proceed to Checkout
          </button>
          <button
            className="continue-btn"
            onClick={function() { navigate('/'); }}
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}

export default CartPage;