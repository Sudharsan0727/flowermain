import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { AnimatedTestimonials } from '../components/ui/AnimatedTestimonials'
import Footer from '../components/Footer'
import Header from '../components/Header'
import CartSidebar from '../components/CartSidebar'
import API_BASE from '../config';
import { useSettings } from '../context/SettingsContext';
import { getImageUrl } from '../utils/imageHelper';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

// Local Assets
import HeroPrimary from '../assets/woman-holding-bouquet-purple-lilacs-roses-hand.jpg'
import HeroSecondary from '../assets/purple-bouquet.jpg'
import HeroTertiary from '../assets/lush-purple-floral-bouquet-golden-vase-adorning-home-decor.jpg'

import { FEATURED_PRODUCTS, Prod1, Prod2, Prod3 } from '../data/products';
const SLIDER_PRODUCTS = FEATURED_PRODUCTS;

function WhyChooseUs() {
  const [benefits, setBenefits] = useState([]);
  const [sectionSettings, setSectionSettings] = useState({
    whychooseus_tagline: "Our Commitment",
    whychooseus_heading: "Why Choose The Boutique?",
    whychooseus_description: ""
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/benefits`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const actives = data.filter(b => b.status === 'Active');
        setBenefits(actives);
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=whychooseus`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  if (benefits.length === 0) return <div className="h-[400px] animate-pulse bg-slate-50/50" />;

  const headingParts = sectionSettings.whychooseus_heading
    ? sectionSettings.whychooseus_heading.split(' ')
    : [];
  const lastWord = headingParts.slice(-1).join(' ');
  const restHeading = headingParts.slice(0, -1).join(' ');

  return (
    <div className="container mx-auto px-8 relative z-10">
      <div className="flex flex-col items-center mb-16 text-center">
        <span className="text-brand-primary text-[10px] font-black tracking-[0.4em] uppercase mb-4">
          {sectionSettings.whychooseus_tagline}
        </span>
        <h2 className="text-3xl md:text-4xl font-serif text-slate-900 leading-tight">
          {restHeading} <span className="italic text-brand-primary">{lastWord}</span>
        </h2>
        {sectionSettings.whychooseus_description && (
          <p className="text-slate-500 font-light text-sm mt-4 max-w-xl">
            {sectionSettings.whychooseus_description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((item, index) => (
          <div key={item.id} className="group relative bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-10 hover:bg-white hover:shadow-[0_20px_60px_-15px_rgba(76,29,149,0.12)] transition-all duration-500">
            <div className="absolute top-8 right-10 text-6xl font-serif italic text-brand-primary/[0.03] select-none">
              {String(index + 1).padStart(2, '0')}
            </div>

            <div className="space-y-6 relative z-10">
              <div className="w-16 h-16 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 rotate-3 group-hover:rotate-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-serif text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-light">{item.description}</p>
              </div>

              {/* <div className="pt-4 flex items-center gap-2 text-brand-primary text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <span>Learn More</span>
                <span className="w-6 h-[1px] bg-brand-primary"></span>
              </div> */}


            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExploreCategories() {
  const [categories, setCategories] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sectionSettings, setSectionSettings] = useState({
    explorecategories_tagline: "Seasonal Edits",
    explorecategories_heading: "Explore Categories",
    explorecategories_quote: '"Every flower is a soul blossoming in nature."'
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const actives = data.filter(c => c.status === 'Active');
        setCategories(actives);
        // Start in the middle of our triple-set to allow immediate back-scrolling
        setCurrentIndex(actives.length);
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=explorecategories`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isHovered || categories.length === 0) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, categories, currentIndex]);

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => prev - 1);
  };

  if (categories.length === 0) return <div className="h-[600px] animate-pulse bg-slate-50/50" />;

  // Triple clone for seamless infinite sliding
  const loopCategories = [...categories, ...categories, ...categories];
  const cardWidth = 200 + 32; // width + gap

  // Invisible jump reset for infinite feel
  if (currentIndex >= categories.length * 2) {
    setTimeout(() => setCurrentIndex(categories.length), 0);
  } else if (currentIndex < categories.length) {
    setTimeout(() => setCurrentIndex(categories.length * 2 - 1), 0);
  }

  const headingWords = sectionSettings.explorecategories_heading
    ? sectionSettings.explorecategories_heading.split(' ')
    : ['Explore', 'Categories'];
  const lastWord = headingWords.slice(-1)[0];
  const restHeading = headingWords.slice(0, -1).join(' ');

  return (
    <section
      className="bg-slate-50/50 py-24 relative overflow-hidden group/section"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-10 right-10 text-[10rem] font-serif italic text-brand-primary/[0.03] rotate-12 select-none pointer-events-none">
        Curation
      </div>

      <div className="container mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4">
            <span className="text-brand-primary text-[10px] font-black tracking-[0.5em] uppercase">{sectionSettings.explorecategories_tagline}</span>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
              {restHeading} <span className="italic text-brand-primary font-serif">{lastWord}</span>
            </h2>
          </div>
          {sectionSettings.explorecategories_quote && (
            <p className="text-slate-500 text-sm font-light max-w-xs text-right hidden lg:block italic leading-relaxed">
              {sectionSettings.explorecategories_quote}
            </p>
          )}
        </div>

        <div className="relative">

          <div className="hidden md:block">
            <button
              onClick={handlePrev}
              className="absolute -left-6 top-1/2 -translate-y-12 w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all active:scale-95 shadow-xl z-20 opacity-0 group-hover/section:opacity-100"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute -right-6 top-1/2 -translate-y-12 w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all active:scale-95 shadow-xl z-20 opacity-0 group-hover/section:opacity-100"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>

          <div className="flex overflow-hidden -mx-12 px-12">
            <motion.div
              className="flex gap-8 py-12"
              animate={{
                x: -currentIndex * cardWidth,
              }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
            >
              {loopCategories.map((cat, i) => (
                <Link
                  key={`${cat.id}-${i}`}
                  to={cat.link || '#'}
                  className={`group block relative shrink-0 w-[200px] ${i % 2 !== 0 ? 'xl:translate-y-8' : ''} transition-all duration-700`}
                >
                  <div className={`relative aspect-[4/5] ${cat.shape} overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500 bg-slate-200 mx-auto`}>
                    <img src={getImageUrl(cat.image)} alt={cat.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1500ms] ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/5 to-brand-primary/60 opacity-40 group-hover:opacity-80 transition-opacity"></div>
                    <div className="absolute inset-x-0 bottom-0 p-8 text-center translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out">
                      <span className="text-[9px] font-black text-white/80 uppercase tracking-[0.4em] mb-3 block">{cat.count} Items</span>
                      <h3 className="text-lg font-serif text-white tracking-widest uppercase">{cat.name}</h3>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100 hover:bg-brand-primary hover:text-white z-10 border border-slate-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FaqItem = ({ faq, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div key={faq.id} className="group border-b border-slate-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 flex items-center justify-between text-left outline-none group cursor-pointer"
      >
        <span className="text-lg md:text-xl font-serif text-slate-800 group-hover:text-brand-primary transition-colors pr-8">
          <span className="text-xs font-serif italic text-brand-primary/40 mr-4">
            {String(index + 1).padStart(2, '0')}
          </span>
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all duration-500 shadow-sm"
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="stroke-current">
            <path d="M1 1L6 6L11 1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-8 pr-12">
              <p className="text-slate-500 font-light leading-relaxed text-sm md:text-base max-w-2xl whitespace-pre-line">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function FaqSection() {
  const [faqs, setFaqs] = useState([]);
  const [sectionSettings, setSectionSettings] = useState({
    faq_tagline: "Common Inquiries",
    faq_heading: "Your Questions, Answered.",
    faq_description: "Everything you need to know about our sourcing, delivery, and floral care. Can't find what you're looking for?",
    faq_button_text: "Contact Our Studio"
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/faqs`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const actives = Array.isArray(data) ? data.filter(f => f.status === 'Active') : [];
        setFaqs(actives);
      })
      .catch(err => {
        console.error('FAQ Fetch error:', err);
        setFaqs([]);
      });

    fetch(`${API_BASE}/api/section-settings?section=faq`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  if (faqs.length === 0) return <div className="h-[500px] animate-pulse bg-slate-50/50" />;

  return (
    <section className="py-28 bg-slate-50/50 relative overflow-hidden">
      <div className="absolute -bottom-20 -right-20 text-[15rem] font-serif italic text-brand-primary/[0.02] select-none pointer-events-none">
        Care
      </div>

      <div className="container mx-auto px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-20">
          <div className="w-full lg:w-1/3 space-y-8">
            <div className="space-y-4">
              <span className="text-brand-primary text-[10px] font-black tracking-[0.4em] uppercase">{sectionSettings.faq_tagline}</span>
              <h2 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight">
                {sectionSettings.faq_heading}
              </h2>
            </div>
            <p className="text-slate-500 font-light leading-relaxed max-w-sm">
              {sectionSettings.faq_description}
            </p>
            <div className="pt-4">
              <button className="flex items-center gap-4 group text-brand-primary font-bold text-[10px] tracking-widest uppercase pb-2 border-b border-brand-primary/20 hover:border-brand-primary transition-all">
                {sectionSettings.faq_button_text}
                {/* <svg width="18" height="12" viewBox="0 0 18 12" fill="none" className="stroke-current group-hover:translate-x-2 transition-transform">
                  <path d="M12 1L17 6L12 11M1 6H17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg> */}
              </button>
            </div>
          </div>

          <div className="w-full lg:w-2/3 space-y-4">
            {faqs.map((faq, i) => (
              <FaqItem key={faq.id} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [sectionSettings, setSectionSettings] = useState({
    testimonials_tagline: "Community Stories",
    testimonials_heading: "Shared Experiences.",
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/testimonials`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const actives = data.filter(t => t.status === 'Active');
        // AnimatedTestimonials expects 'src' instead of 'image'
        const formatted = actives.map(t => ({
          ...t,
          src: t.image
        }));
        setTestimonials(formatted);
      })
      .catch(console.error);

    fetch(`${API_BASE}/api/section-settings?section=testimonials`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  if (testimonials.length === 0) return <div className="h-[600px] animate-pulse bg-white" />;

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none select-none">
        <span className="text-[15rem] font-serif italic text-brand-primary">Voices</span>
      </div>

      <div className="container mx-auto px-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
          <span className="text-brand-accent text-[11px] font-black tracking-[0.5em] uppercase">{sectionSettings.testimonials_tagline}</span>
          <h2 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight italic">
            {sectionSettings.testimonials_heading}
          </h2>
        </div>

        <AnimatedTestimonials autoplay={true} testimonials={testimonials} />
      </div>
    </section>
  );
}

function AtelierSection() {
  const [hours, setHours] = useState([]);
  const [sectionSettings, setSectionSettings] = useState({
    atelier_tagline: "Visit Our Studio",
    atelier_heading: "Step into our Studio to experience the scents and textures of our latest floral arrivals in person.",
    atelier_description: "Studio visits and pick-up orders are strictly limited to these hours.",
    atelier_location_title: "Studio Location",
    atelier_location_text: "84 Kings Road, Chelsea, London SW3 4TZ",
    atelier_concierge_title: "Concierge",
    atelier_concierge_text: "+44 20 7123 4567, hello@boutique.com",
    atelier_btn_url: "/contact"
  });

  useEffect(() => {
    // Fetch hours
    fetch(`${API_BASE}/api/atelier-hours`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setHours(data.filter(h => h.status === 'Active') || []);
      })
      .catch(console.error);

    // Fetch settings
    fetch(`${API_BASE}/api/section-settings?section=atelier`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  // Helper to check if open now
  const getStatus = () => {
    const today = hours.find(h => h.day === currentDay);
    if (!today || today.isClosed) return { label: "Closed Now", color: "rose" };

    // Parse hours e.g. "8:30 AM - 4:30 PM"
    try {
      const [start, end] = today.hours.split('-').map(t => t.trim());
      const parseTime = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hrs, mins] = time.split(':').map(Number);
        if (modifier === 'PM' && hrs < 12) hrs += 12;
        if (modifier === 'AM' && hrs === 12) hrs = 0;
        return hrs * 60 + (mins || 0);
      };
      const startMin = parseTime(start);
      const endMin = parseTime(end);
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();

      if (nowMin >= startMin && nowMin < endMin) return { label: "Open Now", color: "emerald" };
      return { label: "Closed Now", color: "rose" };
    } catch (e) {
      return { label: "Closed Now", color: "rose" };
    }
  };

  const status = getStatus();

  return (
    <section className="py-24 bg-white overflow-hidden" id="atelier">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 lg:items-center">

          {/* Left Column Text */}
          <div className="flex-1 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {/* <div className={`px-3 py-1 bg-${status.color}-50 rounded-full flex items-center gap-2 border border-${status.color}-100/50`}>
                  <div className={`w-2 h-2 bg-${status.color}-500 rounded-full ${status.label === "Open Now" ? 'animate-pulse' : ''}`} />
                  <span className={`text-[10px] font-black text-${status.color}-600 uppercase tracking-widest`}>
                    {status.label === "Open Now" ? sectionSettings.atelier_tagline : "MBW Closed"}
                  </span>
                </div> */}
              </div>
              <h2 className="text-5xl md:text-6xl font-serif text-slate-900 leading-tight">
                Visit Our <br />
                <span className="italic text-brand-primary">MBW.</span>
              </h2>
              <p className="text-slate-500 text-lg font-light leading-relaxed max-w-lg">
                {sectionSettings.atelier_heading}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 py-10 border-y border-slate-100">
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{sectionSettings.atelier_location_title}</h4>
                <p className="text-slate-800 font-bold leading-relaxed">{sectionSettings.atelier_location_text}</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{sectionSettings.atelier_concierge_title}</h4>
                <p className="text-slate-800 font-bold leading-relaxed">{sectionSettings.atelier_concierge_text}</p>
              </div>
            </div>

            {/* <div className="flex items-center gap-6 pt-6">
              <a href={sectionSettings.atelier_btn1_link || "/contact"} className="px-8 py-4 bg-[#0a0f1c] text-white rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-brand-primary transition-all text-center">
                {sectionSettings.atelier_btn1_text || "Get Directions"}
              </a>
              <div className="flex -space-x-3 overflow-hidden translate-y-0.5">
                {[1, 2, 3, 4].map(idx => (
                  <div key={idx} className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?u=${idx}`} className="w-full h-full object-cover" alt="User" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-4 border-white bg-brand-primary flex items-center justify-center text-white text-[9px] font-black shadow-sm">+2K</div>
              </div>
            </div> */}
          </div>

          {/* Right Column Hours */}
          <div className="flex-1 w-full max-w-2xl bg-white rounded-[50px] border border-slate-50 shadow-2xl shadow-violet-100/50 p-10 md:p-16 relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/30 rounded-full blur-[100px] -z-10 group-hover:bg-brand-secondary/50 transition-all" />

            <div className="space-y-1">
              {hours.map((item, idx) => {
                const isToday = item.day === currentDay;
                return (
                  <div key={item.id} className={`flex items-center justify-between py-5 border-b border-slate-50 last:border-0 ${isToday ? 'relative' : ''}`}>
                    <div className="flex items-center gap-4">
                      <span className={`text-base font-bold ${isToday ? 'text-brand-primary' : 'text-slate-400'}`}>{item.day}</span>
                      {isToday && <span className="px-2 py-0.5 bg-brand-secondary text-brand-primary text-[8px] font-bold rounded-md uppercase tracking-wider">Today</span>}
                    </div>
                    <span className={`text-sm tracking-tight ${isToday ? 'text-slate-900 font-bold' : item.isClosed ? 'text-rose-400 italic' : 'text-slate-500'}`}>
                      {item.isClosed ? 'Closed' : item.hours}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
              <p className="text-[10px] text-slate-400 italic leading-relaxed max-w-[240px]">
                ** {sectionSettings.atelier_description}
              </p>
              <a href={sectionSettings.atelier_btn2_link || "/studio"} className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-xl shadow-brand-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all text-center whitespace-nowrap">
                {sectionSettings.atelier_btn2_text || "Navigate to Studio"}
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}

function SubscriptionSection() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sectionSettings, setSectionSettings] = useState({
    subscription_tagline: "Seasonal Subscription",
    subscription_heading: "Always bloom with our floral membership",
    subscription_description: "Save up to 25% and receive a fresh bundle of joy every week. Pause or cancel anytime.",
    subscription_image: "",
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/section-settings?section=subscription`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSectionSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch(`${API_BASE}/api/subscribers`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message || 'Thanks for joining!');
      setEmail('');
    } catch (err) {
      setMessage('Error. Try again later.');
    }
  };

  const currentImage = sectionSettings.subscription_image || HeroTertiary;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="relative rounded-[50px] overflow-hidden bg-violet-950 min-h-[440px] flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 h-56 lg:h-full relative overflow-hidden">
            <img src={currentImage} alt="Subscription" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-violet-950 via-transparent to-transparent hidden lg:block"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-violet-950 via-transparent to-transparent lg:hidden"></div>
          </div>
          <div className="w-full lg:w-1/2 p-10 lg:p-16 relative z-10 text-center lg:text-left">
            <span className="text-brand-accent text-xs font-bold tracking-[0.3em] uppercase mb-3 block">{sectionSettings.subscription_tagline}</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-6 leading-tight">
              {sectionSettings.subscription_heading}
            </h2>
            <p className="text-violet-200 text-base mb-8 font-light max-w-md">
              {sectionSettings.subscription_description}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-grow px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-violet-300/50 focus:outline-none focus:ring-2 focus:ring-brand-accent backdrop-blur-md"
                required
              />
              <button type="submit" className="px-8 py-4 bg-white text-violet-950 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-2xl">
                Join Now
              </button>
            </form>
            {message && <p className="text-brand-accent text-xs mt-4 font-bold tracking-widest uppercase">{message}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

function FloralHeroBanner() {
  const [heroBanners, setHeroBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/banners?t=${Date.now()}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const actives = data.filter(b => b.status === 'Active' && (b.type === 'Hero Slider' || b.type === 'Promo Banner'));
        if (actives.length > 0) setHeroBanners(actives);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroBanners]);

  const IMAGE_MAP = {
    'HeroPrimary': HeroPrimary,
    'HeroSecondary': HeroSecondary,
    'HeroTertiary': HeroTertiary,
  };

  const currentBanner = heroBanners.length > 0 ? heroBanners[activeIndex] : null;
  const rawBgImage = currentBanner ? currentBanner.image : "HeroPrimary";
  const bgImage = IMAGE_MAP[rawBgImage] || rawBgImage;

  const rawImageSecondary = currentBanner?.imageSecondary || "HeroSecondary";
  const imageSecondary = IMAGE_MAP[rawImageSecondary] || rawImageSecondary;

  const rawImageTertiary = currentBanner?.imageTertiary || "HeroTertiary";
  const imageTertiary = IMAGE_MAP[rawImageTertiary] || rawImageTertiary;

  const rawTitle = currentBanner ? currentBanner.title : "Where Flowers Become Art.";
  const rawSubtitle = currentBanner?.subtitle || "Luxury bouquet florist crafted by master florists. Rare stems, avant-garde design, and same-day delivery across the city.";
  const btnOneText = currentBanner?.btnOneText || "Shop The Edit";
  const btnOneLink = currentBanner?.btnOneLink || "/roses";
  const btnTwoText = currentBanner?.btnTwoText || "View Occasions";
  const btnTwoLink = currentBanner?.btnTwoLink || "/birthday";
  const stats = [
    { num: currentBanner?.statOneNum || "12K+", label: currentBanner?.statOneLabel || "Bouquets Delivered" },
    { num: currentBanner?.statTwoNum || "98%", label: currentBanner?.statTwoLabel || "5-Star Reviews" },
    { num: currentBanner?.statThreeNum || "2hr", label: currentBanner?.statThreeLabel || "Express Delivery" },
  ];

  const renderTitle = (title) => {
    const words = title.split(' ');
    if (words.length >= 3) {
      const first = words[0];
      const second = words[1];
      const rest = words.slice(2).join(' ');
      return (
        <>
          {first}<br />
          <span className="italic font-light" style={{ background: 'linear-gradient(135deg, #B57C3C, #d4a96a, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{second}</span><br />
          {rest}
        </>
      );
    }
    return (
      <>
        {title}<br />
        <span className="italic font-light" style={{ background: 'linear-gradient(135deg, #B57C3C, #d4a96a, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Collection</span>
      </>
    );
  };

  return (
    <section className="relative h-screen min-h-[700px] flex overflow-hidden bg-[#12091e]">
      <div className="relative z-20 flex flex-col justify-between w-full lg:w-[48%] px-10 md:px-16 py-14">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[1px] bg-brand-accent/60"></div>
          <span className="text-[9px] font-black text-brand-accent/80 uppercase tracking-[0.5em]">{currentBanner?.topTagline || "Gallatin · Florist MMXXV"}</span>
        </div>
        <div className="space-y-10">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl xl:text-[5.5rem] font-serif text-white leading-[0.88] tracking-tighter" key={rawTitle}>{renderTitle(rawTitle)}</h1>
          </div>
          <p className="text-slate-400 text-base md:text-lg font-light leading-relaxed max-w-md key-fade" key={`sub-${bgImage}`}>{rawSubtitle}</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to={btnOneLink} className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#12091e] rounded-full font-black text-[10px] tracking-[0.4em] uppercase hover:bg-brand-accent hover:text-white transition-all duration-500 shadow-2xl hover:-translate-y-1 group">
              {btnOneText}
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Link>
            <Link to={btnTwoLink} className="inline-flex items-center gap-3 px-8 py-5 border border-white/20 text-white/70 rounded-full font-bold text-[10px] tracking-[0.4em] uppercase hover:border-brand-accent hover:text-brand-accent transition-all duration-500">{btnTwoText}</Link>
          </div>
          <div className="flex items-center gap-8 pt-4 border-t border-white/10 key-fade" key={`stats-${bgImage}`}>
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-serif font-bold text-white leading-none">{s.num}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[58%] z-10">
        <div className="absolute inset-0">
          <img key={bgImage} src={bgImage} className="w-full h-full object-cover animate-fade-in" alt="Luxury Bouquet" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#12091e] via-[#12091e]/30 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#12091e]/50 via-transparent to-transparent"></div>
        </div>
        <div className="absolute top-10 right-8 w-40 aspect-[3/4] rounded-[36px] overflow-hidden border-2 border-white/10 shadow-2xl animate-float-gentle z-20 backdrop-blur-sm">
          <img key={imageSecondary} src={imageSecondary} className="w-full h-full object-cover animate-fade-in" alt="Floral" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
        <div className="absolute bottom-12 right-44 w-48 aspect-[4/5] rounded-[44px] overflow-hidden border-2 border-white/10 shadow-2xl animate-float-gentle [animation-delay:1.2s] z-20">
          <img key={imageTertiary} src={imageTertiary} className="w-full h-full object-cover animate-fade-in" alt="Floral" />
        </div>
        <div className="absolute top-1/2 left-8 -translate-y-1/2 z-30 bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-2xl space-y-2 min-w-[180px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
            <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">{currentBanner?.promoBadge || "In Season Now"}</span>
          </div>
          <p className="text-white font-serif text-base leading-tight">{currentBanner?.promoTitle || "Summer"}<br /><span className="italic font-light" style={{ color: '#d4a96a' }}>{currentBanner?.promoSubtitle || "Rose Archive"}</span></p>
          <p className="text-[10px] text-white/40 font-medium">{currentBanner?.promoInfo || "From £65 · Same Day"}</p>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const { customer, loading: authLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show register modal on first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBoutique');
    if (!hasVisited && !customer && !authLoading) {
      setIsAuthModalOpen(true);
      localStorage.setItem('hasVisitedBoutique', 'true');
    }
  }, [customer, authLoading]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header isScrolled={isScrolled} activePage="home" />
      <FloralHeroBanner />

      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
        <WhyChooseUs />
      </section>

      <ExploreCategories />

      <SignatureSection addToCart={addToCart} toggleWishlist={toggleWishlist} wishlistItems={wishlistItems} />
      <CuratedSection addToCart={addToCart} toggleWishlist={toggleWishlist} wishlistItems={wishlistItems} />

      <FaqSection />
      <TestimonialsSection />
      <SubscriptionSection />
      <AtelierSection />

      <CartSidebar />
      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="register"
      />
    </div>
  );
}


function SignatureSection({ addToCart, toggleWishlist, wishlistItems }) {
  const { formatPrice } = useSettings();
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState({ title: "Signature Arrangements", subtitle: "Live Inventory", description: "" });

  useEffect(() => {
    fetch(`${API_BASE}/api/home-sections`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const signatureSettings = data.sections.find(s => s.section_type === 'signature');
        if (signatureSettings) setSettings(signatureSettings);
        setItems(data.items.filter(i => i.section_type === 'signature' && i.is_active !== false));

      })
      .catch(console.error);
  }, []);

  const renderSectionTitle = (title) => {
    if (!title) return '';
    const words = title.split(' ');
    if (words.length <= 1) return title;
    const lastWord = words[words.length - 1];
    const rest = words.slice(0, -1).join(' ');
    return (
      <>{rest} <span className="italic text-brand-primary">{lastWord}</span></>
    );
  };

  if (items.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-slate-100 pb-12 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-brand-primary rounded-md text-[10px] font-bold uppercase tracking-widest border border-violet-100">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>
              {settings.subtitle}
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">{renderSectionTitle(settings.title)}</h2>
            {settings.description && <p className="text-slate-400 text-sm max-w-xl">{settings.description}</p>}
          </div>
          {/* <button className="px-8 py-4 bg-brand-primary text-white rounded-xl font-bold text-[11px] tracking-widest uppercase hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20">View All Shop</button> */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {items.map((product) => (
            <div key={product.id} className="group flex flex-col items-center text-center h-full hover:-translate-y-2 transition-transform duration-500">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[40px] bg-white mb-8 shadow-sm border border-slate-50 group-hover:shadow-2xl transition-all duration-700 block">
                <img src={getImageUrl(product.image)} alt={product.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110" />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  {product.badge && <span className="bg-brand-primary/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-xl">{product.badge}</span>}
                </div>
                <div className="absolute inset-x-6 bottom-6 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                  <button onClick={(e) => { e.preventDefault(); addToCart({ ...product, name: product.title }); }} className="w-full py-5 bg-brand-primary/95 backdrop-blur-md text-white rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-brand-accent transition-all shadow-2xl cursor-pointer">Add to Cart — {formatPrice(product.price)}</button>
                </div>
              </div>
              <div className="px-1 flex flex-col items-center text-center">
                <h3 className="text-xl font-serif text-slate-900 group-hover:text-brand-primary transition-colors mb-2">{product.title}</h3>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary mt-1">{product.stock_status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CuratedSection({ addToCart, toggleWishlist, wishlistItems }) {
  const { formatPrice } = useSettings();
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState({ title: "Curated Discoveries", subtitle: "Just Landed" });

  useEffect(() => {
    fetch(`${API_BASE}/api/home-sections`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const curatedSettings = data.sections.find(s => s.section_type === 'discovery');
        if (curatedSettings) setSettings(curatedSettings);
        setItems(data.items.filter(i => i.section_type === 'discovery' && i.is_active !== false));

      })
      .catch(console.error);
  }, []);

  const renderSectionTitle = (title) => {
    if (!title) return '';
    const words = title.split(' ');
    if (words.length <= 1) return title;
    const lastWord = words[words.length - 1];
    const rest = words.slice(0, -1).join(' ');
    return (
      <>{rest} <span className="italic text-brand-primary">{lastWord}</span></>
    );
  };

  if (items.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50/30 border-t border-slate-100 overflow-hidden relative">
      <div className="container mx-auto px-8 mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-3">
          <span className="text-brand-primary text-[10px] font-black tracking-[0.4em] uppercase">{settings.subtitle}</span>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mt-2">{renderSectionTitle(settings.title)}</h2>
          {settings.description && <p className="text-slate-400 text-sm max-w-xl leading-relaxed">{settings.description}</p>}
        </div>
        <div className="flex gap-4 items-center z-10">
          <button className="w-12 h-12 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-all hidden md:flex group shadow-sm hover:shadow-md" onClick={() => document.getElementById('curated-slider').scrollBy({ left: -400, behavior: 'smooth' })}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-current group-hover:-translate-x-1 transition-transform duration-300"><path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className="w-12 h-12 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-all hidden md:flex group shadow-sm hover:shadow-md" onClick={() => document.getElementById('curated-slider').scrollBy({ left: 400, behavior: 'smooth' })}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-current group-hover:translate-x-1 transition-transform duration-300"><path d="M5 12h14M12 5l7 7-7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
      <div className="container mx-auto px-8">
        <div id="curated-slider" className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {items.map((product) => (
            <div key={product.id} className="snap-start shrink-0 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] group relative flex flex-col h-full hover:-translate-y-2 transition-transform duration-500">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white mb-6 shadow-sm border border-slate-100 group-hover:shadow-2xl transition-all duration-700 block">
                <img src={getImageUrl(product.image)} alt={product.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110" />
                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 z-30">
                  <button onClick={(e) => { e.preventDefault(); toggleWishlist({ ...product, name: product.title }); }} className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xl transition-all cursor-pointer group/icon ${wishlistItems.some(item => item.id === product.id) ? 'bg-brand-primary text-white' : 'bg-white text-slate-800 hover:bg-brand-primary hover:text-white'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`stroke-current pointer-events-none group-hover/icon:fill-white ${wishlistItems.some(item => item.id === product.id) ? 'fill-current' : ''}`}><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
                <div className="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                  <button onClick={(e) => { e.preventDefault(); addToCart({ ...product, name: product.title }); }} className="w-full py-4 bg-brand-primary/95 backdrop-blur-md text-white rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-brand-accent transition-colors shadow-2xl cursor-pointer">Add to Cart — {formatPrice(product.price)}</button>
                </div>
              </div>
              <div className="px-1 flex flex-col items-center gap-1 text-center">
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-primary transition-colors mb-1">{product.title}</h3>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary mt-1">{product.stock_status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;



