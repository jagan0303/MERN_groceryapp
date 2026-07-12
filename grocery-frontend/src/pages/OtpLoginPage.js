import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import './AuthPages.css';

function OtpLoginPage() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('password');
  const [step, setStep] = useState(1);

  // Password login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Register state
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  // OTP state
  const [otpName, setOtpName] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const saveCustomerSession = function(token, name, email) {
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customerName', name);
    localStorage.setItem('customerEmail', email);
  };

  // ─── PASSWORD LOGIN ───────────────────────────────────
  const handlePasswordLogin = async function(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/email/login', loginData);
      saveCustomerSession(res.data.token, res.data.name, res.data.email);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // ─── REGISTER ─────────────────────────────────────────
  const handleRegister = async function(e) {
    e.preventDefault();
    setError('');
    if (registerData.password !== registerData.confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      await API.post('/email/register', {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password
      });
      setSuccess('Account created! Please login.');
      setIsRegistering(false);
      setLoginData({ email: registerData.email, password: '' });
      setLoginMethod('password');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP SEND ─────────────────────────────────────────
  const handleSendOtp = async function(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/email/send-otp', { name: otpName, email: otpEmail });
      setSuccess('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP VERIFY ───────────────────────────────────────
  const handleVerifyOtp = async function(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/email/verify-otp', { email: otpEmail, otp });
      saveCustomerSession(res.data.token, res.data.name || otpName, otpEmail);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">🛒</div>
        <h2>{isRegistering ? 'Create Account' : 'Customer Login'}</h2>
        <p className="auth-subtitle">
          {isRegistering
            ? 'Sign up to start shopping'
            : 'Sign in to your account'}
        </p>

        {!isRegistering && (
          <div className="login-method-tabs">
            <button
              className={'method-tab ' + (loginMethod === 'password' ? 'active' : '')}
              onClick={function() { setLoginMethod('password'); setError(''); setSuccess(''); }}
            >
              Password
            </button>
            <button
              className={'method-tab ' + (loginMethod === 'otp' ? 'active' : '')}
              onClick={function() { setLoginMethod('otp'); setError(''); setSuccess(''); setStep(1); }}
            >
              OTP
            </button>
          </div>
        )}

        {error && <p className="error-msg">⚠️ {error}</p>}
        {success && <p className="success-msg">✅ {success}</p>}

        {/* PASSWORD LOGIN */}
        {!isRegistering && loginMethod === 'password' && (
          <form onSubmit={handlePasswordLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={function(e) { setLoginData({ ...loginData, email: e.target.value }); }}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={function(e) { setLoginData({ ...loginData, password: e.target.value }); }}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p className="auth-switch">
              Don't have an account?{' '}
              <span
                style={{ color: '#2e7d32', cursor: 'pointer', fontWeight: 600 }}
                onClick={function() { setIsRegistering(true); setError(''); setSuccess(''); }}
              >
                Register here
              </span>
            </p>
          </form>
        )}

        {/* OTP LOGIN */}
        {!isRegistering && loginMethod === 'otp' && step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                value={otpName}
                onChange={function(e) { setOtpName(e.target.value); }}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={otpEmail}
                onChange={function(e) { setOtpEmail(e.target.value); }}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* OTP VERIFY */}
        {!isRegistering && loginMethod === 'otp' && step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <p className="auth-subtitle">OTP sent to {otpEmail}</p>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={function(e) { setOtp(e.target.value); }}
                maxLength={6}
                style={{ letterSpacing: '8px', fontSize: '22px', textAlign: 'center' }}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="auth-btn"
              style={{ background: '#f5f5f5', color: '#333', marginTop: '10px' }}
              onClick={function() { setStep(1); setError(''); setOtp(''); }}
            >
              ← Change Email
            </button>
          </form>
        )}

        {/* REGISTER */}
        {isRegistering && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={registerData.name}
                onChange={function(e) { setRegisterData({ ...registerData, name: e.target.value }); }}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={registerData.email}
                onChange={function(e) { setRegisterData({ ...registerData, email: e.target.value }); }}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={registerData.password}
                onChange={function(e) { setRegisterData({ ...registerData, password: e.target.value }); }}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={registerData.confirmPassword}
                onChange={function(e) { setRegisterData({ ...registerData, confirmPassword: e.target.value }); }}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </button>
            <p className="auth-switch">
              Already have an account?{' '}
              <span
                style={{ color: '#2e7d32', cursor: 'pointer', fontWeight: 600 }}
                onClick={function() { setIsRegistering(false); setError(''); setSuccess(''); }}
              >
                Login here
              </span>
            </p>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/login">Admin? Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default OtpLoginPage;