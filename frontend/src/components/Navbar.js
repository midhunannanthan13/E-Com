import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const TRENDING_SEARCHES = [
  'Silk Saree',
  'Smart Watch',
  'Wireless Mouse',
  'Gaming Keyboard',
  'Denim Jacket',
  'Anarkali Kurti',
  'Electric Kettle',
  'Atomic Habits',
  'Face Serum',
  'Basmati Rice',
  'Yoga Mat',
  'Cricket Bat',
  'Protein Powder',
  'Baby Stroller',
  'Dash Camera',
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, cart } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [pincode, setPincode] = useState(() => localStorage.getItem('shopsphere_pincode') || '560001');
  const [editingPincode, setEditingPincode] = useState(false);
  const [tempPincode, setTempPincode] = useState(pincode);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchBoxRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  useEffect(() => {
    api.get('/products/categories/')
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Click outside listener for search suggestions & user dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/signin');
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setIsSearchFocused(false);
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set('search', searchInput.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/?${params.toString()}`);
  };

  const handleSelectSuggestion = (term) => {
    setSearchInput(term);
    setIsSearchFocused(false);
    const params = new URLSearchParams();
    params.set('search', term);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/?${params.toString()}`);
  };

  const handleSavePincode = (e) => {
    e.preventDefault();
    if (tempPincode.trim().length === 6) {
      setPincode(tempPincode.trim());
      localStorage.setItem('shopsphere_pincode', tempPincode.trim());
      setEditingPincode(false);
    }
  };

  return (
    <>
      {/* Top Utility & Location Bar */}
      <div className="top-utility-bar">
        <div className="top-utility-bar__inner">
          <div className="utility-left">
            <button
              type="button"
              className="pincode-picker-btn"
              onClick={() => setEditingPincode(true)}
              title="Change Delivery Location"
            >
              <i className="bi bi-geo-alt-fill"></i>
              <span>Deliver to <strong>{pincode}</strong></span>
              <i className="bi bi-chevron-down small-chevron"></i>
            </button>
            <span className="utility-badge">
              <i className="bi bi-lightning-charge-fill"></i> Super Saver Deals Live! Extra ₹150 OFF
            </span>
          </div>

          <div className="utility-right">
            <Link to="/" className="utility-link">Sell on ShopSphere</Link>
            <span className="utility-sep">|</span>
            <Link to="/orders" className="utility-link">Track Order</Link>
            <span className="utility-sep">|</span>
            <span className="utility-link"><i className="bi bi-headset"></i> 24x7 Help</span>
            <span className="utility-sep">|</span>
            <span className="utility-link"><i className="bi bi-phone"></i> Download App</span>
          </div>
        </div>
      </div>

      {/* Pincode Change Modal */}
      {editingPincode && (
        <div className="modal-backdrop-custom" onClick={() => setEditingPincode(false)}>
          <div className="pincode-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pincode-modal-header">
              <h5><i className="bi bi-geo-alt-fill text-primary"></i> Choose Delivery Location</h5>
              <button type="button" onClick={() => setEditingPincode(false)} className="btn-close-custom">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <p className="pincode-modal-desc">
              Enter your 6-digit delivery PIN code to check product availability and delivery timelines.
            </p>
            <form onSubmit={handleSavePincode} className="pincode-form">
              <input
                type="text"
                maxLength="6"
                placeholder="e.g. 560001"
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" disabled={tempPincode.length !== 6}>
                Apply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Header / Navigation */}
      <header className="main-navbar">
        <div className="main-navbar__inner">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand-pro" aria-label="ShopSphere Home">
            <span className="brand-logo-icon">
              <i className="bi bi-bag-heart-fill"></i>
            </span>
            <div className="brand-logo-text">
              <span className="brand-main">shop<span className="brand-accent">sphere</span></span>
              <span className="brand-tagline">Explore • Save • Smile</span>
            </div>
          </Link>

          {/* Search Bar with Category Select & Suggestions */}
          <div className="search-container" ref={searchBoxRef}>
            <form onSubmit={handleSearchSubmit} className="search-bar-pro" role="search">
              <select
                className="search-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by department"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="search-input-wrap">
                <input
                  type="search"
                  placeholder="Search products, brands, trends and more…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  aria-label="Search ShopSphere"
                  autoComplete="off"
                />
                {searchInput && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setSearchInput('');
                      navigate('/');
                    }}
                    aria-label="Clear search"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>

              <button type="submit" className="search-submit-btn" aria-label="Search">
                <i className="bi bi-search"></i>
              </button>
            </form>

            {/* Trending Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="search-suggestions-dropdown">
                <div className="suggestions-header">
                  <span><i className="bi bi-fire text-danger"></i> Trending Searches</span>
                </div>
                <div className="suggestions-tags">
                  {TRENDING_SEARCHES.map((term) => (
                    <button
                      type="button"
                      key={term}
                      className="suggestion-tag"
                      onMouseDown={() => handleSelectSuggestion(term)}
                    >
                      <i className="bi bi-arrow-up-right me-1"></i>
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navbar Actions */}
          <nav className="navbar-actions-pro" aria-label="Quick Actions">
            {/* Wishlist Link */}
            <Link to="/wishlist" className="action-item action-item--wishlist" aria-label="Wishlist">
              <div className="action-icon-wrap">
                <i className="bi bi-heart"></i>
                {wishlistCount > 0 && <span className="action-badge-count">{wishlistCount}</span>}
              </div>
              <span className="action-label">Wishlist</span>
            </Link>

            {/* Orders Link */}
            <Link to="/orders" className="action-item" aria-label="My Orders">
              <div className="action-icon-wrap">
                <i className="bi bi-box-seam"></i>
              </div>
              <span className="action-label">Orders</span>
            </Link>

            {/* User Account / Profile */}
            {isAuthenticated ? (
              <div className="user-dropdown-container" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-profile-btn"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-expanded={userMenuOpen}
                >
                  <div className="user-avatar-circle">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-info-text">
                    <small>Hello,</small>
                    <strong>{user?.username || 'Customer'}</strong>
                  </div>
                  <i className="bi bi-chevron-down ms-1 small"></i>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <strong>{user?.username}</strong>
                      <small className="text-muted">{user?.email}</small>
                    </div>
                    <div className="user-dropdown-divider"></div>
                    <Link to="/profile" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <i className="bi bi-person me-2"></i> My Profile
                    </Link>
                    <Link to="/orders" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <i className="bi bi-bag-check me-2"></i> Orders & Returns
                    </Link>
                    <Link to="/wishlist" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <i className="bi bi-heart me-2"></i> Wishlist ({wishlistCount})
                    </Link>
                    {isAdmin && (
                      <Link to="/manage" className="user-dropdown-item text-primary" onClick={() => setUserMenuOpen(false)}>
                        <i className="bi bi-sliders me-2"></i> Product Management
                      </Link>
                    )}
                    <div className="user-dropdown-divider"></div>
                    <button type="button" className="user-dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/signin" className="action-item action-item--login">
                <div className="action-icon-wrap">
                  <i className="bi bi-person"></i>
                </div>
                <div className="login-labels">
                  <small>Hello, Sign in</small>
                  <strong>Account & Lists</strong>
                </div>
              </Link>
            )}

            {/* Cart Link with Price Preview */}
            <Link to="/cart" className="action-cart-btn" aria-label={`Shopping Bag, ${itemCount} items`}>
              <div className="cart-icon-wrap">
                <i className="bi bi-cart3"></i>
                {itemCount > 0 && <span className="cart-count-badge">{itemCount}</span>}
              </div>
              <div className="cart-text-wrap">
                <span className="cart-title">Cart</span>
                {cart?.total_price > 0 && (
                  <span className="cart-price">₹{Number(cart.total_price).toLocaleString('en-IN')}</span>
                )}
              </div>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
