import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import './HelpSupportPage.css';

const FAQ_DATA = {
  'Order Issues': [
    {
      q: 'How do I track my order?',
      a: 'Go to Profile > Your Orders to see the status of all your orders. Each order shows whether it is placed, processing, shipped, or delivered.'
    },
    {
      q: 'Can I cancel my order?',
      a: 'Currently orders cannot be cancelled from the app once placed. Please contact us using the form below and our team will assist you.'
    },
    {
      q: 'I received the wrong item',
      a: 'We are sorry about that! Please contact us with your order ID and we will resolve it as soon as possible.'
    }
  ],
  'Payment Issues': [
    {
      q: 'My payment failed but money was deducted',
      a: 'If money was deducted but the order did not go through, it is usually refunded automatically within 5-7 business days. If not received, please contact us.'
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'We accept Cash on Delivery, UPI, and QR code payments at checkout.'
    },
    {
      q: 'Is Cash on Delivery available everywhere?',
      a: 'Cash on Delivery is available for most addresses. If unavailable for your location, you will see UPI/QR as the only options at checkout.'
    }
  ],
  'Delivery': [
    {
      q: 'How long does delivery take?',
      a: 'Most orders are delivered within 24-48 hours depending on your location and product availability.'
    },
    {
      q: 'Do you deliver to my area?',
      a: 'We are expanding our delivery zones. Please add your address at checkout to see if delivery is available.'
    },
    {
      q: 'Is delivery free?',
      a: 'Yes! We currently offer free delivery on all orders.'
    }
  ],
  'Account': [
    {
      q: 'How do I update my saved address?',
      a: 'Go to Profile > Saved Addresses to add, edit, or delete your delivery addresses.'
    },
    {
      q: 'I am not receiving the OTP',
      a: 'Please check your spam/junk folder. If you still do not receive it, try again after a few minutes or contact support.'
    },
    {
      q: 'How do I delete my account?',
      a: 'Please contact our support team using the form below and we will process your account deletion request.'
    }
  ]
};

function HelpSupportPage() {
  const navigate = useNavigate();
  const customerName = localStorage.getItem('customerName') || '';
  const customerEmail = localStorage.getItem('customerEmail') || '';

  const [stage, setStage] = useState('menu'); // menu | category | answer | contact
  const [activeCategory, setActiveCategory] = useState('');
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [chatLog, setChatLog] = useState([
    { from: 'bot', text: 'Hi! I am the Grocery App support bot. What do you need help with today?' }
  ]);

  const [formData, setFormData] = useState({
    name: customerName,
    email: customerEmail,
    category: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const pushBotMessage = function(text) {
    setChatLog(function(prev) {
      return [...prev, { from: 'bot', text: text }];
    });
  };

  const pushUserMessage = function(text) {
    setChatLog(function(prev) {
      return [...prev, { from: 'user', text: text }];
    });
  };

  const handleCategoryClick = function(category) {
    pushUserMessage(category);
    setActiveCategory(category);
    setStage('category');
    setTimeout(function() {
      pushBotMessage('Here are some common questions about ' + category + ':');
    }, 300);
  };

  const handleQuestionClick = function(item) {
    pushUserMessage(item.q);
    setActiveQuestion(item);
    setTimeout(function() {
      pushBotMessage(item.a);
    }, 300);
  };

  const handleBackToMenu = function() {
    setStage('menu');
    setActiveCategory('');
    setActiveQuestion(null);
    pushBotMessage('What else can I help you with?');
  };

  const handleNotResolved = function() {
    pushUserMessage('This did not solve my issue');
    setTimeout(function() {
      pushBotMessage('I am sorry that did not help. Let me connect you with our support team — please fill the form below.');
      setStage('contact');
    }, 300);
  };

  const handleFormChange = function(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitContact = async function(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await API.post('/support/contact', {
        name: formData.name,
        email: formData.email,
        category: activeCategory || 'General',
        message: formData.message
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send message. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="help-page">
      <div className="help-topbar">
        <button className="back-arrow" onClick={function() { navigate('/profile'); }}>‹</button>
        <h1>Help & Support</h1>
      </div>

      <div className="help-content">

        {/* Chat log */}
        <div className="chat-log">
          {chatLog.map(function(msg, idx) {
            return (
              <div key={idx} className={'chat-bubble-row ' + (msg.from === 'user' ? 'user-row' : 'bot-row')}>
                {msg.from === 'bot' && <span className="bot-avatar">🤖</span>}
                <div className={'chat-bubble ' + (msg.from === 'user' ? 'user-bubble' : 'bot-bubble')}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage: menu - category buttons */}
        {stage === 'menu' && (
          <div className="option-grid">
            {Object.keys(FAQ_DATA).map(function(cat) {
              return (
                <button
                  key={cat}
                  className="option-btn"
                  onClick={function() { handleCategoryClick(cat); }}
                >
                  {cat}
                </button>
              );
            })}
            <button
              className="option-btn contact-direct-btn"
              onClick={function() { setStage('contact'); pushUserMessage('I want to contact support directly'); }}
            >
              💬 Talk to Support Team
            </button>
          </div>
        )}

        {/* Stage: category - show questions */}
        {stage === 'category' && (
          <div className="option-grid">
            {FAQ_DATA[activeCategory].map(function(item, idx) {
              return (
                <button
                  key={idx}
                  className="option-btn"
                  onClick={function() { handleQuestionClick(item); }}
                >
                  {item.q}
                </button>
              );
            })}
            {activeQuestion && (
              <>
                <button className="option-btn resolved-btn" onClick={handleBackToMenu}>
                  ✅ This helped, thanks!
                </button>
                <button className="option-btn not-resolved-btn" onClick={handleNotResolved}>
                  ❌ This did not solve my issue
                </button>
              </>
            )}
            <button className="option-btn back-btn" onClick={handleBackToMenu}>
              ← Back to topics
            </button>
          </div>
        )}

        {/* Stage: contact form */}
        {stage === 'contact' && !submitted && (
          <div className="contact-form-card">
            <h2>Contact Our Support Team</h2>
            <p className="contact-sub">We typically respond within 24 hours.</p>
            <form onSubmit={handleSubmitContact}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Describe your issue..."
                  rows={4}
                  required
                />
              </div>
              {error && <div className="help-error">{error}</div>}
              <button type="submit" className="contact-submit-btn" disabled={submitting}>
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        )}

        {/* Submitted confirmation */}
        {stage === 'contact' && submitted && (
          <div className="contact-success">
            <span>✅</span>
            <h2>Message Sent!</h2>
            <p>Our support team will get back to you at {formData.email} shortly.</p>
            <button className="back-home-btn" onClick={function() { navigate('/profile'); }}>
              Back to Profile
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default HelpSupportPage;