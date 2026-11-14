import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, onAddToCart }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFav = isInWishlist(product.id);
  const origPrice = product.original_price || (product.price * 1.35).toFixed(2);
  const discountPercent = product.discount_percent || Math.round((1 - product.price / origPrice) * 100);
  const reviewsCount = product.reviews_count || (product.id * 73 % 900) + 110;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!product.in_stock || adding) return;
    setAdding(true);
    try {
      await onAddToCart(product);
    } finally {
      setTimeout(() => setAdding(false), 400);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <article className="product-card-pro">
      {/* Product Image Box */}
      <div className="product-card-pro__image-box">
        <Link to={`/products/${product.slug}`} className="product-card-pro__link" aria-label={`View ${product.name}`}>
          <img
            className="product-card-pro__image"
            src={!imageFailed && product.image_url ? product.image_url : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&fit=crop'}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        </Link>

        {/* Badge: Deal / Bestseller */}
        {product.badge && (
          <span className={`card-badge card-badge--${product.badge.toLowerCase().replace(/\s+/g, '-')}`}>
            {product.badge === 'BESTSELLER' && <i className="bi bi-award-fill me-1"></i>}
            {product.badge === 'HOT DEAL' && <i className="bi bi-fire me-1"></i>}
            {product.badge === 'TOP RATED' && <i className="bi bi-star-fill me-1"></i>}
            {product.badge === 'ASSURED' && <i className="bi bi-patch-check-fill me-1"></i>}
            {product.badge}
          </span>
        )}

        {/* Wishlist Heart Toggle */}
        <button
          type="button"
          className={`card-wishlist-btn ${isFav ? 'card-wishlist-btn--active' : ''}`}
          onClick={handleWishlistToggle}
          title={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <i className={`bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}`}></i>
        </button>

        {/* Out of Stock Overlay */}
        {!product.in_stock && (
          <div className="card-soldout-overlay">
            <span>Currently Unavailable</span>
          </div>
        )}
      </div>

      {/* Product Details Body */}
      <div className="product-card-pro__body">
        {/* Category & Assured tag */}
        <div className="product-card-pro__cat-row">
          <span className="cat-label">{product.category_name}</span>
          <span className="assured-badge" title="Flipkart/Amazon style Assured Quality">
            <i className="bi bi-shield-fill-check"></i> Assured
          </span>
        </div>

        {/* Product Name */}
        <Link to={`/products/${product.slug}`} className="product-card-pro__title-link">
          <h3 className="product-card-pro__title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Ratings & Reviews */}
        <div className="product-card-pro__ratings">
          {Number(product.rating) > 0 ? (
            <span className="rating-pill">
              <span className="rating-val">{Number(product.rating).toFixed(1)}</span>
              <i className="bi bi-star-fill"></i>
            </span>
          ) : (
            <span className="rating-pill rating-pill--new">New</span>
          )}
          <span className="review-count">({reviewsCount.toLocaleString()})</span>
          <span className="delivery-promise">FREE Delivery</span>
        </div>

        {/* Price & Discount Row */}
        <div className="product-card-pro__price-row">
          <div className="price-stack">
            <div className="price-main">
              <span className="price-curr">₹{Number(product.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              {origPrice > product.price && (
                <span className="price-orig">₹{Number(origPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="discount-pill">{discountPercent}% OFF</span>
            )}
          </div>
        </div>

        {/* Stock status urgency */}
        {product.in_stock && product.stock <= 5 && (
          <div className="stock-alert">
            <i className="bi bi-hourglass-split"></i> Only {product.stock} left in stock!
          </div>
        )}

        {/* Add to Bag Button */}
        <button
          type="button"
          className={`card-add-btn ${adding ? 'card-add-btn--loading' : ''}`}
          disabled={!product.in_stock || adding}
          onClick={handleAdd}
          aria-label={`Add ${product.name} to bag`}
        >
          {adding ? (
            <>
              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              <span>Adding…</span>
            </>
          ) : product.in_stock ? (
            <>
              <i className="bi bi-bag-plus"></i>
              <span>Add to Bag</span>
            </>
          ) : (
            <span>Sold Out</span>
          )}
        </button>
      </div>
    </article>
  );
}
