import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/orders/')
      .then(({ data }) => setOrders(data.results || data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadInvoice = (orderId) => {
    toast(`Downloaded Invoice for Order #${orderId}`, 'info');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3"></div>
        <p className="text-muted">Loading your orders & shipments…</p>
      </div>
    );
  }

  return (
    <div className="orders-page-pro container py-4">
      <div className="orders-header mb-4">
        <div>
          <h2><i className="bi bi-box-seam-fill text-primary me-2"></i> My Orders</h2>
          <span className="text-muted">Track your shipments, returns, and order history</span>
        </div>
        <Link to="/" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left me-1"></i> Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty-state text-center py-5">
          <div className="empty-order-icon mb-3">
            <i className="bi bi-receipt" style={{ fontSize: '4rem', color: '#cbd5e1' }}></i>
          </div>
          <h3>You haven't placed any orders yet</h3>
          <p className="text-muted mb-4">Discover great finds, trending fashion, and gadgets at unbeatable prices.</p>
          <Link to="/" className="btn btn-primary px-4 py-2">
            Start Shopping Now
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isDelivered = order.status === 'delivered';
            const isShipped = order.status === 'shipped' || isDelivered;
            const isConfirmed = order.status === 'paid' || isShipped;

            return (
              <div className="order-card-pro mb-4" key={order.id}>
                {/* Order Top Bar */}
                <div className="order-card-pro__head">
                  <div className="order-head-left">
                    <span className="order-number">Order #{order.id}</span>
                    <span className="order-date">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="order-head-right">
                    <span className={`order-status-badge order-status-badge--${order.status}`}>
                      <i className="bi bi-dot"></i> {order.status?.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      className="btn-invoice"
                      onClick={() => handleDownloadInvoice(order.id)}
                      title="Download Invoice"
                    >
                      <i className="bi bi-file-earmark-arrow-down me-1"></i> Invoice
                    </button>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                <div className="order-tracking-strip">
                  <div className="tracking-timeline">
                    <div className="timeline-node timeline-node--done">
                      <div className="node-icon"><i className="bi bi-bag-check"></i></div>
                      <span>Order Placed</span>
                    </div>
                    <div className={`timeline-line ${isConfirmed ? 'timeline-line--active' : ''}`}></div>
                    <div className={`timeline-node ${isConfirmed ? 'timeline-node--done' : 'timeline-node--pending'}`}>
                      <div className="node-icon"><i className="bi bi-patch-check"></i></div>
                      <span>Confirmed</span>
                    </div>
                    <div className={`timeline-line ${isShipped ? 'timeline-line--active' : ''}`}></div>
                    <div className={`timeline-node ${isShipped ? 'timeline-node--done' : 'timeline-node--pending'}`}>
                      <div className="node-icon"><i className="bi bi-truck"></i></div>
                      <span>Shipped</span>
                    </div>
                    <div className={`timeline-line ${isDelivered ? 'timeline-line--active' : ''}`}></div>
                    <div className={`timeline-node ${isDelivered ? 'timeline-node--done' : 'timeline-node--pending'}`}>
                      <div className="node-icon"><i className="bi bi-house-door"></i></div>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Items in this Order */}
                <div className="order-card-pro__items">
                  {order.items.map((item) => (
                    <div className="order-item-row" key={item.id}>
                      <div className="order-item-info">
                        <strong>{item.product_name}</strong>
                        <div className="order-item-meta">
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span>Price: ₹{Number(item.price || (item.subtotal / item.quantity)).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="order-item-subtotal">
                        <strong>₹{Number(item.subtotal).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="order-card-pro__foot">
                  <div className="delivery-address-summary">
                    <i className="bi bi-geo-alt-fill text-muted me-1"></i>
                    <span>Delivery to: <strong>{order.shipping_address}, {order.city}</strong></span>
                  </div>

                  <div className="order-total-summary">
                    <span>Total Paid:</span>
                    <span className="order-grand-total">₹{Number(order.total_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
