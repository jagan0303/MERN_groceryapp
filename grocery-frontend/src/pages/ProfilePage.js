import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const customerName = localStorage.getItem('customerName');
  const customerEmail = localStorage.getItem('customerEmail');
  const customerToken = localStorage.getItem('customerToken');

  React.useEffect(function() {
    if (!customerToken) {
      navigate('/otp-login');
    }
  }, [customerToken, navigate]);

  const handleLogout = function() {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('customerName');
    navigate('/');
    window.location.reload();
  };

  const getInitial = function() {
    return customerName ? customerName.charAt(0).toUpperCase() : 'U';
  };

  if (!customerToken) return null;

  return (
    <div className="profile-page">

      <div className="profile-topbar">
        <button className="back-arrow" onClick={function() { navigate('/'); }}>‹</button>
        <h1>Profile</h1>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">{getInitial()}</div>
        <div>
          <h2 className="profile-name">{customerName}</h2>
          <p className="profile-email">{customerEmail}</p>
        </div>
      </div>

      <div className="quick-cards">
        <div className="quick-card" onClick={function() { navigate('/orders'); }}>
          <span className="quick-icon">📦</span>
          <span>Your Orders</span>
        </div>
        <div className="quick-card" onClick={function() { navigate('/help-support'); }}>
          <span className="quick-icon">💬</span>
          <span>Help & Support</span>
        </div>
        <div className="quick-card" onClick={function() { navigate('/wishlist'); }}>
          <span className="quick-icon">❤️</span>
          <span>Your Wishlist</span>
        </div>
      </div>

      <h3 className="section-label">Your Information</h3>
      <div className="info-list">
        <div className="info-row" onClick={function() { navigate('/wishlist'); }}>
          <span className="info-icon">❤️</span>
          <span className="info-text">Your Wishlist</span>
          <span className="info-arrow">›</span>
        </div>
        <div className="info-row" onClick={function() { navigate('/help-support'); }}>
          <span className="info-icon">💬</span>
          <span className="info-text">Help & Support</span>
          <span className="info-arrow">›</span>
        </div>
        <div className="info-row" onClick={function() { navigate('/saved-addresses'); }}>
          <span className="info-icon">📍</span>
          <div className="info-text-block">
            <span className="info-text">Saved Addresses</span>
          </div>
          <span className="info-arrow">›</span>
        </div>
        <div className="info-row" onClick={function() { navigate('/notifications'); }}>
          <span className="info-icon">🔔</span>
          <span className="info-text">Notifications</span>
          <span className="info-arrow">›</span>
        </div>
      </div>

      <h3 className="section-label">Other Information</h3>
      <div className="info-list">
        <div className="info-row no-action">
          <span className="info-icon">ℹ️</span>
          <span className="info-text">General Info</span>
        </div>
      </div>

      <button className="logout-btn-full" onClick={handleLogout}>
        Log Out
      </button>

      <p className="app-version">App version 1.0.0</p>

    </div>
  );
}

export default ProfilePage;