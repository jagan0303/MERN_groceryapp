import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import './AuthPages.css';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async function(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await API.post('/email/forgot-password', { email });
      setSuccess(res.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send reset email. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">🔐</div>
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your email and we'll send you a link to reset your password
        </p>

        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={function(e) { setEmail(e.target.value); }}
                required
              />
            </div>

            {error && <p className="error-msg">⚠️ {error}</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <p className="auth-switch" style={{ marginTop: '16px' }}>
              <span
                style={{ color: '#2e7d32', cursor: 'pointer', fontWeight: 600 }}
                onClick={function() { navigate('/otp-login'); }}
              >
                ← Back to Login
              </span>
            </p>
          </form>
        ) : (
          <div>
            <div className="success-box">
              <p className="success-icon-large">📧</p>
              <p className="success-msg-large">✅ {success}</p>
              <p className="success-hint">
                Check your inbox (and spam folder) for the reset link.
                The link expires in 30 minutes.
              </p>
            </div>
            <button
              className="auth-btn"
              style={{ marginTop: '20px' }}
              onClick={function() { navigate('/otp-login'); }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;