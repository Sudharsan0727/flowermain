import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import { ALL_PRODUCTS, EASTER_PRODUCTS, ROSES_PRODUCTS, BIRTHDAY_PRODUCTS } from '../data/products';

import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';

export default function Easter() {
  const [activeMainCollection, setActiveMainCollection] = useState('Easter');
  const [activeSubCategory, setActiveSubCategory] = useState(null);
  const [expandedCollection, setExpandedCollection] = useState(null); // No variants to expand by default

  const toggleExpand = (label) => {
    setExpandedCollection(prev => prev === label ? null : label);
  };

  const getSourceProducts = () => {
    switch(activeMainCollection) {
      case 'All': return ALL_PRODUCTS;
      case 'Easter': return EASTER_PRODUCTS;
      case 'Roses': return ROSES_PRODUCTS;
      case 'Birthday': return BIRTHDAY_PRODUCTS;
      default: return EASTER_PRODUCTS;
    }
  };

  const sourceProducts = getSourceProducts();
  
  // Calculate sub-category filtered items if a sub-category is selected
  const subFilteredProducts = activeSubCategory 
    ? sourceProducts.filter(p => p.category === activeSubCategory || (activeSubCategory === 'Easter Decor' && p.category === 'Easter')) 
    : sourceProducts;

  const maxVal = Math.max(...subFilteredProducts.map(p => parseInt(p.price.replace('$', '').split('.')[0]) || 0));
  const collections = [
    { label: 'All', count: ALL_PRODUCTS.length, link: '/' },
    { 
      label: 'Easter', 
      count: EASTER_PRODUCTS.length, 
      link: '/easter'
    },
    { 
      label: 'Roses', 
      count: ROSES_PRODUCTS.length, 
      link: '/roses'
    },
    { 
      label: 'Birthday', 
      count: BIRTHDAY_PRODUCTS.length, 
      link: '/birthday'
    },
    { 
      label: 'Sympathy', 
      count: 0, 
      link: '#',
      subCategories: ["Funeral Flowers", "Cremation and Memorial", "Casket Flowers", "Standing Sprays & Wreaths", "Sympathy Arrangements", "For The Home"]
    },
    { 
      label: 'Occasions', 
      count: 0, 
      link: '#',
      subCategories: ["Wedding Flowers", "Anniversary", "Birthday", "Get Well", "New Baby"]
    },
    { 
      label: 'Holidays', 
      count: 0, 
      link: '#',
      subCategories: ["Mother's Day", "Father's Day", "Christmas", "Valentine's Day"]
    }
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const { 
    addToCart, 
    toggleWishlist, 
    wishlistItems 
  } = useCart();
  const [priceRange, setPriceRange] = useState(maxVal);
  const [sortBy, setSortBy] = useState("price-low");

  // Reset price range when selection changes to ensure all products are visible
  useEffect(() => {
    setPriceRange(maxVal);
  }, [activeMainCollection, activeSubCategory, maxVal]);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = subFilteredProducts
    .filter(p => {
      const cost = parseInt(p.price.replace('$', '').split('.')[0]);
      if (cost > priceRange) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') {
        return parseInt(a.price.replace('$', '')) - parseInt(b.price.replace('$', ''));
      }
      if (sortBy === 'price-high') {
        return parseInt(b.price.replace('$', '')) - parseInt(a.price.replace('$', ''));
      }
      return 0;
    });


  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans text-slate-800">
      <Header isScrolled={isScrolled} activePage="easter" />

      {/* ── Page Header ── */}
      <section className="relative bg-violet-50 py-16 md:py-24 overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' }}>
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-brand-accent/10 blur-[80px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-brand-primary/10 blur-[80px] rounded-full" />
        </div>

        <div className="relative z-10 text-center space-y-4 px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brand-primary leading-tight tracking-tight capitalize">
            {activeMainCollection === 'ALL' ? 'Our Entire' : activeMainCollection.toLowerCase()} <span className="italic font-light text-brand-accent">Collection</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto font-light md:text-lg">
            {activeMainCollection === 'ALL' 
              ? 'Browse our complete artisanal archive, featuring every hand-crafted arrangement across all our signature boutiques.'
              : 'Celebrate the season of rebirth with our stunning array of spring blooms, carefully curated to bring joy and color to your gathering.'}
          </p>
        </div>
      </section>

      {/* ── Main Content Area (Sidebar + Grid) ── */}
      <section className="container mx-auto px-6 lg:px-12 py-16 flex flex-col lg:flex-row gap-12">

        {/* Sidebar Filter */}
        <aside className="w-full lg:w-1/4 space-y-10">

          {/* Search */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-slate-900 border-b border-slate-200 pb-2">Search</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
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
                
                return (
                  <li key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between group">
                      <button
                        onClick={() => {
                          setActiveMainCollection(item.label);
                          setActiveSubCategory(null); // Reset subcategory when switching main collections
                          if (hasSub) toggleExpand(item.label);
                        }}
                        className={`text-sm flex-grow text-left transition-colors flex items-center justify-between py-1 ${activeMainCollection === item.label ? 'text-brand-primary font-bold' : 'text-slate-500 hover:text-brand-primary'}`}
                      >
                        <span className="flex items-center gap-2">
                            {item.label}
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${activeMainCollection === item.label ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-50 text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary'}`}>
                              {item.count}
                            </span>
                        </span>
                        {activeMainCollection === item.label && <span className="w-1.5 h-1.5 rounded-full bg-brand-accent ml-2"></span>}
                      </button>
                      
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

                    {/* Sub Categories Accordion */}
                    {hasSub && isExpanded && (
                      <ul className="pl-4 space-y-2 border-l border-slate-100 ml-1 pb-2">
                        {item.subCategories.map(sub => {
                          // Try to get actual count if possible (only for current active collection's subcategories)
                          let subCount = 0;
                          if (item.label === 'EASTER') {
                             subCount = EASTER_PRODUCTS.filter(p => p.category === sub || (sub === 'Easter Decor' && p.category === 'Easter')).length;
                          } else if (item.label === 'ROSES') {
                             subCount = ROSES_PRODUCTS.filter(p => p.category === sub).length;
                          } else if (item.label === 'BIRTHDAY') {
                             subCount = BIRTHDAY_PRODUCTS.filter(p => p.category === sub).length;
                          }
                          
                          return (
                            <li key={sub}>
                              <button 
                                onClick={() => setActiveSubCategory(sub)}
                                className={`text-[13px] w-full text-left flex items-center justify-between group-sub transition-colors ${activeSubCategory === sub ? 'text-brand-primary font-bold' : 'text-slate-400 hover:text-brand-primary'}`}
                              >
                                <span>{sub}</span>
                                <span className="text-[8px] opacity-0 group-sub-hover:opacity-100 transition-opacity">({subCount})</span>
                              </button>
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
                max={maxVal}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-brand-primary"
              />
              <div className="flex justify-between items-center mt-4 text-sm font-bold text-slate-600">
                <span>Price: <span className="text-brand-primary">$0 - ${priceRange}</span></span>
                <button className="text-[10px] uppercase tracking-widest bg-slate-100 hover:bg-brand-primary hover:text-white px-3 py-1 rounded-full transition-colors">
                  Filter
                </button>
              </div>
            </div>
          </div>

        </aside>

        {/* Product Grid */}
        <div className="w-full lg:w-3/4">

          {/* Top Bar inside Grid */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
            <p className="text-sm text-slate-500">Showing 1–{filteredProducts.length} of {sourceProducts.length} results</p>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border border-slate-200 text-sm py-2 px-4 rounded-lg focus:outline-none focus:border-brand-primary"
            >
              <option value="price-low">Sort by price: low to high</option>
              <option value="price-high">Sort by price: high to low</option>
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col">
                <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 mb-4 cursor-pointer block">
                  {/* Image */}
                  <img
                    src={product.image}
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Badges */}
                  {product.badge && (
                    <span className={`absolute top-4 left-4 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full z-10 ${product.badge === 'Sale' ? 'bg-amber-400 text-slate-900' :
                        product.badge === 'Best Seller' ? 'bg-brand-primary text-white' :
                          'bg-white text-slate-800'
                      }`}>
                      {product.badge}
                    </span>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                      className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-800 hover:bg-brand-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg cursor-pointer"
                      title="Add to Cart"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
                      className={`w-12 h-12 bg-white rounded-full flex items-center justify-center transition-all transform translate-y-4 group-hover:translate-y-0 shadow-lg delay-75 cursor-pointer ${wishlistItems.some(item => item.id === product.id) ? 'text-brand-accent/90 focus:text-brand-accent hover:text-white' : 'text-slate-800 hover:text-white hover:bg-brand-primary'}`}
                      title="Add to Wishlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 pointer-events-none ${wishlistItems.some(item => item.id === product.id) ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    <span className="text-brand-accent font-bold">{product.price}</span>
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
              <h3 className="text-2xl font-serif text-slate-500 mb-2">No products found</h3>
              <p className="text-slate-400">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </section>
 
      <CartSidebar />
      <Footer />
    </div>
  );
}



