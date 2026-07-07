import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import InvoicePage from './InvoicePage';
import OrderTracker from '../components/OrderTracker';
import OrderActionModal from '../components/OrderActionModal';
import './OrdersPage.css';
import { getImageURL } from '../api/helpers';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const navigate = useNavigate();
  const customerToken = localStorage.getItem('customerToken');
  const customerName = localStorage.getItem('customerName');
  const customerEmail = localStorage.getItem('customerEmail');

  useEffect(() => {
    if (!customerToken) {
      navigate('/otp-login');
      return;
    }
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async function() {
    try {
      const res = await API.get('/order/my-orders', {
        headers: { Authorization: 'Bearer ' + customerToken }
      });
      setOrders(res.data.orders);
    } catch (err) {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const buildInvoiceData = function(order) {
    return {
      orderId: order._id,
      date: new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
      }),
      time: new Date(order.createdAt).toLocaleTimeString('en-IN'),
      customer: {
        name: customerName,
        email: customerEmail,
        phone: order.address ? order.address.phone : '',
        address: order.address
          ? order.address.street + ', ' + order.address.city + ', ' +
            order.address.state + ' - ' + order.address.pincode
          : ''
      },
      items: order.items.map(function(item) {
        return {
          product: {
            _id: item.product,
            name: item.name,
            price: item.price,
            unit: item.unit,
            image: item.image,
            category: ''
          },
          quantity: item.quantity
        };
      }),
      total: order.totalAmount,
      paymentMethod: order.paymentMethod === 'cod'
        ? 'Cash on Delivery'
        : order.paymentMethod === 'upi'
        ? 'UPI - ' + (order.paymentDetails || '')
        : 'QR Code Payment'
    };
  };

  const formatDate = function(dateStr) {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString('en-IN', { month: 'short' });
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return 'Placed at ' + day + ' ' + month + ' ' + year + ', ' + hours + ':' + minutes + ' ' + ampm;
  };

  const getStatusLabel = function(status) {
    if (status === 'delivered') return 'Order delivered';
    if (status === 'out_for_delivery') return 'Out for delivery';
    if (status === 'shipped') return 'Order shipped';
    if (status === 'processing') return 'Order processing';
    if (status === 'cancelled') return 'Order cancelled';
    if (status === 'replacement_requested') return 'Replacement requested';
    if (status === 'return_approved') return 'Replacement approved';
    if (status === 'return_rejected') return 'Replacement rejected';
    return 'Order placed';
  };

  const getStatusIcon = function(status) {
    if (status === 'cancelled' || status === 'return_rejected') return '✕';
    return '✓';
  };

  const canCancel = function(order) {
    return ['placed', 'processing', 'shipped'].includes(order.status);
  };

  const canRequestReplacement = function(order) {
    return order.status === 'delivered';
  };

  const hasReplacementRequest = function(order) {
    return order.replacementRequest && order.replacementRequest.requested;
  };

  const handleActionSubmit = async function(reason, comment) {
    setActionSubmitting(true);
    setActionMsg('');
    try {
      const endpoint = actionType === 'cancel'
        ? '/order/' + selectedOrder._id + '/cancel'
        : '/order/' + selectedOrder._id + '/request-replacement';

      const res = await API.post(endpoint,
        { reason, comment },
        { headers: { Authorization: 'Bearer ' + customerToken } }
      );

      setSelectedOrder(res.data.order);
      setShowActionModal(false);
      setActionMsg(res.data.msg);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to submit request');
    } finally {
      setActionSubmitting(false);
    }
  };

  // Show invoice
  if (viewingInvoice) {
    return (
      <div>
        <div className="back-to-orders">
          <button onClick={function() { setViewingInvoice(null); }}>
            ← Back to Order Details
          </button>
        </div>
        <InvoicePage order={viewingInvoice} />
      </div>
    );
  }

  // Show order detail + tracker
  if (selectedOrder) {
    return (
      <div className="order-detail-page">
        <div className="orders-topbar">
          <button className="back-arrow" onClick={function() { setSelectedOrder(null); setActionMsg(''); }}>‹</button>
          <h1>Order Details</h1>
        </div>

        <div className="order-detail-content">
          <div className="detail-card">
            <p className="detail-order-id">Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
            <p className="detail-order-date">{formatDate(selectedOrder.createdAt)}</p>

            <OrderTracker tracking={selectedOrder.tracking} />

            <button
              className="view-invoice-btn-full"
              onClick={function() { setViewingInvoice(buildInvoiceData(selectedOrder)); }}
            >
              📄 View Full Invoice
            </button>

            {actionMsg && <div className="action-success-msg">{actionMsg}</div>}

            {canCancel(selectedOrder) && (
              <button
                className="cancel-order-btn-customer"
                onClick={function() { setActionType('cancel'); setShowActionModal(true); }}
              >
                Cancel Order
              </button>
            )}

            {canRequestReplacement(selectedOrder) && !hasReplacementRequest(selectedOrder) && (
              <button
                className="replace-order-btn-customer"
                onClick={function() { setActionType('replace'); setShowActionModal(true); }}
              >
                Request Replacement
              </button>
            )}

            {hasReplacementRequest(selectedOrder) && (
              <div className="replacement-status-box">
                <p><strong>Replacement Status:</strong> {selectedOrder.status.replace(/_/g, ' ').toUpperCase()}</p>
                <p className="replacement-reason-text">Reason: {selectedOrder.replacementRequest.reason}</p>
                {selectedOrder.replacementRequest.adminResponse && (
                  <p className="replacement-admin-response">
                    Response: {selectedOrder.replacementRequest.adminResponse}
                  </p>
                )}
              </div>
            )}

            {selectedOrder.status === 'cancelled' && selectedOrder.cancelReason && (
              <div className="replacement-status-box">
                <p><strong>Cancellation Reason:</strong></p>
                <p className="replacement-reason-text">{selectedOrder.cancelReason}</p>
              </div>
            )}
          </div>

          <div className="detail-card">
            <h2>Items</h2>
            {selectedOrder.items.map(function(item, idx) {
              return (
                <div key={idx} className="detail-item-row">
                  <img
                    src={getImageURL(item.product.image)}
                    alt={item.name}
                    onError={function(e) { e.target.src = '/placeholder.png'; }}
                  />
                  <div className="detail-item-info">
                    <p className="detail-item-name">{item.name}</p>
                    <p className="detail-item-meta">{item.quantity} x Rs.{item.price} ({item.unit})</p>
                  </div>
                  <p className="detail-item-total">Rs.{item.price * item.quantity}</p>
                </div>
              );
            })}
            <div className="detail-total-row">
              <span>Total</span>
              <span>Rs.{selectedOrder.totalAmount}</span>
            </div>
          </div>

          {selectedOrder.address && (
            <div className="detail-card">
              <h2>Delivery Address</h2>
              <p className="detail-address">
                {selectedOrder.address.fullName}<br />
                {selectedOrder.address.street}, {selectedOrder.address.city}<br />
                {selectedOrder.address.state} - {selectedOrder.address.pincode}<br />
                Phone: {selectedOrder.address.phone}
              </p>
            </div>
          )}

          <div className="detail-card">
            <h2>Payment</h2>
            <p className="detail-payment">
              {selectedOrder.paymentMethod === 'cod'
                ? 'Cash on Delivery'
                : selectedOrder.paymentMethod === 'upi'
                ? 'UPI - ' + (selectedOrder.paymentDetails || '')
                : 'QR Code Payment'}
            </p>
          </div>
        </div>

        {showActionModal && (
          <OrderActionModal
            type={actionType}
            onClose={function() { setShowActionModal(false); }}
            onSubmit={handleActionSubmit}
            submitting={actionSubmitting}
          />
        )}
      </div>
    );
  }

  if (loading) return <div className="orders-loading">Loading your orders...</div>;
  if (error) return <div className="orders-error">{error}</div>;

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <div className="empty-icon">📦</div>
        <h2>No orders yet</h2>
        <p>Start shopping to see your orders here!</p>
        <button onClick={function() { navigate('/'); }} className="shop-btn">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-topbar">
        <button className="back-arrow" onClick={function() { navigate('/'); }}>‹</button>
        <h1>Your Orders</h1>
      </div>

      <div className="orders-list-clean">
        {orders.map(function(order) {
          return (
            <div
              key={order._id}
              className="order-card-clean"
              onClick={function() { setSelectedOrder(order); }}
            >
              <div className="order-card-top">
                <div className="order-status-line">
                  <span className="status-text">{getStatusLabel(order.status)}</span>
                  <span className={'status-icon ' + ((order.status === 'cancelled' || order.status === 'return_rejected') ? 'icon-red' : 'icon-green')}>
                    {getStatusIcon(order.status)}
                  </span>
                </div>
                <div className="order-amount-line">
                  <span className="order-amount">Rs.{order.totalAmount}</span>
                  <span className="chevron">›</span>
                </div>
              </div>

              <p className="order-placed-date">{formatDate(order.createdAt)}</p>

              <div className="order-thumbs-row">
                {order.items.map(function(item, idx) {
                  return (
                    <img
                      key={idx}
                      src={'http://localhost:8000' + item.image}
                      alt={item.name}
                      className="order-thumb"
                      onError={function(e) { e.target.src = '/placeholder.png'; }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrdersPage;