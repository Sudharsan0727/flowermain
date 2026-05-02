import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import API_BASE from '../config';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageHelper';

export default function CollectionPage({ slug: propSlug }) {
  const { slug: paramSlug } = useParams();
  const slug = propSlug || paramSlug;

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState("price-low");
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedCollection, setExpandedCollection] = useState(null);

  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const { formatPrice } = useSettings();

  const fetchPageData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Config
      const configRes = await fetch(`${API_BASE}/api/collections/${slug}`, { credentials: 'include' });
      if (!configRes.ok) {
        // Fallback for safety if not in DB yet
        console.warn(`Collection ${slug} not found in database.`);
        setLoading(false);
        return;
      }
      const pageConfig = await configRes.json();
      setConfig(pageConfig);

      // 2. Fetch Products
      const prodRes = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
      const allData = await prodRes.json();
      setAllProducts(allData);

      // Filter based on fetched config
      const filtered = allData.filter(p => p[pageConfig.filter_field] === pageConfig.filter_value);
      setProducts(filtered);

      // Initial price range
      const prices = filtered.map(p => {
        const val = typeof p.price === 'string' ? parseFloat(p.price.replace(/[^\d.]/g, '')) : p.price;
        return val || 0;
      });
      const maxVal = prices.length > 0 ? Math.max(...prices) : 500;
      setPriceRange(maxVal);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching collection data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleExpand = (label) => {
    setExpandedCollection(prev => prev === label ? null : label);
  };

  const collections = [
    { label: 'All', count: allProducts.length, link: '/' },
    { label: 'Easter', count: allProducts.filter(p => p.category === 'Easter').length, link: '/easter' },
    { label: 'Roses', count: allProducts.filter(p => p.category === 'Roses').length, link: '/roses' },
    { label: 'Birthday', count: allProducts.filter(p => p.category === 'Birthday').length, link: '/birthday' },
    {
      label: 'Sympathy',
      count: allProducts.filter(p => p.category === 'Sympathy').length,
      link: '#',
      subCategories: ["Funeral Flowers", "Cremation and Memorial", "Casket Flowers", "Standing Sprays & Wreaths", "Sympathy Arrangements", "For The Home"]
    },
    {
      label: 'Occasions',
      count: allProducts.filter(p => p.category === 'Occasions').length || 0,
      link: '#',
      subCategories: ["Wedding Flowers", "Anniversary", "Birthday", "Get Well", "New Baby"]
    },
    {
      label: 'Holidays',
      count: allProducts.filter(p => p.category === 'Holidays').length || 0,
      link: '#',
      subCategories: ["Mother's Day", "Father's Day", "Christmas", "Valentine's Day"]
    }
  ];

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const curPrice = typeof p.price === 'string' ? parseFloat(p.price.replace(/[^\d.]/g, '')) : p.price;
      const matchesPrice = curPrice <= priceRange;
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      const priceA = typeof a.price === 'string' ? parseFloat(a.price.replace(/[^\d.]/g, '')) : a.price;
      const priceB = typeof b.price === 'string' ? parseFloat(b.price.replace(/[^\d.]/g, '')) : b.price;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      return 0;
    });

  const maxPossiblePrice = Math.max(...(products.length > 0 ? products.map(p => {
    const val = typeof p.price === 'string' ? parseFloat(p.price.replace(/[^\d.]/g, '')) : p.price;
    return val || 0;
  }) : [500]));

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!config || config.is_active === false) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4 px-6 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h2 className="text-3xl font-serif text-slate-900 tracking-tight">Collection Not Available</h2>
        <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
          The collection you're looking for is currently offline or has been moved to a new location.
        </p>
        <div className="pt-6">
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-950 text-white rounded-2xl font-bold hover:bg-brand-primary transition-all shadow-xl shadow-slate-200 active:scale-95">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
   <div className="min-h-screen bg-[#fcfcfc] font-sans text-slate-800 overflow-x-hidden">
      <Header isScrolled={isScrolled} activePage={slug} />

      {/* ── Page Header ── */}
      <section className={`relative ${config.bg_class} py-16 md:py-24 overflow-hidden flex items-center justify-center`} style={{ background: config.bg_gradient }}>
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-white/20 blur-[80px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-brand-primary/10 blur-[80px] rounded-full" />
        </div>

        <div className="relative z-10 text-center space-y-4 px-6">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif ${config.title_class} leading-tight tracking-tight capitalize`}>
            {config.title} <span className="italic font-light text-brand-accent">{config.accent_title}</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto font-light md:text-lg">
            {config.description}
          </p>
        </div>
      </section>

      {/* ── Main Content Area ── */}
      <section className="container mx-auto px-6 lg:px-12 py-16 flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 space-y-10">
          {/* Search */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-slate-900 border-b border-slate-200 pb-2">Search</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-colors text-sm"
              />
              <svg className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-slate-900 border-b border-slate-200 pb-2">Categories</h3>
            <ul className="space-y-3">
              {collections.map(item => {
                const isExpanded = expandedCollection === item.label;
                const hasSub = item.subCategories && item.subCategories.length > 0;
                const isCurrent = (slug === item.label.toLowerCase()) ||
                  (item.label === 'Sympathy' && (slug === 'funeral-flowers' || slug === 'cremation-memorial'));

                return (
                  <li key={item.label}>
                    <div className="flex items-center justify-between group">
                      <Link
                        to={item.link !== '#' ? item.link : '#'}
                        className={`text-sm flex-grow flex items-center justify-between py-1 transition-colors ${isCurrent ? 'text-brand-primary font-bold' : 'text-slate-500 hover:text-brand-primary'}`}
                      >
                        <span className="flex items-center gap-2">
                          {item.label}
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${isCurrent ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-50 text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary'}`}>
                            {item.count}
                          </span>
                        </span>
                      </Link>
                      {hasSub && (
                        <button
                          onClick={() => toggleExpand(item.label)}
                          className={`p-1 text-slate-300 hover:text-brand-primary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="stroke-current">
                            <path d="M1 1L5 5L9 1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {hasSub && isExpanded && (
                      <ul className="pl-4 space-y-2 border-l border-slate-100 ml-1 mt-2 mb-2">
                        {item.subCategories.map(sub => {
                          const subSlug = sub.toLowerCase().replace(/ /g, '-').replace(/&/g, '');
                          const isSubActive = slug === (sub === 'Funeral Flowers' ? 'funeral-flowers' : sub === 'Cremation and Memorial' ? 'cremation-memorial' : subSlug);

                          return (
                            <li key={sub}>
                              <Link
                                to={sub === 'Funeral Flowers' ? '/funeral-flowers' : sub === 'Cremation and Memorial' ? '/cremation-memorial' : '#'}
                                className={`text-[13px] w-full text-left flex items-center justify-between group-sub transition-colors ${isSubActive ? 'text-brand-primary font-bold' : 'text-slate-400 hover:text-brand-primary'}`}
                              >
                                <span>{sub}</span>
                                {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Price Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-slate-900 border-b border-slate-200 pb-2">Filter by Price</h3>
            <div className="pt-2">
              <input
                type="range"
                min="0"
                max={maxPossiblePrice}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-brand-primary"
              />
              <div className="flex justify-between items-center mt-4 text-sm font-bold text-slate-600">
                <span>Price: <span className="text-brand-primary">{formatPrice(0)} - {formatPrice(priceRange)}</span></span>
                <button className="text-[10px] uppercase tracking-widest bg-slate-100 hover:bg-brand-primary hover:text-white px-3 py-1 rounded-full transition-colors">
                  Filter
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
            <p className="text-sm text-slate-500">Showing all {filteredProducts.length} results for {config.title} {config.accentTitle}</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-slate-200 text-sm py-2 px-4 rounded-lg focus:outline-none focus:border-brand-primary"
            >
              <option value="price-low">Sort by price: low to high</option>
              <option value="price-high">Sort by price: high to low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-slate-500 font-medium">Gathering arrangements...</p>
              </div>
            ) : filteredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col">
                <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 mb-4 cursor-pointer block">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {product.badge && (
                    <span className={`absolute top-4 left-4 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full z-10 ${product.badge === 'Sale' ? 'bg-amber-400 text-slate-900' : product.badge === 'Best Seller' ? 'bg-brand-primary text-white' : 'bg-white text-slate-800'}`}>
                      {product.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-800 hover:bg-brand-primary hover:text-white transition-all shadow-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
                      className={`w-12 h-12 bg-white rounded-full flex items-center justify-center transition-all shadow-lg ${wishlistItems.some(item => item.id === product.id) ? 'text-brand-accent' : 'text-slate-800 hover:text-white hover:bg-brand-primary'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${wishlistItems.some(item => item.id === product.id) ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </Link>
                <div className="space-y-1">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-serif text-lg text-slate-900 group-hover:text-brand-primary transition-colors cursor-pointer text-center">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-brand-accent font-bold">{formatPrice(product.price)}</span>
                    {product.stock <= 0 ? (
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">In Stock: {product.stock}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-2xl font-serif text-slate-500 mb-2">No arrangements found</h3>
              <p className="text-slate-400">Please check back soon for our curated selection.</p>
            </div>
          )}
        </div>
      </section>

      <CartSidebar />
      <Footer />
    </div>
  );
}



