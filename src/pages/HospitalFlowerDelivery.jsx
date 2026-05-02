import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HealingImg1 from '../assets/lush-purple-floral-bouquet-golden-vase-adorning-home-decor.jpg';
import HealingImg2 from '../assets/bouquet-pale-rose-flowers-glass-vase.jpg';
import HealingImg3 from '../assets/purple-bouquet.jpg';
import HospitalBouquet from '../assets/hospital-bouquet.png';
import API_BASE from '../config';
import { getImageUrl } from '../utils/imageHelper';

// sideProducts remain static as requested (or can be dynamic if needed, but keeping for now)
const sideProducts = [
  { id: 1, name: "Healing Grace Bouquet", price: "$65.00", image: HealingImg1 },
  { id: 2, name: "Sunshine Recovery", price: "$49.00", image: HealingImg2 },
  { id: 3, name: "Peaceful Lilies", price: "$75.00", image: HealingImg3 }
];

export default function HospitalFlowerDelivery() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [content, setContent] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    fetchData();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchData = async () => {
    try {
      const [contentRes, facilitiesRes] = await Promise.all([
        fetch(`${API_BASE}/api/hospital/content`),
        fetch(`${API_BASE}/api/hospital/facilities`)
      ]);
      const contentData = await contentRes.json();
      const facilitiesData = await facilitiesRes.json();
      setContent(contentData);
      setFacilities(facilitiesData);
    } catch (error) {
      console.error("Error fetching hospital data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedFacilities = facilities.reduce((acc, facility) => {
    if (facility.status !== 'Active') return acc;
    if (!acc[facility.city]) acc[facility.city] = [];
    acc[facility.city].push(facility);
    return acc;
  }, {});

  const filteredGroups = Object.keys(groupedFacilities).map(city => ({
    city,
    facilities: groupedFacilities[city].filter(f =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.facilities.length > 0);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header isScrolled={isScrolled} />

      {/* ── Page Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-900 text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[140px] -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <nav className="text-[10px] uppercase tracking-[0.4em] text-brand-primary font-black mb-4 flex gap-2">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <span className="opacity-30">/</span>
                <span className="opacity-100 italic">Hospital Delivery</span>
              </nav>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-serif leading-[1.1]"
              >
                {content?.bannerTitle || 'Healing & Wellness'} <br />
                <span className="italic font-light text-brand-primary">{content?.bannerSubtitle || 'Hospital Delivery'}</span>
              </motion.h1>
              <p className="max-w-xl text-slate-400 text-lg font-light leading-relaxed">
                {content?.bannerDescription || 'Bringing comfort and sunshine to your loved ones. We coordinate directly with local medical centers to ensure your flowers are delivered fresh to patient rooms.'}
              </p>
            </div>
            <div className="hidden lg:block relative">
              <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                <img src={content?.bannerImage ? getImageUrl(content.bannerImage) : HospitalBouquet} alt="Hospital Bouquet" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 lg:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* ── Left Content ── */}
          <div className="lg:w-3/4 space-y-12">

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder="Search facility by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
            </div>

            {/* Introductory Text */}
            <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed border-l-2 border-brand-primary/30 pl-6 py-2">
              <p>
                {content?.introText || 'Gallatin Flower & Gift Shoppe provides direct, hand-delivered arrangements to patients and staff across all major medical facilities listed below. To ensure a seamless delivery, please have the patient\'s full name and room number prepared during checkout.'}
              </p>
            </div>

            {/* Facility Registry */}
            <div className="space-y-12">
              {filteredGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary pb-2 border-b-2 border-brand-primary/10 inline-block">{group.city}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {group.facilities.map((fac, fIdx) => (
                      <div key={fIdx} className="group grid grid-cols-1 md:grid-cols-12 items-center p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all gap-4">
                        <div className="md:col-span-12 lg:col-span-5">
                          <h4 className="font-serif text-lg text-slate-900 group-hover:text-brand-primary transition-colors">{fac.name}</h4>
                        </div>
                        <div className="md:col-span-8 lg:col-span-5 text-sm text-slate-500">
                          {fac.address}
                        </div>
                        <div className="md:col-span-4 lg:col-span-2 text-right">
                          <a href={`tel:${fac.phone}`} className="text-xs font-bold text-slate-400 hover:text-brand-primary transition-all flex items-center justify-end gap-2 group-hover:text-slate-900">
                            <span>📞</span> {fac.phone}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredGroups.length === 0 && (
                <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 italic">
                  No matching facilities found in our current delivery registry.
                </div>
              )}
            </div>

            {/* Guidelines at Bottom (Vedas Style) */}
            <div className="pt-12 mt-12 border-t border-slate-100">
              <h3 className="text-xl font-serif text-slate-900 mb-6 italic">Delivery Guidelines</h3>
              <div className="bg-slate-50 p-8 rounded-3xl">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">1</span>
                    <div>
                      <h5 className="font-bold text-sm mb-1 uppercase tracking-wider">Patient Details</h5>
                      <p className="text-xs text-slate-500">Provide the patient's full registered name and room number (if available).</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">2</span>
                    <div>
                      <h5 className="font-bold text-sm mb-1 uppercase tracking-wider">Unit Access</h5>
                      <p className="text-xs text-slate-500">Check if the patient is in ICU or CCU, as these units often restrict fresh flowers.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">3</span>
                    <div>
                      <h5 className="font-bold text-sm mb-1 uppercase tracking-wider">Timed Delivery</h5>
                      <p className="text-xs text-slate-500">Hospitals typically accept deliveries between 9:00 AM and 5:00 PM.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">4</span>
                    <div>
                      <h5 className="font-bold text-sm mb-1 uppercase tracking-wider">Discharge Status</h5>
                      <p className="text-xs text-slate-500">We verify the patient is still admitted before the driver departs for the facility.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* ── Right Content: Sidebar ── */}
          <div className="lg:w-1/4 space-y-8">
            <div className="sticky top-32 space-y-8">

              <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] space-y-6">
                <h4 className="text-xl font-serif italic text-brand-primary">Need help?</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-light">Can't find the facility or need a custom arrangement for recovery?</p>
                <div className="pt-4 space-y-4">
                  <a href="tel:615-452-4545" className="block w-full py-4 bg-brand-primary text-white text-center rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-transform">Call Us Now</a>
                  <p className="text-center text-[10px] font-bold text-white/50 uppercase tracking-widest">(615) 452-4545</p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-4">Healing Favorites</h4>
                <div className="space-y-4">
                  {sideProducts.map(product => (
                    <Link key={product.id} to={`/product/${product.id}`} className="group flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-50 hover:shadow-lg hover:shadow-slate-100 transition-all">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        <h5 className="text-[11px] font-bold text-slate-900 truncate">{product.name}</h5>
                        <p className="text-[10px] text-brand-primary font-black uppercase tracking-wider">{product.price}</p>
                        <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded">Quick Buy</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <CartSidebar />
      <Footer />
    </div>
  );
}
