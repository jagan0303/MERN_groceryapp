import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import './SavedAddressesPage.css';

function SavedAddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: 'Home', fullName: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const customerToken = localStorage.getItem('customerToken');

  useEffect(function() {
    if (!customerToken) { navigate('/otp-login'); return; }
    fetchAddresses();
    // eslint-disable-next-line
  }, []);

  const fetchAddresses = async function() {
    try {
      const res = await API.get('/address/my-addresses', {
        headers: { Authorization: 'Bearer ' + customerToken }
      });
      setAddresses(res.data.addresses);
    } catch (err) {
      setError('Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = function() {
    setFormData({ label: 'Home', fullName: '', phone: '', street: '', city: '', state: '', pincode: '', isDefault: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = function(e) {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async function(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await API.put('/address/update/' + editingId, formData, {
          headers: { Authorization: 'Bearer ' + customerToken }
        });
      } else {
        await API.post('/address/add', formData, {
          headers: { Authorization: 'Bearer ' + customerToken }
        });
      }
      resetForm();
      fetchAddresses();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save address.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = function(addr) {
    setFormData({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault
    });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleDelete = async function(id) {
    if (!window.confirm('Delete this address?')) return;
    try {
      await API.delete('/address/delete/' + id, {
        headers: { Authorization: 'Bearer ' + customerToken }
      });
      fetchAddresses();
    } catch (err) {
      alert('Failed to delete address');
    }
  };

  return (
    <div className="addr-page">
      <div className="addr-topbar">
        <button className="back-arrow" onClick={function() { navigate('/profile'); }}>‹</button>
        <h1>Saved Addresses</h1>
      </div>

      <div className="addr-content">

        {!showForm && (
          <button className="addr-add-btn" onClick={function() { setShowForm(true); }}>
            + Add New Address
          </button>
        )}

        {showForm && (
          <div className="addr-form-card">
            <h2>{editingId ? 'Edit Address' : 'Add New Address'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="addr-label-tabs">
                {['Home', 'Work', 'Other'].map(function(lbl) {
                  return (
                    <button
                      type="button"
                      key={lbl}
                      className={'label-tab ' + (formData.label === lbl ? 'active' : '')}
                      onClick={function() { setFormData({ ...formData, label: lbl }); }}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Street Address</label>
                <input type="text" name="street" value={formData.street} onChange={handleChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                />
                Set as default address
              </label>

              {error && <div className="addr-error">{error}</div>}

              <div className="addr-form-actions">
                <button type="submit" className="addr-save-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
                <button type="button" className="addr-cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="addr-loading">Loading addresses...</div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="addr-empty">
            <span>📍</span>
            <p>No saved addresses yet</p>
          </div>
        ) : (
          <div className="addr-list">
            {addresses.map(function(addr) {
              return (
                <div key={addr._id} className="addr-card">
                  <div className="addr-card-top">
                    <span className="addr-label-badge">{addr.label}</span>
                    {addr.isDefault && <span className="addr-default-badge">DEFAULT</span>}
                  </div>
                  <p className="addr-name">{addr.fullName}</p>
                  <p className="addr-phone">{addr.phone}</p>
                  <p className="addr-full">
                    {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <div className="addr-card-actions">
                    <button onClick={function() { handleEdit(addr); }}>Edit</button>
                    <button className="delete-link" onClick={function() { handleDelete(addr._id); }}>Delete</button>
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

export default SavedAddressesPage;