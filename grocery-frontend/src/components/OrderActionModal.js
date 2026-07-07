import React, { useState } from 'react';
import './OrderActionModal.css';

const CANCEL_REASONS = [
  'Changed my mind',
  'Found a better price elsewhere',
  'Ordered by mistake',
  'Delivery is taking too long',
  'Other'
];

const REPLACEMENT_REASONS = [
  'Wrong item delivered',
  'Item damaged',
  'Item expired / out of date',
  'Missing items in the order',
  'Quality not as expected',
  'Other'
];

function OrderActionModal({ type, onClose, onSubmit, submitting }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');

  const reasons = type === 'cancel' ? CANCEL_REASONS : REPLACEMENT_REASONS;
  const title = type === 'cancel' ? 'Cancel Order' : 'Request Replacement';
  const subtitle = type === 'cancel'
    ? 'Please tell us why you want to cancel this order'
    : 'Please tell us what went wrong with this order';

  const handleSubmit = function() {
    if (!selectedReason) return;
    onSubmit(selectedReason, comment);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={function(e) { e.stopPropagation(); }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-subtitle">{subtitle}</p>

        <div className="reason-list">
          {reasons.map(function(reason) {
            return (
              <label key={reason} className={'reason-option ' + (selectedReason === reason ? 'selected' : '')}>
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={function() { setSelectedReason(reason); }}
                />
                <span>{reason}</span>
              </label>
            );
          })}
        </div>

        <div className="comment-box">
          <label>Additional comments (optional)</label>
          <textarea
            placeholder="Tell us more..."
            value={comment}
            onChange={function(e) { setComment(e.target.value); }}
            rows={3}
          />
        </div>

        <button
          className={'modal-submit-btn ' + (type === 'cancel' ? 'cancel-style' : 'replace-style')}
          onClick={handleSubmit}
          disabled={!selectedReason || submitting}
        >
          {submitting ? 'Submitting...' : (type === 'cancel' ? 'Confirm Cancellation' : 'Submit Request')}
        </button>
      </div>
    </div>
  );
}

export default OrderActionModal;