import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FuneralImg1 from '../assets/bouquet-pale-rose-flowers-glass-vase.jpg';
import FuneralImg2 from '../assets/lush-purple-floral-bouquet-golden-vase-adorning-home-decor.jpg';
import FuneralImg3 from '../assets/roses-bouquet-with-orange-yellow-roses-mimosa-dark-background.jpg';
import FuneralHero from '../assets/funeral-arrangement.png';
import API_BASE from '../config';
import { getImageUrl } from '../utils/imageHelper';
const sideProducts = [
  { id: 4, name: "Eternal Tribute Wreath", price: "$120.00", image: FuneralImg1 },
  { id: 5, name: "Serenity Heart Spray", price: "$145.00", image: FuneralImg2 },
  { id: 6, name: "Blessing Basket", price: "$85.00", image: FuneralImg3 }
];

export default function FuneralFlowerDelivery() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [content, setContent] = useState(null);
  const [funeralHomes, setFuneralHomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, facilitiesRes] = await Promise.all([
          fetch(`${API_BASE}/api/funeral/content`),
          fetch(`${API_BASE}/api/funeral/facilities`)
        ]);
        
        if (contentRes.ok) {
            setContent(await contentRes.json());
        }
        
        if (facilitiesRes.ok) {
            const data = await facilitiesRes.json();
            const grouped = {};
            data.forEach(facility => {
                if (facility.status !== 'Active') return;
                if (!grouped[facility.city]) {
                    grouped[facility.city] = [];
                }
                grouped[facility.city].push(facility);
            });
            const formatted = Object.keys(grouped).map(city => ({
                city,
                facilities: grouped[city]
            }));
            setFuneralHomes(formatted);
        }
      } catch (err) {
        console.error("Failed to load funeral data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredFacilities = funeralHomes.map(group => ({
    ...group,
    facilities: group.facilities.filter(f => 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      group.city.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.facilities.length > 0);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header isScrolled={isScrolled} />
      
      {/* ── Page Hero ── */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-950 text-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[140px] -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
                <nav className="text-[10px] uppercase tracking-[0.4em] text-brand-primary font-black mb-4 flex gap-2">
                    <Link to="/" className="hover:text-white transition-colors">Home</Link>
                    <span className="opacity-30">/</span>
                    <span className="opacity-100 italic">Funeral Services</span>
                </nav>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-serif leading-[1.1]"
                >
                    {content?.bannerTitle || 'Funeral & Memorial'} <br />
                    <span className="italic font-light text-brand-primary">{content?.bannerSubtitle || 'Delivery Services'}</span>
                </motion.h1>
                <p className="max-w-xl text-slate-400 text-lg font-light leading-relaxed">
                    {content?.bannerDescription || 'A tribute of beauty and respect. We coordinate directly with funeral homes to ensure your sympathy flowers arrive on time for the service.'}
                </p>
            </div>
            <div className="hidden lg:block relative">
                <div className="aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                    <img src={content?.bannerImage ? getImageUrl(content.bannerImage) : FuneralHero} alt="Funeral Arrangement" className="w-full h-full object-cover" />
                </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-6 lg:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* ── Left Content ── */}
          <div className="lg:w-3/4 space-y-12">
            
            {/* Search */}
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Find a funeral home or memorial park..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-14 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:bg-white focus:border-brand-primary transition-all shadow-sm"
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 text-xl">🏛️</span>
            </div>

            {/* Introductory Content */}
            <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed border-l-4 border-brand-primary pl-8 py-4 bg-slate-50/50 rounded-r-3xl">
                <p className="mb-4">
                    {content?.introText || "Gallatin Flower & Gift Shoppe maintains a prestigious partnership with the nation's most respected funeral directors. From our flagship New York boutique at 450 Park Avenue, we coordinate delicate logistics to ensure every tribute is placed with dignity."}
                </p>
                <p className="italic text-brand-primary font-medium">{content?.introSubtext || "Please provide the name of the deceased and the service start time during checkout."}</p>
            </div>

            {/* Registry */}
            <div className="space-y-12">
              {filteredFacilities.map((group, gIdx) => (
                <div key={gIdx} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">{group.city}</h3>
                    <div className="h-px flex-grow bg-slate-100"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {group.facilities.map((fac, fIdx) => (
                      <div key={fIdx} className="group grid grid-cols-1 md:grid-cols-12 items-center p-6 rounded-[2rem] border border-slate-50 hover:bg-slate-50 hover:border-slate-100 transition-all gap-6">
                        <div className="md:col-span-6">
                          <h4 className="font-serif text-xl text-slate-900 mb-1">{fac.name}</h4>
                          <p className="text-xs text-slate-400 font-medium tracking-wide">{fac.address}</p>
                        </div>
                        <div className="md:col-span-4 text-sm text-slate-500 font-light">
                          Verified Service Partner
                        </div>
                        <div className="md:col-span-2 text-right">
                          <a href={`tel:${fac.phone}`} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all">
                            <span>📞</span> {fac.phone}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredFacilities.length === 0 && (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-400 italic font-light">
                  No funeral facilities found in our current coordinate directory.
                </div>
              )}
            </div>

            {/* Etiquette & Guidelines */}
            <div className="pt-8 space-y-8">
                <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-serif italic text-slate-900">Sympathy Etiquette</h3>
                    <div className="h-px flex-grow bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-slate-950 text-white rounded-[2.5rem] space-y-4 shadow-xl">
                        <div className="text-2xl text-brand-primary font-serif italic">The Delivery Window</div>
                        <p className="text-xs text-slate-400 leading-relaxed font-light">We schedule sympathy deliveries to arrive at least two hours before the viewing or service begins to allow funeral directors time for proper placement.</p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-4 border border-slate-100">
                        <div className="text-2xl text-slate-900 font-serif italic">Card Messaging</div>
                        <p className="text-xs text-slate-500 leading-relaxed font-light">If you are unsure of what to say, our specialists can assist with traditional messages of comfort or custom inscriptions for your tribute ribbons.</p>
                    </div>
                </div>
            </div>

          </div>

          {/* ── Sidebar ── */}
          <div className="lg:w-1/4 space-y-10">
            <div className="sticky top-32 space-y-10">
                
                <div className="p-10 bg-brand-primary text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                    <h4 className="text-2xl font-serif italic mb-4">Dedicated Support</h4>
                    <p className="text-xs text-white/80 leading-relaxed font-light mb-8">Dealing with loss is difficult. Let us handle the details of your floral tribute.</p>
                    <a href="tel:212-263-5800" className="block w-full py-4 bg-white text-brand-primary text-center rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-slate-900 hover:text-white transition-all">Direct Specialist Line</a>
                </div>

                <div className="space-y-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900 border-b border-slate-100 pb-6">Honorary Tributes</h4>
                    <div className="space-y-6">
                        {sideProducts.map(product => (
                            <Link key={product.id} to={`/product/${product.id}`} className="group block space-y-4">
                                <div className="aspect-square rounded-[2rem] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 shadow-sm hover:shadow-xl">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                </div>
                                <div className="space-y-1 text-center">
                                    <h5 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{product.name}</h5>
                                    <p className="text-[10px] text-brand-primary font-black tracking-[0.2em]">{product.price}</p>
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
