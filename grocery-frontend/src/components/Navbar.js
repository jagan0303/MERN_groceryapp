import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

function Navbar() {
  const { admin, logout } = useAuth();
  const { cartCount, refreshCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const customerName = localStorage.getItem('customerName');
  const customerToken = localStorage.getItem('customerToken');

  useEffect(function() {
    refreshCartCount();
    // eslint-disable-next-line
  }, [location, customerToken]);

  const handleAdminLogout = function() {
    logout();
    navigate('/login');
  };

  const handleCustomerLogout = function() {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('customerName');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🛒 Grocery App</Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>

        <Link to="/cart" className="cart-link">
          🛒 Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {customerToken && (
          <>
            <Link to="/profile" style={{ color: 'white', fontSize: '14px' }}>
              Hi, {customerName}
            </Link>
            <Link to="/orders">My Orders</Link>
            <button onClick={handleCustomerLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}

        {admin && (
          <>
            <Link to="/admin">Admin Panel</Link>
            <span style={{ color: 'white', fontSize: '14px' }}>
              Admin: {admin.name}
            </span>
            <button onClick={handleAdminLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}

        {!customerToken && !admin && (
          <>
            <Link to="/otp-login">Login</Link>
            <Link to="/login" className="register-link">Admin</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;