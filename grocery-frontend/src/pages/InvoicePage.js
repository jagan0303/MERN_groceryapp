import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './InvoicePage.css';
import { getImageURL } from '../api/helpers';

function InvoicePage({ order }) {
  const invoiceRef = useRef();
  const navigate = useNavigate();

  const handleDownloadPDF = async function() {
    const element = invoiceRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Invoice-' + order.orderId + '.pdf');
  };

  return (
    <div className="invoice-wrapper">

      {/* Action Buttons - outside invoice */}
      <div className="invoice-actions">
        <button
          className="btn-download"
          onClick={handleDownloadPDF}
        >
          Download PDF
        </button>
        <button
          className="btn-shop"
          onClick={function() { navigate('/'); }}
        >
          Continue Shopping
        </button>
      </div>

      {/* Invoice - this gets converted to PDF */}
      <div className="invoice-box" ref={invoiceRef}>

        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-brand">
            <h1>Grocery App</h1>
            <p>Fresh Groceries Delivered</p>
          </div>
          <div className="invoice-meta">
            <h2>INVOICE</h2>
            <p><span>Order ID:</span> {order.orderId}</p>
            <p><span>Date:</span> {order.date}</p>
            <p><span>Time:</span> {order.time}</p>
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Customer + Payment Info */}
        <div className="invoice-info-grid">
          <div className="invoice-info-box">
            <h3>Bill To</h3>
            <p className="info-name">{order.customer.name}</p>
            <p>{order.customer.email}</p>
            <p>{order.customer.phone}</p>
            <p>{order.customer.address}</p>
          </div>
          <div className="invoice-info-box">
            <h3>Payment Info</h3>
            <p><span>Method:</span> {order.paymentMethod}</p>
            <p><span>Status:</span>
              <span className="paid-badge">PAID</span>
            </p>
          </div>
        </div>

        <div className="invoice-divider"></div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(function(item, index) {
              return (
                <tr key={index}>
                  <td className="product-cell">
                    <img
                     src={getImageURL(item.product.image)}
                      alt={item.product.name}
                      className="invoice-product-img"
                      onError={function(e) { e.target.style.display = 'none'; }}
                    />
                    <span>{item.product.name}</span>
                  </td>
                  <td>{item.product.category}</td>
                  <td>{item.product.unit}</td>
                  <td>Rs.{item.product.price}</td>
                  <td>{item.quantity}</td>
                  <td>Rs.{item.product.price * item.quantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="totals-box">
            <div className="total-row">
              <span>Subtotal</span>
              <span>Rs.{order.total}</span>
            </div>
            <div className="total-row">
              <span>Delivery Charges</span>
              <span className="free-text">FREE</span>
            </div>
            <div className="total-row grand-total">
              <span>Grand Total</span>
              <span>Rs.{order.total}</span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="invoice-success-banner">
          <span>Order Placed Successfully!</span>
          <p>Thank you for shopping with Grocery App!</p>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p>For support: support@groceryapp.com</p>
        </div>

      </div>
    </div>
  );
}

export default InvoicePage;