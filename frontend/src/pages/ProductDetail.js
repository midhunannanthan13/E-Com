import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [pincodeCheck, setPincodeCheck] = useState('560001');
  const [pincodeResult, setPincodeResult] = useState('Delivery in 2–3 Days | Cash on Delivery Available');
  const [adding, setAdding] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    api.get(`/products/products/${slug}/`)
      .then(({ data }) => {
        setProduct(data);
        setActiveImage(data.image_url || '');

        // Fetch related products in the same category
        if (data.category) {
          api.get('/products/products/', { params: { category: data.category } })
            .then((res) => {
              const others = (res.data.results || []).filter((p) => p.id !== data.id).slice(0, 4);
              setRelatedProducts(others);
            })
            .catch(() => setRelatedProducts([]));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast('Please sign in to add items to your cart.', 'warning');
      navigate('/signin', { state: { from: `/products/${slug}` } });
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      toast(`Added ${quantity} × “${product.name}” to your bag!`, 'success');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Could not add to cart.', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast('Please sign in to proceed with checkout.', 'warning');
      navigate('/signin', { state: { from: `/products/${slug}` } });
      return;
    }
    try {
      await addToCart(product.id, quantity);
      navigate('/checkout');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Could not initiate checkout.', 'error');
    }
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincodeCheck.trim().length === 6) {
      setPincodeResult(`Delivery to ${pincodeCheck} by Friday | FREE Shipping on this order`);
      toast(`PIN Code ${pincodeCheck} is serviceable!`, 'success');
    } else {
      toast('Please enter a valid 6-digit PIN code.', 'warning');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted">Loading product details…</p>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="container py-5 text-center">
        <div className="empty-state py-5">
          <i className="bi bi-exclamation-circle text-warning" style={{ fontSize: '3rem' }}></i>
          <h3 className="mt-3">Product Not Found</h3>
          <p className="text-muted">The product you are looking for may have been retired or moved.</p>
          <Link to="/" className="btn btn-primary mt-2">Back to ShopSphere</Link>
        </div>
      </div>
    );
  }

  const origPrice = product.original_price || (product.price * 1.35).toFixed(2);
  const discountPercent = product.discount_percent || Math.round((1 - product.price / origPrice) * 100);
  const isFav = isInWishlist(product.id);
  const reviewsCount = product.reviews_count || 320;

  return (
    <div className="product-detail-page container py-4">
      {/* Breadcrumb Navigation */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <i className="bi bi-chevron-right"></i>
        <Link to={`/?category=${product.category}`}>{product.category_name}</Link>
        <i className="bi bi-chevron-right"></i>
        <span className="current-crumb">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="row g-4 mt-2">
        {/* Left Column: Image Gallery */}
        <div className="col-12 col-lg-5">
          <div className="detail-image-gallery">
            <div className="detail-main-image-wrap">
              <img
                src={activeImage || product.image_url}
                alt={product.name}
                className="detail-main-image"
              />
              {product.badge && (
                <span className="detail-badge">
                  <i className="bi bi-patch-check-fill me-1"></i> {product.badge}
                </span>
              )}
              <button
                type="button"
                className={`detail-fav-btn ${isFav ? 'detail-fav-btn--active' : ''}`}
                onClick={() => toggleWishlist(product)}
                title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label="Wishlist"
              >
                <i className={`bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              </button>
            </div>

            {/* Micro thumbnail strip */}
            <div className="detail-thumb-strip">
              <button
                type="button"
                className="thumb-btn thumb-btn--active"
                onClick={() => setActiveImage(product.image_url)}
              >
                <img src={product.image_url} alt="Main view" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Purchase */}
        <div className="col-12 col-lg-7">
          <div className="detail-info-block">
            <div className="detail-brand-row">
              <span className="detail-cat-tag">{product.category_name}</span>
              <span className="detail-assured-pill">
                <i className="bi bi-shield-fill-check"></i> ShopSphere Assured
              </span>
            </div>

            <h1 className="detail-title">{product.name}</h1>

            {/* Ratings & Reviews summary */}
            <div className="detail-ratings-row">
              <div className="detail-star-pill">
                <span>{Number(product.rating).toFixed(1)}</span>
                <i className="bi bi-star-fill"></i>
              </div>
              <span className="detail-ratings-count">{reviewsCount.toLocaleString()} Ratings & Reviews</span>
              <span className="detail-sep">•</span>
              <span className="text-success fw-medium">Verified Authentic</span>
            </div>

            {/* Price Box */}
            <div className="detail-pricing-box">
              <div className="detail-price-main">
                <span className="detail-selling-price">
                  ₹{Number(product.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
                {origPrice > product.price && (
                  <span className="detail-mrp">
                    MRP ₹{Number(origPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="detail-discount-tag">{discountPercent}% OFF</span>
                )}
              </div>
              <span className="detail-tax-note">Inclusive of all taxes • Free Shipping</span>
            </div>

            {/* Special Offers & Bank Discounts (Amazon/Flipkart style) */}
            <div className="detail-offers-card">
              <div className="offers-header">
                <i className="bi bi-tag-fill text-danger me-2"></i>
                <strong>Available Offers & Promotions</strong>
              </div>
              <ul className="offers-list">
                <li>
                  <strong>Bank Offer:</strong> Flat ₹150 Instant Discount on SBI & HDFC Credit Cards on orders above ₹999.
                </li>
                <li>
                  <strong>Coupon Discount:</strong> Use code <span className="coupon-code">FIRST150</span> for extra ₹150 OFF your first order.
                </li>
                <li>
                  <strong>No Cost EMI:</strong> Available on major credit cards starting ₹125/month.
                </li>
              </ul>
            </div>

            {/* Description */}
            <div className="detail-desc-block">
              <h5>About this item</h5>
              <p>{product.description}</p>
            </div>

            {/* Delivery Pincode Checker */}
            <div className="detail-delivery-checker">
              <div className="checker-title">
                <i className="bi bi-geo-alt-fill text-primary me-1"></i> Check Delivery & Services
              </div>
              <form onSubmit={handleCheckPincode} className="checker-form">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-digit PIN"
                  value={pincodeCheck}
                  onChange={(e) => setPincodeCheck(e.target.value.replace(/\D/g, ''))}
                />
                <button type="submit" className="checker-btn">Check</button>
              </form>
              {pincodeResult && (
                <div className="checker-result">
                  <i className="bi bi-check-circle-fill text-success me-1"></i> {pincodeResult}
                </div>
              )}
            </div>

            {/* Stock Urgency and Quantity */}
            <div className="detail-stock-row">
              {product.in_stock ? (
                product.stock <= 5 ? (
                  <span className="badge-stock badge-stock--low">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i> Only {product.stock} items left in stock!
                  </span>
                ) : (
                  <span className="badge-stock badge-stock--ok">
                    <i className="bi bi-check2-circle me-1"></i> In Stock ({product.stock} available)
                  </span>
                )
              ) : (
                <span className="badge-stock badge-stock--out">
                  <i className="bi bi-x-circle me-1"></i> Currently Out of Stock
                </span>
              )}

              {product.in_stock && (
                <div className="qty-picker">
                  <span className="qty-label">Quantity:</span>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <span>{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: Add to Bag & Buy Now */}
            <div className="detail-action-buttons">
              <button
                type="button"
                className="btn-add-bag"
                disabled={!product.in_stock || adding}
                onClick={handleAddToCart}
              >
                {adding ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span> Adding…
                  </>
                ) : (
                  <>
                    <i className="bi bi-bag-plus-fill me-2"></i> Add to Bag
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-buy-now"
                disabled={!product.in_stock}
                onClick={handleBuyNow}
              >
                <i className="bi bi-lightning-charge-fill me-2"></i> Buy Now
              </button>
            </div>

            {/* Service & Trust Badges Strip */}
            <div className="detail-trust-props">
              <div className="prop-item">
                <i className="bi bi-arrow-repeat"></i>
                <span>7-Day Replacement</span>
              </div>
              <div className="prop-item">
                <i className="bi bi-shield-check"></i>
                <span>1-Year Warranty</span>
              </div>
              <div className="prop-item">
                <i className="bi bi-truck"></i>
                <span>Free Doorstep Delivery</span>
              </div>
              <div className="prop-item">
                <i className="bi bi-cash-coin"></i>
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Section */}
      <section className="detail-reviews-section mt-5">
        <h3 className="section-title">Customer Ratings & Reviews</h3>
        <div className="reviews-summary-card">
          <div className="rating-overall">
            <span className="rating-big-number">{Number(product.rating).toFixed(1)}</span>
            <div className="rating-stars">
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-half text-warning"></i>
            </div>
            <span className="rating-total-reviews">{reviewsCount} Verified Buyers</span>
          </div>

          <div className="rating-bars-breakdown">
            <div className="rating-bar-row">
              <span>5 ★</span>
              <div className="progress flex-grow-1 mx-2" style={{ height: '8px' }}>
                <div className="progress-bar bg-success" style={{ width: '74%' }}></div>
              </div>
              <small>74%</small>
            </div>
            <div className="rating-bar-row">
              <span>4 ★</span>
              <div className="progress flex-grow-1 mx-2" style={{ height: '8px' }}>
                <div className="progress-bar bg-success" style={{ width: '18%' }}></div>
              </div>
              <small>18%</small>
            </div>
            <div className="rating-bar-row">
              <span>3 ★</span>
              <div className="progress flex-grow-1 mx-2" style={{ height: '8px' }}>
                <div className="progress-bar bg-warning" style={{ width: '5%' }}></div>
              </div>
              <small>5%</small>
            </div>
            <div className="rating-bar-row">
              <span>2 ★</span>
              <div className="progress flex-grow-1 mx-2" style={{ height: '8px' }}>
                <div className="progress-bar bg-secondary" style={{ width: '2%' }}></div>
              </div>
              <small>2%</small>
            </div>
            <div className="rating-bar-row">
              <span>1 ★</span>
              <div className="progress flex-grow-1 mx-2" style={{ height: '8px' }}>
                <div className="progress-bar bg-danger" style={{ width: '1%' }}></div>
              </div>
              <small>1%</small>
            </div>
          </div>
        </div>
      </section>

      {/* Similar / Related Products Recommendations */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section mt-5">
          <div className="section-header mb-3">
            <h3 className="section-title">Similar Products You Might Like</h3>
            <Link to={`/?category=${product.category}`} className="see-all-link">
              See All in {product.category_name} <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="product-grid-pro">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={async (item) => {
                  if (!isAuthenticated) {
                    toast('Please sign in to add items to your cart.', 'warning');
                    navigate('/signin');
                    return;
                  }
                  await addToCart(item.id, 1);
                  toast(`Added “${item.name}” to bag!`, 'success');
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
