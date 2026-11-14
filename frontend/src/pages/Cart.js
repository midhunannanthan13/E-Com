import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export default function Cart() {
  const { cart, loading, refreshCart, updateItem, removeItem } = useCart();
  const { toggleWishlist } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleQty = async (itemId, qty) => {
    try {
      await updateItem(itemId, qty);
    } catch (err) {
      toast(err?.response?.data?.detail || 'Could not update quantity.', 'error');
    }
  };

  const handleRemove = async (itemId, itemName) => {
    try {
      await removeItem(itemId);
      toast(`Removed “${itemName}” from cart.`, 'info');
    } catch (err) {
      toast('Could not remove item.', 'error');
    }
  };

  const handleSaveForLater = async (item) => {
    try {
      toggleWishlist(item.product);
      await removeItem(item.id);
      toast(`Moved “${item.product.name}” to Wishlist.`, 'success');
    } catch {
      toast('Could not move item to wishlist.', 'error');
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'FIRST150' || code === 'WELCOME100') {
      const discount = code === 'FIRST150' ? 150 : 100;
      setAppliedCoupon(code);
      setCouponDiscount(discount);
      toast(`🎉 Coupon ${code} applied successfully! You saved ₹${discount}.`, 'success');
    } else if (code === 'FESTIVE10') {
      const discount = Math.round(cart.total_price * 0.1);
      setAppliedCoupon(code);
      setCouponDiscount(discount);
      toast(`🎉 Festive 10% OFF applied! You saved ₹${discount}.`, 'success');
    } else {
      toast('Invalid coupon code. Try FIRST150 or FESTIVE10.', 'error');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    toast('Coupon removed.', 'info');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3"></div>
        <p className="text-muted">Loading your shopping bag…</p>
      </div>
    );
  }

  const itemsTotal = Number(cart.total_price || 0);
  const deliveryFee = itemsTotal >= 499 || itemsTotal === 0 ? 0 : 49;
  const grandTotal = Math.max(0, itemsTotal - couponDiscount + deliveryFee);
  const estimatedSavings = Math.round(itemsTotal * 0.35) + couponDiscount;

  return (
    <div className="cart-page-pro container py-4">
      {/* Header */}
      <div className="cart-header mb-4">
        <h2>
          <i className="bi bi-cart3 text-primary me-2"></i> Shopping Bag ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
        </h2>
        <span className="text-muted">Review your items and proceed to secure checkout</span>
      </div>

      {cart.items.length === 0 ? (
        <div className="cart-empty-state text-center py-5">
          <div className="empty-cart-illustration mb-3">
            <i className="bi bi-bag-x" style={{ fontSize: '4rem', color: '#cbd5e1' }}></i>
          </div>
          <h3>Your shopping bag is empty!</h3>
          <p className="text-muted mb-4">Explore top trending products and super saver deals today.</p>
          <Link to="/" className="btn btn-primary px-4 py-2">
            <i className="bi bi-shop me-2"></i> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {/* Left Column: Cart Items List */}
          <div className="col-12 col-lg-8">
            {/* Free Delivery Progress Banner */}
            <div className="delivery-free-banner mb-3">
              {itemsTotal >= 499 ? (
                <div className="banner-success">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <span>Yay! Your order qualifies for <strong>FREE Delivery</strong> across India.</span>
                </div>
              ) : (
                <div className="banner-progress">
                  <i className="bi bi-truck text-primary me-2"></i>
                  <span>Add <strong>₹{(499 - itemsTotal).toFixed(0)}</strong> more to unlock <strong>FREE Delivery</strong>!</span>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="cart-items-wrapper">
              {cart.items.map((item) => {
                const product = item.product;
                const origPrice = product.original_price || (product.price * 1.35).toFixed(2);
                return (
                  <div className="cart-item-card" key={item.id}>
                    <div className="cart-item-img-box">
                      <Link to={`/products/${product.slug}`}>
                        <img
                          src={product.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&fit=crop'}
                          alt={product.name}
                          className="cart-item-thumb"
                        />
                      </Link>
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-top">
                        <Link to={`/products/${product.slug}`} className="cart-item-title">
                          {product.name}
                        </Link>
                        <span className="cart-item-delivery">
                          <i className="bi bi-truck me-1"></i> Delivery in 2–3 Days
                        </span>
                      </div>

                      <div className="cart-item-prices">
                        <span className="cart-price-curr">
                          ₹{Number(product.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                        {origPrice > product.price && (
                          <span className="cart-price-orig">
                            ₹{Number(origPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </span>
                        )}
                        <span className="cart-subtotal-tag">
                          Subtotal: ₹{Number(item.subtotal).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="cart-item-actions-row">
                        {/* Quantity Stepper */}
                        <div className="cart-qty-stepper">
                          <button
                            type="button"
                            onClick={() => handleQty(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleQty(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>

                        {/* Save to Wishlist */}
                        <button
                          type="button"
                          className="cart-action-link"
                          onClick={() => handleSaveForLater(item)}
                        >
                          <i className="bi bi-heart me-1"></i> Save to Wishlist
                        </button>

                        {/* Remove button */}
                        <button
                          type="button"
                          className="cart-action-link text-danger"
                          onClick={() => handleRemove(item.id, product.name)}
                        >
                          <i className="bi bi-trash3 me-1"></i> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Return & Guarantee Note */}
            <div className="cart-guarantee-note mt-3">
              <i className="bi bi-shield-check text-success fs-5 me-2"></i>
              <div>
                <strong>Safe and Secure Payments</strong>
                <p className="mb-0 text-muted small">100% Payment Protection • Easy 7-Day Doorstep Returns & Exchanges</p>
              </div>
            </div>
          </div>

          {/* Right Column: Price Details & Coupon */}
          <div className="col-12 col-lg-4">
            {/* Coupon Box */}
            <div className="price-details-card mb-3">
              <h5 className="card-heading">
                <i className="bi bi-tag-fill text-danger me-2"></i> Apply Coupon
              </h5>
              {appliedCoupon ? (
                <div className="applied-coupon-box">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-success me-2">{appliedCoupon}</span>
                      <strong className="text-success">₹{couponDiscount} Saved!</strong>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-form">
                  <input
                    type="text"
                    placeholder="Enter code e.g. FIRST150"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <button type="submit" className="btn btn-dark btn-sm">
                    Apply
                  </button>
                </form>
              )}
              <div className="coupon-suggestions mt-2">
                <small className="text-muted">Try: </small>
                <button
                  type="button"
                  className="coupon-tag-btn"
                  onClick={() => setCouponCode('FIRST150')}
                >
                  FIRST150 (₹150 OFF)
                </button>
                <button
                  type="button"
                  className="coupon-tag-btn"
                  onClick={() => setCouponCode('FESTIVE10')}
                >
                  FESTIVE10 (10% OFF)
                </button>
              </div>
            </div>

            {/* Price Breakdown Card */}
            <div className="price-details-card">
              <h5 className="card-heading">Price Details ({cart.items.length} Items)</h5>
              <div className="price-line">
                <span>Total MRP</span>
                <span>₹{(itemsTotal + estimatedSavings).toLocaleString('en-IN')}</span>
              </div>
              <div className="price-line text-success">
                <span>Discount on MRP</span>
                <span>- ₹{estimatedSavings.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="price-line text-success">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>- ₹{couponDiscount}</span>
                </div>
              )}
              <div className="price-line">
                <span>Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-success fw-bold">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="price-divider"></div>
              <div className="price-line price-line--total">
                <strong>Total Amount</strong>
                <strong>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
              </div>

              {/* Total Savings Highlight */}
              <div className="savings-highlight-banner mt-3">
                <i className="bi bi-piggy-bank text-success me-2"></i>
                <span>You will save <strong>₹{estimatedSavings.toLocaleString('en-IN')}</strong> on this order!</span>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                className="btn btn-primary w-100 py-2 mt-3 fw-bold"
                onClick={() => navigate('/checkout')}
              >
                <i className="bi bi-shield-lock-fill me-2"></i> PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
