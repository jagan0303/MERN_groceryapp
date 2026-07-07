import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import './Admin.css';

const STATUS_FLOW = ['placed', 'processing', 'shipped', 'delivered'];

function AdminOrders() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(function() {
    if (!admin) { navigate('/login'); return; }
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async function() {
    try {
      const token = localStorage.getItem('token');
      const res = await API.get('/order/admin/all-orders', {
        headers: { Authorization: 'Bearer ' + token }
      });
      setOrders(res.data.orders);
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async function(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem('token');
      await API.put('/order/admin/update-status/' + orderId,
        { status: newStatus },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = function(status) {
    if (status === 'delivered') return 'status-delivered';
    if (status === 'shipped') return 'status-shipped';
    if (status === 'processing') return 'status-processing';
    if (status === 'cancelled') return 'status-cancelled';
    return 'status-placed';
  };

  if (!admin) return null;

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{admin.name}</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-item">Dashboard</Link>
          <Link to="/admin/products" className="nav-item">Products</Link>
          <Link to="/admin/orders" className="nav-item active">Orders</Link>
          <Link to="/" className="nav-item">View Store</Link>
        </nav>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <h1>Orders</h1>
        </div>

        {loading ? (
          <div className="admin-loading">Loading orders...</div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : orders.length === 0 ? (
          <div className="coming-soon">
            <span>📦</span>
            <h2>No orders yet</h2>
          </div>
        ) : (
          <div className="admin-orders-list">
            {orders.map(function(order) {
              return (
                <div key={order._id} className="admin-order-card">
                  <div className="admin-order-top">
                    <div>
                      <p className="admin-order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                      <p className="admin-order-customer">
                        {order.user ? order.user.name + ' (' + order.user.email + ')' : 'Unknown customer'}
                      </p>
                      <p className="admin-order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="admin-order-amount">Rs.{order.totalAmount}</div>
                  </div>

                  <div className="admin-order-items">
                    {order.items.map(function(item, idx) {
                      return (
                        <span key={idx} className="admin-order-item-chip">
                          {item.name} x {item.quantity}
                        </span>
                      );
                    })}
                  </div>

                  <div className="admin-order-bottom">
                    <span className={'order-status ' + getStatusColor(order.status)}>
                      {order.status.toUpperCase()}
                    </span>

                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="status-update-controls">
                        <select
                          value={order.status}
                          onChange={function(e) { handleUpdateStatus(order._id, e.target.value); }}
                          disabled={updatingId === order._id}
                        >
                          {STATUS_FLOW.map(function(s) {
                            return <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>;
                          })}
                        </select>
                        <button
                          className="cancel-order-btn"
                          onClick={function() { handleUpdateStatus(order._id, 'cancelled'); }}
                          disabled={updatingId === order._id}
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
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

export default AdminOrders;