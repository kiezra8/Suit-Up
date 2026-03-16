import React, { useState, useEffect, useRef } from 'react';
import { products, categories, banners } from './data';
import './index.css';

const App = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [currentBanner, setCurrentBanner] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [headerScrolled, setHeaderScrolled] = useState(false);
    const [activeNav, setActiveNav] = useState('home');
    const [cartBounce, setCartBounce] = useState(false);

    // Filtered products
    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const trendingProducts = products.slice(0, 6);

    // Auto-play banner
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Scroll listener
    useEffect(() => {
        const handleScroll = () => {
            setHeaderScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const formatUGX = (amount) => `UGX ${amount.toLocaleString()}`;

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const addToCart = (product) => {
        setCart([...cart, product]);
        setCartBounce(true);
        setTimeout(() => setCartBounce(false), 500);
        showToast(`Added ${product.name} to cart!`);
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const toggleWishlist = (id) => {
        const newWishlist = new Set(wishlist);
        if (newWishlist.has(id)) {
            newWishlist.delete(id);
            showToast('Removed from wishlist');
        } else {
            newWishlist.add(id);
            showToast('Added to wishlist ❤️');
        }
        setWishlist(newWishlist);
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };

    const handleCategoryClick = (catId) => {
        setIsLoading(true);
        setActiveCategory(catId);
        setTimeout(() => {
            setIsLoading(false);
            window.scrollTo({ top: document.querySelector('.products-section').offsetTop - 100, behavior: 'smooth' });
        }, 600);
    };

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryFee = cart.length > 0 ? 5000 : 0;
    const total = subtotal + deliveryFee;

    const orderOnWhatsApp = () => {
        if (cart.length === 0) {
            showToast('Your cart is empty!');
            return;
        }

        let message = 'Hello! I would like to order the following items:%0A%0A';
        cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} - ${formatUGX(item.price)}%0A`;
        });
        message += `%0ASubtotal: ${formatUGX(subtotal)}%0A`;
        message += `Delivery: ${formatUGX(deliveryFee)}%0A`;
        message += `*Total: ${formatUGX(total)}*%0A%0A`;
        message += 'Please confirm my order. Thank you!';

        const whatsappUrl = `https://wa.me/256702370441?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="app-container">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <header className={`header ${headerScrolled ? 'scrolled' : ''}`}>
                <div className="header-top">
                    <div className="logo" onClick={() => handleCategoryClick('all')}>Suit Up</div>
                    <div className="search-bar">
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            placeholder="Search suits, dresses..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="header-icons">
                        <i className="far fa-user"></i>
                    </div>
                </div>
            </header>

            <main>
                <section className="banners-container">
                    <div 
                        className="banner-slider" 
                        style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                    >
                        {banners.map((banner, index) => (
                            <div key={banner.id} className={`banner ${currentBanner === index ? 'active' : ''}`}>
                                <img src={banner.image} alt={banner.title} />
                                <div className="banner-overlay">
                                    <h3>{banner.title}</h3>
                                    <p>{banner.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="banner-dots">
                        {banners.map((_, i) => (
                            <div 
                                key={i} 
                                className={`banner-dot ${currentBanner === i ? 'active' : ''}`}
                                onClick={() => setCurrentBanner(i)}
                            ></div>
                        ))}
                    </div>
                </section>

                <section className="categories-section">
                    <div className="section-header">
                        <h2 className="section-title">Categories</h2>
                        <span className="see-all" onClick={() => handleCategoryClick('all')}>
                            See All <i className="fas fa-chevron-right"></i>
                        </span>
                    </div>
                    <div className="categories-grid">
                        <div 
                            className={`category-item ${activeCategory === 'all' ? 'filter-active' : ''}`}
                            onClick={() => handleCategoryClick('all')}
                        >
                            <div className="category-icon">
                                <i className="fas fa-th-large"></i>
                            </div>
                            <span className="category-name">All</span>
                        </div>
                        {categories.map(cat => (
                            <div 
                                key={cat.id} 
                                className={`category-item ${activeCategory === cat.id ? 'filter-active' : ''}`}
                                onClick={() => handleCategoryClick(cat.id)}
                            >
                                <div className="category-icon">
                                    <img src={cat.image} alt={cat.name} />
                                </div>
                                <span className="category-name">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {activeCategory === 'all' && searchQuery === '' && (
                    <section className="trending-section">
                        <div className="trending-container">
                            <div className="section-header">
                                <h2 className="section-title">Trending Now</h2>
                            </div>
                            <div className="trending-carousel">
                                {trendingProducts.map(product => (
                                    <div key={product.id} className="trending-item" onClick={() => handleProductClick(product)}>
                                        <span className="trending-badge">HOT</span>
                                        <img src={product.image} alt={product.name} />
                                        <div className="trending-info">
                                            <div className="trending-name">{product.name}</div>
                                            <div className="trending-price">
                                                {formatUGX(product.price)}
                                                <span className="trending-old-price">{formatUGX(product.oldPrice)}</span>
                                            </div>
                                            <button 
                                                className="add-to-cart-btn"
                                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <section className="products-section">
                    <div className="section-header">
                        <h2 className="section-title" id="productsTitle">
                            {activeCategory === 'all' ? 'All Products' : categories.find(c => c.id === activeCategory)?.name}
                        </h2>
                    </div>
                    <div className="products-grid">
                        {filteredProducts.map(product => {
                            const discount = Math.round((1 - product.price / product.oldPrice) * 100);
                            return (
                                <div key={product.id} className="product-card" onClick={() => handleProductClick(product)}>
                                    <div className="product-image-container">
                                        <img src={product.image} alt={product.name} className="product-image" />
                                        <div 
                                            className={`product-wishlist ${wishlist.has(product.id) ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                        >
                                            <i className={`${wishlist.has(product.id) ? 'fas' : 'far'} fa-heart`}></i>
                                        </div>
                                        <span className="product-discount">-{discount}%</span>
                                    </div>
                                    <div className="product-info">
                                        <div className="product-name">{product.name}</div>
                                        <div className="product-price-row">
                                            <span className="product-price">{formatUGX(product.price)}</span>
                                            <span className="product-old-price">{formatUGX(product.oldPrice)}</span>
                                        </div>
                                        <div className="product-rating">
                                            <i className="fas fa-star"></i>
                                            <span>{product.rating} ({product.reviews})</span>
                                        </div>
                                        <div className="product-actions">
                                            <button 
                                                className="btn-add-cart"
                                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                            >
                                                <i className="fas fa-cart-plus"></i> Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>

            <footer className="bottom-nav">
                <div className={`nav-item ${activeNav === 'home' ? 'active' : ''}`} onClick={() => setActiveNav('home')}>
                    <i className="fas fa-home"></i>
                    <span>Home</span>
                </div>
                <div className={`nav-item ${activeNav === 'categories' ? 'active' : ''}`} onClick={() => { setActiveNav('categories'); handleCategoryClick('all'); }}>
                    <i className="fas fa-grid-2"></i>
                    <span>Categories</span>
                </div>
                <div className="nav-item" onClick={() => setIsCartOpen(true)}>
                    <i className="fas fa-shopping-bag"></i>
                    <span>Cart</span>
                </div>
                <div className={`nav-item ${activeNav === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveNav('wishlist')}>
                    <i className="fas fa-heart"></i>
                    <span>Wishlist</span>
                </div>
                <div className={`nav-item ${activeNav === 'account' ? 'active' : ''}`} onClick={() => setActiveNav('account')}>
                    <i className="fas fa-user"></i>
                    <span>Account</span>
                </div>
            </footer>

            <div 
                className={`cart-counter-bubble ${cartBounce ? 'bounce' : ''}`}
                onClick={() => setIsCartOpen(true)}
            >
                {cart.length}
            </div>

            {isCartOpen && (
                <div className="cart-modal-overlay" onClick={() => setIsCartOpen(false)}>
                    <div className="cart-content" onClick={(e) => e.stopPropagation()}>
                        <div className="cart-header">
                            <h2 className="cart-title">Your Cart</h2>
                            <div className="cart-close" onClick={() => setIsCartOpen(false)}>
                                <i className="fas fa-times"></i>
                            </div>
                        </div>
                        <div className="cart-items">
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                    <i className="fas fa-shopping-cart" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
                                    <p>Your cart is empty</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={index} className="cart-item">
                                        <img src={item.image} alt={item.name} className="cart-item-image" />
                                        <div className="cart-item-details">
                                            <div className="cart-item-name">{item.name}</div>
                                            <div className="cart-item-price">{formatUGX(item.price)}</div>
                                        </div>
                                        <div className="cart-item-remove" onClick={() => removeFromCart(index)}>
                                            <i className="fas fa-trash-alt"></i>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {cart.length > 0 && (
                            <div className="cart-total">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <span>{formatUGX(subtotal)}</span>
                                </div>
                                <div className="total-row">
                                    <span>Delivery Fee</span>
                                    <span>{formatUGX(deliveryFee)}</span>
                                </div>
                                <div className="total-row final">
                                    <span>Total</span>
                                    <span>{formatUGX(total)}</span>
                                </div>
                                <button className="whatsapp-btn" onClick={orderOnWhatsApp}>
                                    <i className="fab fa-whatsapp"></i> Order on WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedProduct && (
                <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-close" onClick={() => setSelectedProduct(null)}>
                            <i className="fas fa-times"></i>
                        </div>
                        <div className="modal-body">
                            <div className="modal-image">
                                <img src={selectedProduct.image} alt={selectedProduct.name} />
                            </div>
                            <div className="modal-info">
                                <h2 className="modal-title">{selectedProduct.name}</h2>
                                <div className="modal-price">
                                    <span className="current-price">{formatUGX(selectedProduct.price)}</span>
                                    <span className="old-price">{formatUGX(selectedProduct.oldPrice)}</span>
                                </div>
                                <div className="modal-rating">
                                    <i className="fas fa-star"></i>
                                    <span>{selectedProduct.rating} ({selectedProduct.reviews} verified reviews)</span>
                                </div>
                                <p className="modal-description">
                                    Experience premium quality with our {selectedProduct.name}. Crafted from the finest materials, this piece from our {selectedProduct.category} collection combines timeless style with modern comfort.
                                </p>
                                <div className="modal-features">
                                    <div className="feature"><i className="fas fa-shipping-fast"></i> Fast Delivery</div>
                                    <div className="feature"><i className="fas fa-check-circle"></i> Best Quality</div>
                                    <div className="feature"><i className="fas fa-headset"></i> 24/7 Support</div>
                                </div>
                                <button className="modal-add-btn" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                                    <i className="fas fa-cart-plus"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`toast ${toast ? 'show' : ''}`}>
                {toast}
            </div>
        </div>
    );
};

export default App;
