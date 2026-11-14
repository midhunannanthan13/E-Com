import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const toast = useToast();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast('Please enter a valid email address.', 'warning');
      return;
    }
    setSubscribed(true);
    toast('🎉 Thank you for subscribing! Use coupon "FIRST150" for ₹150 off your order.', 'success');
    setEmail('');
  };

  return (
    <footer className="site-footer-pro" aria-label="Footer">
      {/* Back to top button */}
      <button
        type="button"
        onClick={scrollToTop}
        className="footer-back-to-top"
        aria-label="Back to top"
      >
        <i className="bi bi-arrow-up-short"></i> Back to Top
      </button>

      {/* Trust & Value Proposition Strip */}
      <section className="footer-trust-strip" aria-label="Customer Guarantees">
        <div className="footer-trust-item">
          <div className="footer-trust-icon">
            <i className="bi bi-truck"></i>
          </div>
          <div className="footer-trust-text">
            <h4>Free & Fast Delivery</h4>
            <p>On orders above ₹499 across 27,000+ PIN codes</p>
          </div>
        </div>

        <div className="footer-trust-item">
          <div className="footer-trust-icon">
            <i className="bi bi-arrow-repeat"></i>
          </div>
          <div className="footer-trust-text">
            <h4>7-Day Easy Returns</h4>
            <p>Hassle-free doorstep pickup & instant refund</p>
          </div>
        </div>

        <div className="footer-trust-item">
          <div className="footer-trust-icon">
            <i className="bi bi-patch-check-fill"></i>
          </div>
          <div className="footer-trust-text">
            <h4>100% Genuine & Assured</h4>
            <p>Strict quality-checked products directly from brands</p>
          </div>
        </div>

        <div className="footer-trust-item">
          <div className="footer-trust-icon">
            <i className="bi bi-headset"></i>
          </div>
          <div className="footer-trust-text">
            <h4>24x7 Customer Support</h4>
            <p>Instant live chat, call & email assistance</p>
          </div>
        </div>
      </section>

      {/* Newsletter / Exclusive Deals Bar */}
      <section className="footer-newsletter-bar">
        <div className="footer-newsletter-content">
          <div className="footer-newsletter-headline">
            <span className="footer-newsletter-badge">
              <i className="bi bi-tag-fill"></i> EXCLUSIVE SAVINGS
            </span>
            <h3>Get ₹150 OFF your first order!</h3>
            <p>Subscribe to our newsletter for flash sales, secret coupons, and trending drops.</p>
          </div>
          <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
            <div className="footer-input-group">
              <i className="bi bi-envelope footer-input-icon"></i>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address for newsletter"
                required
              />
              <button type="submit" className="footer-newsletter-btn">
                <span>{subscribed ? 'Subscribed!' : 'Subscribe'}</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
            <span className="footer-form-subtext">No spam ever. Unsubscribe anytime.</span>
          </form>
        </div>
      </section>

      {/* Main 5-Column Navigation Links */}
      <div className="footer-main-grid">
        {/* Column 1: Brand & About */}
        <div className="footer-col footer-col--brand">
          <Link to="/" className="footer-brand" aria-label="ShopSphere Home">
            <span className="footer-brand-mark">
              <i className="bi bi-bag-heart-fill"></i>
            </span>
            <span className="footer-brand-name">
              shop<span>sphere</span>
            </span>
          </Link>
          <p className="footer-brand-desc">
            India's destination for everyday essentials, premium tech, trendy fashion, and thoughtful lifestyle finds. Loved by over 10 million happy shoppers nationwide.
          </p>

          <div className="footer-helpline">
            <div className="helpline-icon">
              <i className="bi bi-telephone-fill"></i>
            </div>
            <div>
              <span className="helpline-title">Toll-Free Customer Care</span>
              <a href="tel:18002029898" className="helpline-number">1800-202-9898</a>
              <span className="helpline-hours">9:00 AM – 9:00 PM (Mon – Sun)</span>
            </div>
          </div>
        </div>

        {/* Column 2: About Us */}
        <div className="footer-col">
          <h4 className="footer-col-title">About ShopSphere</h4>
          <ul className="footer-links">
            <li><Link to="/">About Us & Story</Link></li>
            <li><Link to="/">Careers & Culture</Link></li>
            <li><Link to="/">ShopSphere Wholesale</Link></li>
            <li><Link to="/">Sustainability & Green Packaging</Link></li>
            <li><Link to="/">Press Releases & Media</Link></li>
            <li><Link to="/">Corporate Governance</Link></li>
          </ul>
        </div>

        {/* Column 3: Customer Care & Help */}
        <div className="footer-col">
          <h4 className="footer-col-title">Customer Care</h4>
          <ul className="footer-links">
            <li><Link to="/orders">Track Your Order</Link></li>
            <li><Link to="/">Shipping & Delivery Rates</Link></li>
            <li><Link to="/">7-Day Returns & Exchange</Link></li>
            <li><Link to="/">Cancellations & Refunds</Link></li>
            <li><Link to="/">Help Center & FAQ</Link></li>
            <li><Link to="/">Report an Issue / Grievance</Link></li>
          </ul>
        </div>

        {/* Column 4: Top Categories */}
        <div className="footer-col">
          <h4 className="footer-col-title">Top Departments</h4>
          <ul className="footer-links">
            <li><Link to="/?search=electronics">Mobiles & Electronics</Link></li>
            <li><Link to="/?search=saree">Women's Ethnic & Sarees</Link></li>
            <li><Link to="/?search=men">Men's Casual & Fashion</Link></li>
            <li><Link to="/?search=kitchen">Home & Kitchen Cookware</Link></li>
            <li><Link to="/?search=beauty">Beauty, Skincare & Fragrance</Link></li>
            <li><Link to="/?search=book">Bestselling Books & Growth</Link></li>
          </ul>
        </div>

        {/* Column 5: Download App & Social */}
        <div className="footer-col">
          <h4 className="footer-col-title">Experience Mobile App</h4>
          <p className="footer-app-promo">Get exclusive app-only deals, early access drops, and live order tracking.</p>

          <div className="footer-app-badges">
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noreferrer"
              className="app-badge-btn"
              aria-label="Download on Google Play"
            >
              <i className="bi bi-google-play"></i>
              <div>
                <small>GET IT ON</small>
                <strong>Google Play</strong>
              </div>
            </a>

            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noreferrer"
              className="app-badge-btn"
              aria-label="Download on App Store"
            >
              <i className="bi bi-apple"></i>
              <div>
                <small>Download on the</small>
                <strong>App Store</strong>
              </div>
            </a>
          </div>

          <h5 className="footer-social-title">Follow Us & Stay Connected</h5>
          <div className="footer-social-icons">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <i className="bi bi-youtube"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <i className="bi bi-twitter-x"></i>
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" aria-label="Pinterest">
              <i className="bi bi-pinterest"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Payment Partners & Security Strip */}
      <div className="footer-payments-bar">
        <div className="footer-payments-inner">
          <div className="footer-payments-left">
            <span className="footer-payments-label">100% SECURE PAYMENT METHODS:</span>
            <div className="payment-badges-list">
              <span className="payment-badge" title="Unified Payments Interface">
                <i className="bi bi-qr-code-scan"></i> UPI
              </span>
              <span className="payment-badge" title="Google Pay">
                <i className="bi bi-google"></i> GPay
              </span>
              <span className="payment-badge" title="PhonePe">PhonePe</span>
              <span className="payment-badge" title="Paytm">Paytm</span>
              <span className="payment-badge" title="Visa Cards">
                <i className="bi bi-credit-card-2-front"></i> VISA
              </span>
              <span className="payment-badge" title="MasterCard">MasterCard</span>
              <span className="payment-badge" title="RuPay Card">RuPay</span>
              <span className="payment-badge" title="Net Banking">
                <i className="bi bi-bank"></i> NetBanking
              </span>
              <span className="payment-badge" title="Cash on Delivery">
                <i className="bi bi-cash-stack"></i> COD Available
              </span>
            </div>
          </div>

          <div className="footer-payments-right">
            <div className="security-seal">
              <i className="bi bi-shield-lock-fill"></i>
              <span>256-Bit SSL Encryption</span>
            </div>
            <div className="security-seal">
              <i className="bi bi-check-circle-fill"></i>
              <span>PCI-DSS Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <div className="footer-bottom-legal">
            <Link to="/">Privacy Notice</Link>
            <span className="sep">•</span>
            <Link to="/">Conditions of Use</Link>
            <span className="sep">•</span>
            <Link to="/">Interest-Based Ads</Link>
            <span className="sep">•</span>
            <Link to="/">Grievance Redressal</Link>
            <span className="sep">•</span>
            <Link to="/">Security & Trust</Link>
            <span className="sep">•</span>
            <Link to="/">Sitemap</Link>
          </div>

          <div className="footer-bottom-copy">
            <span>© {new Date().getFullYear()} ShopSphere Internet Private Limited. All Rights Reserved.</span>
            <span className="footer-country-tag">
              <span role="img" aria-label="India flag">🇮🇳</span> India (English / INR ₹)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
