import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import './Admin.css';

function AdminDashboard() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ productCount: 0, orderCount: 0, customerCount: 0, revenue: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    if (!admin) { navigate('/login'); return; }
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const fetchStats = async function () {
    try {
      const [productsRes, ordersRes] = await Promise.allSettled([
        API.get('/api/show-products'),
        API.get('/order/admin/all-orders', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        }),
      ]);

      let productCount = 0, orderCount = 0, customerCount = 0, revenue = 0;

      if (productsRes.status === 'fulfilled') {
        productCount = productsRes.value.data.newProducts.length;
      }

      if (ordersRes.status === 'fulfilled') {
        const allOrders = ordersRes.value.data.orders || [];
        setOrders(allOrders);
        orderCount = allOrders.length;
        revenue = allOrders
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const uniqueUsers = new Set(
          allOrders.map((o) => (o.user && (o.user._id || o.user)) || null).filter(Boolean)
        );
        customerCount = uniqueUsers.size;
      }

      setStats({ productCount, orderCount, customerCount, revenue });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  const getOrderSummary = function () {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      today: orders.filter(o => new Date(o.createdAt) >= todayStart).length,
      week: orders.filter(o => new Date(o.createdAt) >= weekStart).length,
      month: orders.filter(o => new Date(o.createdAt) >= monthStart).length,
      total: orders.length,
    };
  };

  const formatRevenue = (amount) => {
    if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'k';
    return '₹' + amount;
  };

  const handleLogout = function () { logout(); navigate('/login'); };

  if (!admin) return null;

  const summary = getOrderSummary();

  return (
    <div className="admin-container">

      {/* Orders Breakdown Modal */}
      {showOrderModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowOrderModal(false)}
        >
          <div
            style={{ background: 'white', borderRadius: 16, padding: 32, width: 480, maxWidth: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, color: '#1565c0', fontSize: 20 }}>🛒 Orders Breakdown</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888', lineHeight: 1 }}
              >✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#e3f2fd', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#1565c0' }}>Today</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#1565c0', lineHeight: 1 }}>{summary.today}</div>
                <div style={{ fontSize: 12, marginTop: 6, color: '#1565c0', opacity: 0.7 }}>orders placed today</div>
              </div>
              <div style={{ background: '#e8f5e9', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#2e7d32' }}>This Week</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#2e7d32', lineHeight: 1 }}>{summary.week}</div>
                <div style={{ fontSize: 12, marginTop: 6, color: '#2e7d32', opacity: 0.7 }}>orders in last 7 days</div>
              </div>
              <div style={{ background: '#fff3e0', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#e65100' }}>This Month</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#e65100', lineHeight: 1 }}>{summary.month}</div>
                <div style={{ fontSize: 12, marginTop: 6, color: '#e65100', opacity: 0.7 }}>orders this month</div>
              </div>
              <div style={{ background: '#f3e5f5', borderRadius: 12, padding: '20px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#6a1b9a' }}>All Time</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#6a1b9a', lineHeight: 1 }}>{summary.total}</div>
                <div style={{ fontSize: 12, marginTop: 6, color: '#6a1b9a', opacity: 0.7 }}>total orders ever</div>
              </div>
            </div>

            <button
              onClick={() => { setShowOrderModal(false); navigate('/admin/orders'); }}
              style={{ width: '100%', padding: 12, background: '#1565c0', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
            >
              View All Orders →
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{admin.name}</p>
          <p className="admin-email">{admin.email}</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin" className="nav-item active">Dashboard</Link>
          <Link to="/admin/products" className="nav-item">Products</Link>
          <Link to="/admin/orders" className="nav-item">Orders</Link>
          <Link to="/" className="nav-item">View Store</Link>
        </nav>
        <button onClick={handleLogout} className="sidebar-logout">Logout</button>
      </div>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {admin.name}!</p>
          </div>
          <button className="add-btn" onClick={() => navigate('/admin/products?action=add')}>
            + Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card green" onClick={() => navigate('/admin/products')} style={{ cursor: 'pointer' }}>
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.productCount}</h3>
              <p>Total Products</p>
            </div>
          </div>

          <div className="stat-card blue" onClick={() => !loading && setShowOrderModal(true)} style={{ cursor: 'pointer' }}>
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.orderCount}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card orange">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{loading ? '...' : stats.customerCount}</h3>
              <p>Customers</p>
            </div>
          </div>

          <div className="stat-card purple">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>{loading ? '...' : formatRevenue(stats.revenue)}</h3>
              <p>Revenue</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <div className="action-card" onClick={() => navigate('/admin/products?action=add')}>
              <span className="action-icon">➕</span>
              <h3>Add Product</h3>
              <p>Add new grocery items to store</p>
            </div>
            <div className="action-card" onClick={() => navigate('/admin/products')}>
              <span className="action-icon">📋</span>
              <h3>Manage Products</h3>
              <p>View and delete products</p>
            </div>
            <div className="action-card" onClick={() => navigate('/admin/orders')}>
              <span className="action-icon">🚚</span>
              <h3>View Orders</h3>
              <p>Track and manage orders</p>
            </div>
            <div className="action-card" onClick={() => navigate('/')}>
              <span className="action-icon">🏪</span>
              <h3>View Store</h3>
              <p>See how customers see your store</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;