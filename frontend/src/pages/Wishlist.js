import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleMoveToCart = async (product) => {
    if (!isAuthenticated) {
      toast('Please sign in to add items to your cart.', 'warning');
      navigate('/signin', { state: { from: '/wishlist' } });
      return;
    }
    try {
      await addToCart(product.id, 1);
      removeFromWishlist(product.id);
      toast(`Moved “${product.name}” to your cart!`, 'success');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Could not add to cart.', 'error');
    }
  };

  return (
    <div className="wishlist-page container py-4">
      <div className="wishlist-header mb-4">
        <div>
          <h1 className="wishlist-title">
            <i className="bi bi-heart-fill text-danger me-2"></i> My Wishlist
          </h1>
          <p className="text-muted">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>
        <Link to="/" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-1"></i> Continue Shopping
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-state text-center py-5">
          <div className="empty-icon mb-3">
            <i className="bi bi-heartbreak" style={{ fontSize: '3.5rem', color: '#cbd5e1' }}></i>
          </div>
          <h3>Your wishlist is empty</h3>
          <p className="text-muted mb-4">
            Explore our bestselling products and tap the heart icon to save your favourites!
          </p>
          <Link to="/" className="btn btn-primary px-4 py-2">
            Start Exploring Deals
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {wishlist.map((item) => {
            const origPrice = item.original_price || (item.price * 1.35).toFixed(2);
            return (
              <div key={item.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="wishlist-card">
                  <div className="wishlist-card__image-wrap">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="wishlist-card__image"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      className="wishlist-card__remove"
                      onClick={() => removeFromWishlist(item.id)}
                      title="Remove from wishlist"
                      aria-label="Remove item"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                    {item.badge && <span className="wishlist-card__badge">{item.badge}</span>}
                  </div>

                  <div className="wishlist-card__body">
                    <span className="wishlist-card__cat">{item.category_name}</span>
                    <Link to={`/products/${item.slug}`} className="wishlist-card__name">
                      {item.name}
                    </Link>

                    <div className="wishlist-card__pricing">
                      <span className="current-price">
                        ₹{Number(item.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                      {origPrice > item.price && (
                        <span className="original-price">
                          ₹{Number(origPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      )}
                      {item.discount_percent > 0 && (
                        <span className="discount-tag">{item.discount_percent}% OFF</span>
                      )}
                    </div>

                    <div className="wishlist-card__actions mt-3">
                      <button
                        type="button"
                        className="btn btn-primary w-100 btn-sm"
                        onClick={() => handleMoveToCart(item)}
                        disabled={item.in_stock === false}
                      >
                        <i className="bi bi-bag-plus me-1"></i>
                        {item.in_stock === false ? 'Out of Stock' : 'Move to Bag'}
                      </button>
                    </div>
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
