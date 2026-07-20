import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import './AuthPages.css';

function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(function() {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    const e = params.get('email');
    if (!t || !e) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }
    setToken(t);
    setEmail(e);
  }, []);

  const handleSubmit = async function(e) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const res = await API.post('/email/reset-password', {
        email,
        token,
        newPassword
      });
      setSuccess(res.data.msg);
      setTimeout(function() { navigate('/otp-login'); }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">🔑</div>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Enter your new password below</p>

        {success ? (
          <div>
            <p className="success-msg">✅ {success}</p>
            <p className="auth-subtitle">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={function(e) { setNewPassword(e.target.value); }}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={function(e) { setConfirmPassword(e.target.value); }}
                required
              />
            </div>

            {error && <p className="error-msg">⚠️ {error}</p>}

            <button type="submit" className="auth-btn" disabled={loading || !token}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;