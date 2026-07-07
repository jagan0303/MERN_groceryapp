import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import InvoicePage from './InvoicePage';
import './CheckoutPage.css';

function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [upiId, setUpiId] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [address, setAddress] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', pincode: ''
  });

  const navigate = useNavigate();
  const customerToken = localStorage.getItem('customerToken');
  const customerName = localStorage.getItem('customerName');
  const customerEmail = localStorage.getItem('customerEmail');

  useEffect(() => {
    if (!customerToken) { navigate('/otp-login'); return; }
    fetchCart();
    // eslint-disable-next-line
  }, []);

  const fetchCart = async function() {
    try {
      const res = await API.get('/cart/cart-details', {
        headers: { Authorization: 'Bearer ' + customerToken }
      });
      setCart(res.data.cart);
    } catch (err) {
      setError('Failed to load cart.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = function(e) {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const getTotal = function() {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(function(sum, item) {
      return sum + (item.product ? item.product.price : 0) * item.quantity;
    }, 0);
  };

  const handlePlaceOrder = async function(e) {
    e.preventDefault();
    setError('');

    if (paymentMethod === 'upi' && !upiId) {
      setError('Please enter your UPI ID');
      return;
    }

    setPlacing(true);

    try {
      if (paymentMethod === 'cod') {
        await submitOrderToBackend('cod', '', false);
      } else {
        await startRazorpayPayment();
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to place order. Try again.');
      setPlacing(false);
    }
  };

  const startRazorpayPayment = async function() {
    try {
      console.log('Calling /payment/create-order with amount:', getTotal());
      console.log('Customer token:', customerToken);

      const orderRes = await API.post('/payment/create-order',
        { amount: getTotal() },
        { headers: { Authorization: 'Bearer ' + customerToken } }
      );

      console.log('Razorpay order created:', orderRes.data);

      const razorpayOrder = orderRes.data.order;
      const keyId = orderRes.data.keyId;

      if (!window.Razorpay) {
        setError('Razorpay script not loaded. Check public/index.html.');
        setPlacing(false);
        return;
      }

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Grocery App',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async function(response) {
          try {
            const verifyRes = await API.post('/payment/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { Authorization: 'Bearer ' + customerToken } }
            );

            if (verifyRes.data.success) {
              await submitOrderToBackend(
                paymentMethod,
                response.razorpay_payment_id,
                true
              );
            } else {
              setError('Payment verification failed. Please try again.');
              setPlacing(false);
            }
          } catch (err) {
            console.error('VERIFY ERROR:', err);
            setError('Payment verification failed. Please try again.');
            setPlacing(false);
          }
        },
        prefill: {
          name: customerName,
          email: customerEmail,
           contact: address.phone
        },
        theme: {
          color: '#2e7d32'
        },
        modal: {
          ondismiss: function() {
            setPlacing(false);
            setError('Payment was cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('RAZORPAY START ERROR:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error message:', err.message);
      setError('Could not start payment: ' + (err.response?.data?.msg || err.message));
      setPlacing(false);
    }
  };

  const submitOrderToBackend = async function(method, razorpayPaymentId, verified) {
    const paymentDetails = method === 'upi'
      ? upiId
      : method === 'qr'
      ? 'Paid via QR'
      : '';

    const res = await API.post('/order/place-order',
      {
        address,
        paymentMethod: method,
        paymentDetails,
        razorpayPaymentId: razorpayPaymentId || '',
        paymentVerified: verified || false
      },
      { headers: { Authorization: 'Bearer ' + customerToken } }
    );

    const savedOrder = res.data.order;

    const order = {
      orderId: savedOrder._id,
      date: new Date(savedOrder.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric'
      }),
      time: new Date(savedOrder.createdAt).toLocaleTimeString('en-IN'),
      customer: {
        name: customerName,
        email: customerEmail,
        phone: address.phone,
        address: address.street + ', ' + address.city + ', ' +
                 address.state + ' - ' + address.pincode
      },
      items: savedOrder.items.map(function(item) {
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
      total: savedOrder.totalAmount,
      paymentMethod: method === 'cod'
        ? 'Cash on Delivery'
        : method === 'upi'
        ? 'UPI - ' + upiId + (verified ? ' (Verified)' : '')
        : 'QR Code Payment' + (verified ? ' (Verified)' : '')
    };

    setOrderData(order);
    setSuccess(true);
    setPlacing(false);
  };

  if (loading) return <div className="checkout-loading">Loading...</div>;

  if (success && orderData) {
    return <InvoicePage order={orderData} />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty!</h2>
        <button onClick={function() { navigate('/'); }}>Go Shopping</button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-layout">

        <div className="checkout-left">

          <div className="checkout-card">
            <h2>Delivery Address</h2>
            <form onSubmit={handlePlaceOrder}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="fullName"
                    placeholder="Your full name"
                    value={address.fullName}
                    onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone"
                    placeholder="10-digit number"
                    value={address.phone}
                    onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input type="text" name="street"
                  placeholder="House no, street, area"
                  value={address.street}
                  onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city"
                    placeholder="City" value={address.city}
                    onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" name="state"
                    placeholder="State" value={address.state}
                    onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" name="pincode"
                  placeholder="6-digit pincode"
                  value={address.pincode}
                  onChange={handleChange} required />
              </div>

              <div className="payment-section">
                <h2>Payment Method</h2>

                <div
                  className={'payment-option ' + (paymentMethod === 'cod' ? 'selected' : '')}
                  onClick={function() { setPaymentMethod('cod'); setShowQR(false); }}
                >
                  <span className="payment-radio">
                    {paymentMethod === 'cod' && <span className="radio-dot"></span>}
                  </span>
                  <span className="payment-icon">💵</span>
                  <div>
                    <p className="payment-name">Cash on Delivery</p>
                    <p className="payment-desc">Pay when order arrives</p>
                  </div>
                </div>

                <div
                  className={'payment-option ' + (paymentMethod === 'upi' ? 'selected' : '')}
                  onClick={function() { setPaymentMethod('upi'); setShowQR(false); }}
                >
                  <span className="payment-radio">
                    {paymentMethod === 'upi' && <span className="radio-dot"></span>}
                  </span>
                  <span className="payment-icon">📱</span>
                  <div>
                    <p className="payment-name">UPI Payment (Verified)</p>
                    <p className="payment-desc">Pay securely via Razorpay</p>
                  </div>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="upi-input-box">
                    <label>Enter UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={function(e) { setUpiId(e.target.value); }}
                    />
                    <p className="upi-hint">
                      e.g. 9999999999@paytm, name@gpay, name@ybl
                    </p>
                    <p className="upi-hint">
                      Test mode: use success@razorpay in the payment popup
                    </p>
                  </div>
                )}

                <div
                  className={'payment-option ' + (paymentMethod === 'qr' ? 'selected' : '')}
                  onClick={function() { setPaymentMethod('qr'); setShowQR(true); }}
                >
                  <span className="payment-radio">
                    {paymentMethod === 'qr' && <span className="radio-dot"></span>}
                  </span>
                  <span className="payment-icon">📷</span>
                  <div>
                    <p className="payment-name">Pay via Razorpay Checkout</p>
                    <p className="payment-desc">Scan QR or use any UPI app in the popup</p>
                  </div>
                </div>

                {paymentMethod === 'qr' && showQR && (
                  <div className="qr-box">
                    <p className="qr-title">You will scan a QR in the next step</p>
                    <p className="qr-note">
                      Clicking Place Order will open a secure Razorpay payment window with a live QR code.
                    </p>
                  </div>
                )}
              </div>

              {error && <div className="checkout-error">{error}</div>}

              <button
                type="submit"
                className="place-order-btn"
                disabled={placing}
              >
                {placing ? 'Processing...' : 'Place Order — Rs.' + getTotal()}
              </button>
            </form>
          </div>
        </div>

        <div className="checkout-right">
          <div className="checkout-card">
            <h2>Order Summary</h2>
            <div className="checkout-items">
              {cart.items.map(function(item) {
                return (
                  <div key={item.product._id} className="checkout-item">
                    <img
                      src={'http://localhost:8000' + item.product.image}
                      alt={item.product.name}
                      onError={function(e) { e.target.src = '/placeholder.png'; }}
                    />
                    <div className="checkout-item-info">
                      <p className="checkout-item-name">{item.product.name}</p>
                      <p className="checkout-item-unit">{item.product.unit}</p>
                      <p className="checkout-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="checkout-item-price">
                      Rs.{item.product.price * item.quantity}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="checkout-summary">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>Rs.{getTotal()}</span>
              </div>
              <div className="summary-line">
                <span>Delivery</span>
                <span className="free-delivery">FREE</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-line total-line">
                <span>Total</span>
                <span>Rs.{getTotal()}</span>
              </div>
            </div>
          </div>

          <div className="checkout-card customer-card">
            <h2>Customer Details</h2>
            <div className="customer-info">
              <p><span>Name:</span> {customerName}</p>
              <p><span>Email:</span> {customerEmail}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CheckoutPage;