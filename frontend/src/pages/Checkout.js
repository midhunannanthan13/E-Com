import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { firstErrorMessage } from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Checkout() {
  const { cart, refreshCart, clearLocalCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shipping_address: user?.address || '124, 4th Cross, Indiranagar',
    city: user?.city || 'Bengaluru',
    postal_code: user?.postal_code || '560038',
    country: user?.country || 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders/checkout/', form);
      clearLocalCart();
      toast(`🎉 Order #${data.id} placed successfully! Thank you for shopping with ShopSphere.`, 'success');
      navigate('/orders', { replace: true });
    } catch (err) {
      setError(firstErrorMessage(err));
      toast('Could not complete order. Please check stock or address details.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="empty-state py-5">
          <i className="bi bi-cart-x text-muted" style={{ fontSize: '3.5rem' }}></i>
          <h3 className="mt-3">Your cart is empty</h3>
          <p className="text-muted">Add some items before checking out.</p>
          <Link to="/" className="btn btn-primary mt-2">Go to Shop</Link>
        </div>
      </div>
    );
  }

  const itemsTotal = Number(cart.total_price || 0);
  const deliveryFee = itemsTotal >= 499 ? 0 : 49;
  const grandTotal = itemsTotal + deliveryFee;

  return (
    <div className="checkout-page-pro container py-4">
      {/* Checkout Steps Indicator */}
      <div className="checkout-steps mb-4">
        <div className="step-item step-item--done">
          <span className="step-num"><i className="bi bi-check-lg"></i></span>
          <span className="step-label">Bag</span>
        </div>
        <div className="step-connector step-connector--done"></div>
        <div className="step-item step-item--active">
          <span className="step-num">2</span>
          <span className="step-label">Address & Payment</span>
        </div>
        <div className="step-connector"></div>
        <div className="step-item">
          <span className="step-num">3</span>
          <span className="step-label">Confirmation</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="col-12 col-lg-7">
          {/* Shipping Address Panel */}
          <div className="checkout-card mb-4">
            <div className="checkout-card-header">
              <span className="card-step-badge">1</span>
              <h4>Delivery Address</h4>
            </div>
            <form id="checkout-form" onSubmit={handleSubmit} className="checkout-form" noValidate>
              <div className="mb-3">
                <label className="form-label">Full Shipping Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Flat, House no., Building, Street, Area"
                  value={form.shipping_address}
                  onChange={set('shipping_address')}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label">City / Town</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bengaluru"
                    value={form.city}
                    onChange={set('city')}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label">PIN Code</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 560038"
                    maxLength="6"
                    value={form.postal_code}
                    onChange={set('postal_code')}
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.country}
                  onChange={set('country')}
                  required
                />
              </div>
            </form>
          </div>

          {/* Payment Options Panel */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <span className="card-step-badge">2</span>
              <h4>Select Payment Method</h4>
            </div>

            <div className="payment-options-list">
              {/* UPI Option */}
              <label className={`payment-option-item ${paymentMethod === 'upi' ? 'payment-option-item--active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                />
                <div className="payment-option-details">
                  <div className="d-flex align-items-center justify-content-between">
                    <strong>UPI (Google Pay, PhonePe, Paytm, BHIM)</strong>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">Recommended</span>
                  </div>
                  <small className="text-muted">Instant payment using any UPI app or Virtual Payment Address (VPA)</small>
                </div>
              </label>

              {/* Cards Option */}
              <label className={`payment-option-item ${paymentMethod === 'card' ? 'payment-option-item--active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <div className="payment-option-details">
                  <div className="d-flex align-items-center justify-content-between">
                    <strong>Credit / Debit / ATM Card</strong>
                    <div className="card-logos">
                      <span className="badge bg-light text-dark border me-1">VISA</span>
                      <span className="badge bg-light text-dark border me-1">MasterCard</span>
                      <span className="badge bg-light text-dark border">RuPay</span>
                    </div>
                  </div>
                  <small className="text-muted">All major Indian credit & debit cards supported with 256-bit encryption</small>
                </div>
              </label>

              {/* Net Banking */}
              <label className={`payment-option-item ${paymentMethod === 'netbanking' ? 'payment-option-item--active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'netbanking'}
                  onChange={() => setPaymentMethod('netbanking')}
                />
                <div className="payment-option-details">
                  <strong>Net Banking (50+ Banks)</strong>
                  <small className="text-muted">HDFC, ICICI, SBI, Axis, Kotak, and all major Indian banking partners</small>
                </div>
              </label>

              {/* Cash on Delivery */}
              <label className={`payment-option-item ${paymentMethod === 'cod' ? 'payment-option-item--active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div className="payment-option-details">
                  <strong>Cash on Delivery (COD)</strong>
                  <small className="text-muted">Pay in cash or scan delivery partner's QR code at doorstep</small>
                </div>
              </label>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            <button
              type="submit"
              form="checkout-form"
              className="btn btn-primary w-100 py-3 mt-4 fw-bold checkout-submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span> Placing Order…
                </>
              ) : (
                <>
                  <i className="bi bi-shield-check me-2"></i> PLACE ORDER • ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary & Review */}
        <div className="col-12 col-lg-5">
          <div className="checkout-summary-card">
            <h4 className="summary-heading">Order Summary ({cart.items.length} Items)</h4>

            <div className="summary-items-list">
              {cart.items.map((item) => (
                <div className="summary-item-row" key={item.id}>
                  <img
                    src={item.product.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&fit=crop'}
                    alt={item.product.name}
                    className="summary-item-thumb"
                  />
                  <div className="summary-item-info">
                    <span className="summary-item-name">{item.product.name}</span>
                    <span className="summary-item-meta">Qty: {item.quantity}</span>
                  </div>
                  <span className="summary-item-subtotal">₹{Number(item.subtotal).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

            <div className="summary-price-lines mt-3">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>₹{itemsTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="summary-line">
                <span>Delivery Charges</span>
                <span>{deliveryFee === 0 ? <strong className="text-success">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-line summary-line--total">
                <strong>Grand Total</strong>
                <strong>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <div className="checkout-trust-box mt-4">
              <div className="trust-point">
                <i className="bi bi-shield-lock-fill text-success"></i>
                <span>256-Bit SSL Encrypted & PCI-DSS Certified</span>
              </div>
              <div className="trust-point">
                <i className="bi bi-arrow-repeat text-primary"></i>
                <span>7-Day Return / Replacement Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
