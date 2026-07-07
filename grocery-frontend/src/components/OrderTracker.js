import React from 'react';
import './OrderTracker.css';

function formatTimestamp(isoString) {
  const d = new Date(isoString);
  const day = d.getDate();
  const month = d.toLocaleString('en-IN', { month: 'short' });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return day + ' ' + month + ' ' + year + ', ' + hours + ':' + minutes + ' ' + ampm;
}

function OrderTracker({ tracking }) {
  if (!tracking) return <div className="tracker-loading">Loading tracking info...</div>;

  if (tracking.cancelled) {
    return (
      <div className="tracker-cancelled">
        <span className="tracker-cancelled-icon">✕</span>
        <p>This order was cancelled</p>
      </div>
    );
  }

  const checkpoints = tracking.checkpoints;
  const lastReachedIndex = checkpoints.reduce(function(acc, c, idx) {
    return c.reached ? idx : acc;
  }, 0);

  return (
    <div className="timeline-tracker">
      {checkpoints.map(function(cp, idx) {
        const isReached = cp.reached;
        const isCurrent = idx === lastReachedIndex && idx !== checkpoints.length - 1;
        

        return (
          <div key={cp.key} className="timeline-row">
            <div className="timeline-marker-col">
              <div className={
                'timeline-dot ' +
                (isReached ? 'reached' : 'pending') +
                (isCurrent ? ' current' : '')
              }>
                {isReached ? '✓' : ''}
              </div>
              {idx < checkpoints.length - 1 && (
                <div className={'timeline-connector ' + (isReached ? 'reached' : '')}></div>
              )}
            </div>
            <div className="timeline-content">
              <p className={'timeline-label ' + (isReached ? 'reached-label' : 'pending-label')}>
                {cp.label}
              </p>
              {isReached && (
                <>
                  <p className="timeline-time">{formatTimestamp(cp.timestamp)}</p>
                  {cp.detail && <p className="timeline-detail">{cp.detail}</p>}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OrderTracker;