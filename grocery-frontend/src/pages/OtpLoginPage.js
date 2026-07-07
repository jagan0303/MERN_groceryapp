import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import './AuthPages.css';

function OtpLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/email/send-otp', { name, email });
      setSuccess('OTP sent to your email! Check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/email/verify-otp', { email, otp });
      // Save customer token separately from admin token
      localStorage.setItem('customerToken', res.data.token);
      localStorage.setItem('customerEmail', email);
      localStorage.setItem('customerName', name);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">🛒</div>
        <h2>{step === 1 ? 'Customer Login' : 'Enter OTP'}</h2>
        <p className="auth-subtitle">
          {step === 1
            ? 'Enter your email to receive a one-time password'
            : `We sent a 6-digit OTP to ${email}`}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-msg">⚠️ {error}</p>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                style={{ letterSpacing: '8px', fontSize: '22px', textAlign: 'center' }}
              />
            </div>
            {error && <p className="error-msg">⚠️ {error}</p>}
            {success && <p className="success-msg">✅ {success}</p>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="auth-btn"
              style={{ background: '#f5f5f5', color: '#333', marginTop: '10px' }}
              onClick={() => { setStep(1); setError(''); setOtp(''); }}
            >
              ← Change Email
            </button>
          </form>
        )}

        <p className="auth-switch">
          Admin? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default OtpLoginPage;