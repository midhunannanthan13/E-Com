import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/Pagination';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 40;

// Exact high-resolution category avatars for circular category strip (Meesho/Flipkart style)
const CATEGORY_AVATARS = {
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop',
  "Men's Fashion": 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=200&h=200&fit=crop',
  "Women's Fashion": 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&h=200&fit=crop',
  'Beauty & Personal Care': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop',
  'Home & Kitchen': 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop',
  'Home Decor & Lighting': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&h=200&fit=crop',
  'Books & Learning': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=200&fit=crop',
  'Groceries & Essentials': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop',
  'Sports & Fitness': 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=200&h=200&fit=crop',
  'Toys & Baby Products': 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=200&h=200&fit=crop',
  'Health & Wellness': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
  'Stationery & Office': 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=200&h=200&fit=crop',
  'Automotive & Accessories': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=200&h=200&fit=crop',
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=200&fit=crop';

// Hero promotional banners
const HERO_SLIDES = [
  {
    id: 1,
    tag: 'FESTIVE BLOCKBUSTER SALE',
    title: 'Up to 60% OFF on Audio, Gadgets & Peripherals',
    sub: 'Upgrade your desk setup with top-rated wireless mice, mechanical keyboards and ANC earbuds.',
    bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
    cta: 'Explore Electronics',
    categorySearch: 'electronics',
    badge: 'Limited Time Deal',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&fit=crop',
  },
  {
    id: 2,
    tag: 'MEESHO & SHOPSY SPECIAL DROPS',
    title: 'Traditional Silk Sarees & Anarkali Sets from ₹499',
    sub: 'Authentic Banarasi handloom, pure cotton chikankari kurtis and festive luxury collections.',
    bg: 'linear-gradient(135deg, #831843 0%, #db2777 50%, #f43f5e 100%)',
    cta: 'Shop Women’s Fashion',
    categorySearch: 'saree',
    badge: 'Trending Now',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&fit=crop',
  },
  {
    id: 3,
    tag: 'SMART LIVING ESSENTIALS',
    title: 'Modern Cookware, Aromatherapy & Studio Lighting',
    sub: 'Transform your daily routine with non-stick granite cookware, diffusers, and warm ambient lamps.',
    bg: 'linear-gradient(135deg, #14532d 0%, #16a34a 50%, #10b981 100%)',
    cta: 'Shop Home & Kitchen',
    categorySearch: 'kitchen',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600&fit=crop',
  },
  {
    id: 4,
    tag: 'FARM FRESH & DAILY PANTRY',
    title: 'Organic Groceries, Cold-Pressed Oils & Dry Fruits',
    sub: 'Stock up your pantry with authentic Himalayan honey, unpolished dals, aged basmati & Kashmiri saffron.',
    bg: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #f59e0b 100%)',
    cta: 'Shop Groceries',
    categorySearch: 'rice',
    badge: '100% Organic',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&fit=crop',
  },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Flash sale countdown timer state (3 hours, 45 mins countdown)
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });

  // Quick filter states
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('');

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const ordering = searchParams.get('ordering') || '';

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const slideTimerRef = useRef(null);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hero carousel auto-advance
  useEffect(() => {
    slideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(slideTimerRef.current);
  }, []);

  // Fetch categories
  useEffect(() => {
    api.get('/products/categories/')
      .then(({ data }) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
  }, [search, categoryId, ordering, maxPriceFilter, inStockOnly, ratingFilter]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page };
      if (search) params.search = search;
      if (categoryId) params.category = categoryId;
      if (ordering) params.ordering = ordering;
      const { data } = await api.get('/products/products/', { params });
      let results = data.results || [];

      // Client-side quick filter adjustments if applied
      if (maxPriceFilter) {
        results = results.filter((p) => Number(p.price) <= Number(maxPriceFilter));
      }
      if (inStockOnly) {
        results = results.filter((p) => p.in_stock);
      }
      if (ratingFilter) {
        results = results.filter((p) => Number(p.rating) >= Number(ratingFilter));
      }

      setProducts(results);
      setCount(data.count || 0);
    } catch (err) {
      if (err.response?.status === 404 && page > 1) {
        setPage(1);
      } else {
        setError(err.response?.data?.detail || 'We could not load the products. Please try again.');
        setProducts([]);
        setCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryId, ordering, maxPriceFilter, inStockOnly, ratingFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast('Please sign in to add items to your cart.', 'warning');
      navigate('/signin', { state: { from: '/' } });
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast(`Added “${product.name}” to your cart! 🛍️`, 'success');
    } catch (err) {
      toast(err?.response?.data?.detail || 'Could not add this item to your cart.', 'error');
    }
  };

  const handleCategoryClick = (catId) => {
    const params = new URLSearchParams();
    if (catId) params.set('category', catId);
    if (ordering) params.set('ordering', ordering);
    navigate(`/?${params.toString()}`);
  };

  const currentCategoryObj = categories.find((c) => String(c.id) === categoryId);
  const pageHeading = search
    ? `Search Results for “${search}”`
    : currentCategoryObj
      ? currentCategoryObj.name
      : 'All Curated Finds & Deals';

  return (
    <div className="ecommerce-home">
      {/* Category Strip (Meesho & Flipkart style circular icons) */}
      <nav className="mega-category-strip" aria-label="Shop Departments">
        <div className="mega-category-strip__inner">
          <button
            type="button"
            className={`cat-pill ${!categoryId ? 'cat-pill--active' : ''}`}
            onClick={() => handleCategoryClick('')}
          >
            <div className="cat-avatar-wrap">
              <span className="cat-avatar-icon"><i className="bi bi-grid-fill"></i></span>
            </div>
            <span className="cat-pill-name">All Departments</span>
          </button>

          {categories.map((cat) => {
            const avatar = CATEGORY_AVATARS[cat.name] || DEFAULT_AVATAR;
            const isActive = categoryId === String(cat.id);
            return (
              <button
                type="button"
                key={cat.id}
                className={`cat-pill ${isActive ? 'cat-pill--active' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <div className="cat-avatar-wrap">
                  <img src={avatar} alt={cat.name} className="cat-avatar-img" loading="lazy" />
                </div>
                <span className="cat-pill-name">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Hero Carousel Banner Section */}
      {!search && !categoryId && (
        <section className="hero-carousel-section" aria-label="Featured Offers">
          <div className="hero-slider-wrap">
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`hero-slide ${idx === currentSlide ? 'hero-slide--active' : ''}`}
                style={{ background: slide.bg }}
              >
                <div className="hero-slide__inner">
                  <div className="hero-slide__text">
                    <span className="hero-tag-badge">
                      <i className="bi bi-stars"></i> {slide.tag}
                    </span>
                    <h1 className="hero-title">{slide.title}</h1>
                    <p className="hero-sub">{slide.sub}</p>
                    <div className="hero-action-row">
                      <button
                        type="button"
                        className="hero-cta-btn"
                        onClick={() => navigate(`/?search=${slide.categorySearch}`)}
                      >
                        <span>{slide.cta}</span>
                        <i className="bi bi-arrow-right"></i>
                      </button>
                      <span className="hero-perk-badge">
                        <i className="bi bi-shield-check"></i> {slide.badge}
                      </span>
                    </div>
                  </div>
                  <div className="hero-slide__img-box">
                    <img src={slide.image} alt={slide.title} className="hero-slide__img" />
                  </div>
                </div>
              </div>
            ))}

            {/* Slider Navigation Arrows */}
            <button
              type="button"
              className="slider-nav slider-nav--prev"
              onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              aria-label="Previous Slide"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              type="button"
              className="slider-nav slider-nav--next"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              aria-label="Next Slide"
            >
              <i className="bi bi-chevron-right"></i>
            </button>

            {/* Slider Dots */}
            <div className="slider-dots">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  type="button"
                  key={slide.id}
                  className={`slider-dot ${idx === currentSlide ? 'slider-dot--active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale Banner & Countdown Strip */}
      {!search && !categoryId && (
        <section className="flash-sale-strip">
          <div className="flash-sale-left">
            <div className="flash-fire-icon">
              <i className="bi bi-lightning-charge-fill"></i>
            </div>
            <div className="flash-title-block">
              <h3>⚡ FLASH DEALS OF THE DAY</h3>
              <p>Hurry! Top selling tech, sarees & cookware at lowest online prices.</p>
            </div>
          </div>

          <div className="flash-countdown-wrap">
            <span className="countdown-label">ENDS IN:</span>
            <div className="countdown-boxes">
              <span className="countdown-box">
                <strong>{String(timeLeft.hours).padStart(2, '0')}</strong>
                <small>HRS</small>
              </span>
              <span className="countdown-sep">:</span>
              <span className="countdown-box">
                <strong>{String(timeLeft.minutes).padStart(2, '0')}</strong>
                <small>MIN</small>
              </span>
              <span className="countdown-sep">:</span>
              <span className="countdown-box">
                <strong>{String(timeLeft.seconds).padStart(2, '0')}</strong>
                <small>SEC</small>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog Section */}
      <main className="catalog-container">
        {/* Breadcrumb & Filter Bar */}
        <div className="catalog-header-bar">
          <div className="catalog-header-left">
            <span className="catalog-breadcrumb">
              <Link to="/">Home</Link>
              <i className="bi bi-chevron-right"></i>
              {categoryId ? (
                <span>{currentCategoryObj?.name || 'Category'}</span>
              ) : search ? (
                <span>Search: “{search}”</span>
              ) : (
                <span>All Products</span>
              )}
            </span>
            <h2 className="catalog-title">{pageHeading}</h2>
            {!loading && !error && (
              <span className="catalog-count-badge">
                {products.length} {products.length === 1 ? 'item' : 'items'} found
              </span>
            )}
          </div>

          {/* Sorting & Filter Controls */}
          <div className="catalog-header-right">
            <div className="filter-controls-group">
              {/* Quick Filter: In Stock */}
              <label className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>

              {/* Price Filter dropdown */}
              <select
                className="filter-select-pro"
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(e.target.value)}
                aria-label="Filter by Price"
              >
                <option value="">All Prices</option>
                <option value="500">Under ₹500</option>
                <option value="1000">Under ₹1,000</option>
                <option value="2000">Under ₹2,000</option>
                <option value="3000">Under ₹3,000</option>
              </select>

              {/* Rating filter dropdown */}
              <select
                className="filter-select-pro"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                aria-label="Filter by Rating"
              >
                <option value="">All Ratings</option>
                <option value="4.5">4.5★ & Above</option>
                <option value="4.0">4.0★ & Above</option>
              </select>

              {/* Sort by dropdown */}
              <select
                className="filter-select-pro filter-select-pro--sort"
                value={ordering}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  if (e.target.value) params.set('ordering', e.target.value);
                  else params.delete('ordering');
                  navigate(`/?${params.toString()}`);
                }}
                aria-label="Sort products"
              >
                <option value="">Sort: Featured</option>
                <option value="-rating">Sort: Top Rated</option>
                <option value="price">Sort: Price Low to High</option>
                <option value="-price">Sort: Price High to Low</option>
                <option value="name">Sort: Name A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips bar (if any active) */}
        {(search || categoryId || maxPriceFilter || inStockOnly || ratingFilter) && (
          <div className="active-chips-strip">
            <span className="chips-title">Active Filters:</span>
            {search && (
              <span className="filter-chip">
                Search: “{search}”
                <button type="button" onClick={() => navigate('/')}><i className="bi bi-x"></i></button>
              </span>
            )}
            {categoryId && currentCategoryObj && (
              <span className="filter-chip">
                Category: {currentCategoryObj.name}
                <button type="button" onClick={() => handleCategoryClick('')}><i className="bi bi-x"></i></button>
              </span>
            )}
            {maxPriceFilter && (
              <span className="filter-chip">
                Max Price: ₹{maxPriceFilter}
                <button type="button" onClick={() => setMaxPriceFilter('')}><i className="bi bi-x"></i></button>
              </span>
            )}
            {ratingFilter && (
              <span className="filter-chip">
                Rating: {ratingFilter}★+
                <button type="button" onClick={() => setRatingFilter('')}><i className="bi bi-x"></i></button>
              </span>
            )}
            {inStockOnly && (
              <span className="filter-chip">
                In Stock Only
                <button type="button" onClick={() => setInStockOnly(false)}><i className="bi bi-x"></i></button>
              </span>
            )}
            <button
              type="button"
              className="clear-all-chips-btn"
              onClick={() => {
                setMaxPriceFilter('');
                setInStockOnly(false);
                setRatingFilter('');
                navigate('/');
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Product Grid Area */}
        {loading ? (
          <div className="catalog-loading-state" role="status">
            <div className="spinner-grow text-primary me-2" role="status"></div>
            <span>Fetching the best deals for you…</span>
          </div>
        ) : error ? (
          <div className="catalog-message-card" role="alert">
            <i className="bi bi-cloud-slash text-danger"></i>
            <h3>We couldn’t reach the catalog</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={loadProducts}>Try Again</button>
          </div>
        ) : products.length === 0 ? (
          <div className="catalog-message-card">
            <i className="bi bi-search text-muted"></i>
            <h3>No products found matching your filters</h3>
            <p>Try clearing filters or search for something else like "saree", "watch", or "mouse".</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setMaxPriceFilter('');
                setInStockOnly(false);
                setRatingFilter('');
                navigate('/');
              }}
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="product-grid-pro">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && count > PAGE_SIZE && (
          <div className="catalog-pagination">
            <Pagination
              count={count}
              pageSize={PAGE_SIZE}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>

      {/* Real E-Commerce Assurance Feature Strip */}
      <section className="ecommerce-feature-banner">
        <div className="feature-banner-col">
          <div className="feature-banner-icon"><i className="bi bi-shield-check"></i></div>
          <div>
            <h4>100% Genuine Guarantee</h4>
            <p>Products sourced directly from verified authorized manufacturers.</p>
          </div>
        </div>
        <div className="feature-banner-col">
          <div className="feature-banner-icon"><i className="bi bi-currency-rupee"></i></div>
          <div>
            <h4>Lowest Price Promise</h4>
            <p>Unmatched value with direct manufacturer pricing and everyday coupons.</p>
          </div>
        </div>
        <div className="feature-banner-col">
          <div className="feature-banner-icon"><i className="bi bi-truck-flatbed"></i></div>
          <div>
            <h4>Safe & Insured Delivery</h4>
            <p>Sanitized multi-layer protective packaging right to your doorstep.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
