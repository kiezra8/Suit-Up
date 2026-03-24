import React, { useState, useEffect } from 'react';
import { products as localProducts, categories as localCategories, banners as localBanners } from './data';
import { supabase } from './supabaseClient';
import AdminPanel from './AdminPanel';
import './index.css';

const App = () => {
    const [products, setProducts] = useState(localProducts);
    const [categories, setCategories] = useState(localCategories);
    const [banners, setBanners] = useState(localBanners);
    const [user, setUser] = useState(null);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoginLoading, setIsLoginLoading] = useState(false);

    const [activeNav, setActiveNav] = useState('home'); // home, categories, wishlist, account, categoryDetails, admin
    const [activeCategory, setActiveCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [currentBanner, setCurrentBanner] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [headerScrolled, setHeaderScrolled] = useState(false);
    const [cartBounce, setCartBounce] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Filtered products
    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const trendingProducts = products.slice(0, 6);

    // Data fetching & Auth state
    useEffect(() => {
        const fetchRemoteData = async () => {
            const [pRes, cRes, bRes] = await Promise.all([
                supabase.from('products').select('*'),
                supabase.from('categories').select('*'),
                supabase.from('banners').select('*')
            ]);
            
            if (pRes.data && pRes.data.length > 0) setProducts(pRes.data);
            if (cRes.data && cRes.data.length > 0) setCategories(cRes.data);
            if (bRes.data && bRes.data.length > 0) setBanners(bRes.data);
        };
        fetchRemoteData();

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Auto-play banner
    useEffect(() => {
        if (banners.length === 0) return;
        const interval = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners]);

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
        setActiveNav('categoryDetails');
        setTimeout(() => {
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 400);
    };

    const resetHome = () => {
        setIsLoading(true);
        setActiveNav('home');
        setActiveCategory('all');
        setSearchQuery('');
        setTimeout(() => {
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 400);
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

    const ProductCard = ({ product }) => {
        const discount = Math.round((1 - product.price / product.oldPrice) * 100);
        return (
            <div className="product-card" onClick={() => handleProductClick(product)}>
                <div className="product-image-container">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <div className={`product-wishlist ${wishlist.has(product.id) ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}>
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
                        <button className="btn-add-cart" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                            <i className="fas fa-cart-plus"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="app-container">
            {isLoading && <div className="loading-overlay"><div className="loading-spinner"></div></div>}
            
            <header className={`header ${headerScrolled ? 'scrolled' : ''}`}>
                <div className="header-top">
                    <div className="logo" onClick={resetHome}>Suit Up</div>
                    <div className="search-bar">
                        <i className="fas fa-search"></i>
                        <input 
                            type="text" 
                            placeholder="Search suits, dresses..." 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (activeNav !== 'home') setActiveNav('home');
                            }}
                        />
                    </div>
                    <div className="header-icons" onClick={() => setActiveNav('account')}>
                        <i className="far fa-user"></i>
                    </div>
                </div>
            </header>

            <main style={{ minHeight: '100vh', padding: '10px 15px' }}>
                {activeNav === 'home' && (
                    <>
                        <section className="banners-container">
                            <div className="banner-slider">
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
                                    <div key={i} className={`banner-dot ${currentBanner === i ? 'active' : ''}`} onClick={() => setCurrentBanner(i)}></div>
                                ))}
                            </div>
                        </section>

                        <section className="categories-section">
                            <div className="section-header">
                                <h2 className="section-title">Categories</h2>
                                <span className="see-all" onClick={() => setActiveNav('categories')}>
                                    See All <i className="fas fa-chevron-right"></i>
                                </span>
                            </div>
                            <div className="categories-grid">
                                {categories.map(cat => (
                                    <div key={cat.id} className="category-item" onClick={() => handleCategoryClick(cat.id)}>
                                        <div className="category-icon">
                                            <img src={cat.image} alt={cat.name} />
                                        </div>
                                        <span className="category-name">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {searchQuery === '' && (
                            <section className="trending-section">
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
                                                <button className="add-to-cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="products-section" style={{ padding: '20px 0' }}>
                            <div className="section-header">
                                <h2 className="section-title">Featured Collections</h2>
                            </div>
                            <div className="products-grid">
                                {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                            </div>
                        </section>
                    </>
                )}

                {activeNav === 'categories' && (
                    <section className="categories-page">
                        <div className="section-header" style={{ marginBottom: '30px' }}>
                            <h2 className="section-title">Explore Categories</h2>
                        </div>
                        <div className="categories-large-grid">
                            {categories.map(cat => (
                                <div key={cat.id} className="category-card-large" onClick={() => handleCategoryClick(cat.id)}>
                                    <div className="category-card-image">
                                        <img src={cat.image} alt={cat.name} />
                                    </div>
                                    <h3 style={{ textAlign: 'center', fontSize: '15px', fontWeight: '700', marginTop: '10px' }}>{cat.name}</h3>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {activeNav === 'categoryDetails' && (
                    <section className="category-details-page">
                        <div className="section-header" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div className="back-circle-btn" onClick={() => setActiveNav('categories')}>
                                    <i className="fas fa-arrow-left"></i>
                                </div>
                                <h2 className="section-title">{categories.find(c => c.id === activeCategory)?.name}</h2>
                            </div>
                        </div>
                        <div className="products-grid">
                            {filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    </section>
                )}

                {activeNav === 'wishlist' && (
                    <section className="wishlist-page">
                        <div className="section-header" style={{ marginBottom: '20px' }}>
                            <h2 className="section-title">My Wishlist ({products.filter(p => wishlist.has(p.id)).length})</h2>
                        </div>
                        {products.filter(p => wishlist.has(p.id)).length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>
                                <i className="far fa-heart" style={{ fontSize: '64px', marginBottom: '20px' }}></i>
                                <p>Nothing here yet.</p>
                                <button onClick={resetHome} className="modal-add-btn" style={{ marginTop: '20px', width: 'auto', padding: '12px 30px' }}>Explore Styles</button>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {products.filter(p => wishlist.has(p.id)).map(product => <ProductCard key={product.id} product={product} />)}
                            </div>
                        )}
                    </section>
                )}

                {activeNav === 'account' && (
                    <section className="account-page">
                        <div className="section-header" style={{ marginBottom: '30px' }}>
                            <h2 className="section-title">Profile</h2>
                        </div>
                        {!user ? (
                            <div style={{ background: '#fff', padding: '25px', borderRadius: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>Welcome Back</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <button 
                                            onClick={async () => {
                                                if (!loginEmail || !loginPassword) {
                                                    showToast('Enter email and password');
                                                    return;
                                                }
                                                setIsLoginLoading(true);
                                                const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
                                                if (error) {
                                                    showToast(`Login error: ${error.message}`);
                                                } else {
                                                    showToast('Logged in successfully!');
                                                }
                                                setIsLoginLoading(false);
                                            }}
                                            style={{ padding: '12px', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            {isLoginLoading ? '...' : 'Login'}
                                        </button>

                                        <button 
                                            onClick={async () => {
                                                if (!loginEmail || !loginPassword) {
                                                    showToast('Enter email and password');
                                                    return;
                                                }
                                                setIsLoginLoading(true);
                                                const { error } = await supabase.auth.signUp({ 
                                                    email: loginEmail, 
                                                    password: loginPassword,
                                                    options: { emailRedirectTo: window.location.origin }
                                                });
                                                if (error) {
                                                    showToast(`Signup error: ${error.message}`);
                                                } else {
                                                    showToast('Success! Check your email to confirm or log in.');
                                                }
                                                setIsLoginLoading(false);
                                            }}
                                            style={{ padding: '12px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>Creating an account lets you wishlist items and access the dashboard.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="account-profile" style={{ background: '#fff', padding: '25px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px', fontWeight: '800', boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)' }}>
                                        {user.email[0].toUpperCase()}
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</h3>
                                        <p style={{ color: '#888', fontSize: '14px' }}>Member</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div className="account-menu-item"><div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><i className="fas fa-box"></i><span>My Orders</span></div><i className="fas fa-chevron-right"></i></div>
                                    <div className="account-menu-item" onClick={() => setActiveNav('wishlist')}><div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><i className="fas fa-heart"></i><span>Wishlist</span></div><i className="fas fa-chevron-right"></i></div>
                                    
                                    {user.email === 'israelezrakisakye@gmail.com' && (
                                        <div className="account-menu-item" onClick={() => setActiveNav('admin')} style={{ background: '#fff5e6', border: '1px solid #ffca28', cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#f57f17' }}>
                                                <i className="fas fa-cog"></i><span style={{ fontWeight: 'bold' }}>Admin Dashboard</span>
                                            </div>
                                            <i className="fas fa-chevron-right" style={{ color: '#f57f17' }}></i>
                                        </div>
                                    )}

                                    <div className="account-menu-item" onClick={async () => { await supabase.auth.signOut(); showToast('Logged out'); }} style={{ marginTop: '20px', background: '#fff0f0', cursor: 'pointer' }}><div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#ff6b6b' }}><i className="fas fa-sign-out-alt"></i><span>Log Out</span></div></div>
                                </div>
                            </>
                        )}
                    </section>
                )}
                
                {activeNav === 'admin' && user?.email === 'israelezrakisakye@gmail.com' && (
                    <AdminPanel onBack={() => setActiveNav('account')} />
                )}
            </main>

            <footer className="bottom-nav">
                <div className={`nav-item ${activeNav === 'home' ? 'active' : ''}`} onClick={resetHome}>
                    <i className="fas fa-home"></i>
                    <span>Home</span>
                </div>
                <div className={`nav-item ${activeNav === 'categories' || activeNav === 'categoryDetails' ? 'active' : ''}`} onClick={() => setActiveNav('categories')}>
                    <i className="fas fa-th-large"></i>
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

            {cart.length > 0 && (
                <div className={`cart-counter-bubble ${cartBounce ? 'bounce' : ''}`} onClick={() => setIsCartOpen(true)}>
                    {cart.length}
                </div>
            )}

            {isCartOpen && (
                <div className="cart-modal-overlay" onClick={() => setIsCartOpen(false)}>
                    <div className="cart-content" onClick={(e) => e.stopPropagation()}>
                        <div className="cart-header">
                            <h2 className="cart-title">Your Cart</h2>
                            <div className="cart-close" onClick={() => setIsCartOpen(false)}><i className="fas fa-times"></i></div>
                        </div>
                        <div className="cart-items">
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                    <i className="fas fa-shopping-cart" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
                                    <p>Cart is empty</p>
                                </div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={index} className="cart-item">
                                        <img src={item.image} alt={item.name} className="cart-item-image" />
                                        <div className="cart-item-details">
                                            <div className="cart-item-name">{item.name}</div>
                                            <div className="cart-item-price">{formatUGX(item.price)}</div>
                                        </div>
                                        <div className="cart-item-remove" onClick={() => removeFromCart(index)}><i className="fas fa-trash-alt"></i></div>
                                    </div>
                                ))
                            )}
                        </div>
                        {cart.length > 0 && (
                            <div className="cart-total">
                                <div className="total-row"><span>Subtotal</span><span>{formatUGX(subtotal)}</span></div>
                                <div className="total-row"><span>Delivery</span><span>{formatUGX(deliveryFee)}</span></div>
                                <div className="total-row final"><span>Total</span><span>{formatUGX(total)}</span></div>
                                <button className="whatsapp-btn" onClick={orderOnWhatsApp}><i className="fab fa-whatsapp"></i> Order on WhatsApp</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedProduct && (
                <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-close" onClick={() => setSelectedProduct(null)}><i className="fas fa-times"></i></div>
                        <div className="modal-body">
                            <div className="modal-image"><img src={selectedProduct.image} alt={selectedProduct.name} /></div>
                            <div className="modal-info">
                                <h2 className="modal-title">{selectedProduct.name}</h2>
                                <div className="modal-price">
                                    <span className="current-price">{formatUGX(selectedProduct.price)}</span>
                                    <span className="old-price">{formatUGX(selectedProduct.oldPrice)}</span>
                                </div>
                                <div className="modal-rating"><i className="fas fa-star"></i><span>{selectedProduct.rating} ({selectedProduct.reviews} reviews)</span></div>
                                <p className="modal-description">Premium quality {selectedProduct.name}. Crafted for comfort and style.</p>
                                <div className="modal-features">
                                    <div className="feature"><i className="fas fa-shipping-fast"></i> Delivery</div>
                                    <div className="feature"><i className="fas fa-check-circle"></i> Quality</div>
                                    <div className="feature"><i className="fas fa-headset"></i> Support</div>
                                </div>
                                <button className="modal-add-btn" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}><i className="fas fa-cart-plus"></i> Add to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
        </div>
    );
};

export default App;
