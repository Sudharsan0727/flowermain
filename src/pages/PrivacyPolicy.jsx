import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';

export default function PrivacyPolicy() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 overflow-x-hidden">
      <Header isScrolled={isScrolled} activePage="terms" />
      
      {/* ── Page Hero ── */}
      <section className="bg-white border-b border-slate-100 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-brand-primary text-[10px] font-black tracking-[0.5em] uppercase">Gallatin Legal Archive</span>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 leading-tight">Privacy <span className="italic font-light text-brand-primary">Policy</span></h1>
            <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Last Updated: January 28, 2026</p>
          </div>
        </div>
      </section>

      {/* ── Content Section ── */}
      <main className="container mx-auto px-6 lg:px-12 py-24">
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-10 md:p-20 shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary/10"></div>
          
          <div className="prose prose-slate max-w-none space-y-12 text-slate-600 leading-relaxed font-light">
            <section className="space-y-6">
              <p className="text-lg">
                Flower Shop Network (“Flower Shop Network,” “we,” “us,” or “our”) values your privacy and is committed to protecting personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit <span className="text-brand-primary font-medium italic">FlowerShopNetwork.com</span> or interact with our services.
              </p>
              <p>
                This policy applies to users in the United States and Canada and is intended to comply with applicable privacy laws, including U.S. state privacy laws (such as the California Consumer Privacy Act as amended by the CPRA) and Canada’s Personal Information Protection and Electronic Documents Act (PIPEDA).
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">1. Information We Collect</h2>
              
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">A. Information Collected Automatically</h3>
                <p>When you visit our website, we may automatically collect certain information, including:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Internet Protocol (IP) address</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Browser type and version</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Operating system</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Device identifiers</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Date and time of access</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Pages viewed and referring URLs</li>
                </ul>
                <p className="text-sm italic text-slate-400 mt-4">This data is generally aggregated and not used to identify you directly.</p>
              </div>

              <div className="space-y-4 pt-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">B. Information You Provide Voluntarily</h3>
                <p>We may collect personal information that you voluntarily provide, including:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Name</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Mailing address</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Email address</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Phone number</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Business or account information</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Communications and inquiries</li>
                </ul>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">2. How We Use Your Information</h2>
              <p>We use personal information for the following purposes:</p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">01</span>
                  <span>To provide and manage our services</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">02</span>
                  <span>To respond to inquiries or requests</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">03</span>
                  <span>To process transactions</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">04</span>
                  <span>To communicate about products, services, or updates</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-brand-primary font-serif italic text-lg leading-none">05</span>
                  <span>To improve website functionality and content</span>
                </li>
              </ul>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">3. Cookies and Tracking Technologies</h2>
              <p>
                We may use cookies, pixels, and similar technologies to enable core website functionality, analyze traffic, and improve performance. You can control cookies through your browser settings.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">4. Information Sharing and Disclosure</h2>
              <p className="font-bold text-slate-900 italic underline decoration-brand-accent/30 decoration-4 underline-offset-4">We do not sell personal information.</p>
              <p>We may share personal information with service providers, business partners, or legal authorities when required by law or for authorized business purposes.</p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">5. Marketing Communications</h2>
              <p>
                You will only receive marketing communications where permitted by law or with your consent. You may opt out at any time by following the unsubscribe instructions in the message.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">6. Your Privacy Rights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-brand-primary tracking-widest">United States</h4>
                  <p className="text-xs leading-relaxed">Request access, correction, deletion, or opt-out of targeted advertising.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-brand-primary tracking-widest">Canada</h4>
                  <p className="text-xs leading-relaxed">Access personal information, request corrections, or withdraw consent.</p>
                </div>
              </div>
              <div className="p-6 bg-brand-primary text-white rounded-3xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] mb-2">How to Exercise Your Rights</p>
                <p className="text-sm">Email: <span className="font-bold italic underline">jadams@flowershopnetwork.com</span></p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">8. Data Security</h2>
              <p>
                Sensitive data (such as payment information) is encrypted during transmission using secure technologies (e.g., HTTPS). We implement reasonable administrative, technical, and physical safeguards.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">12. Contact Information</h2>
              <p>If you have questions regarding this Privacy Policy, contact:</p>
              <div className="p-8 border-2 border-slate-50 rounded-[2rem] space-y-2">
                <p className="font-serif text-xl text-slate-900">Flower Shop Network</p>
                <p className="text-sm flex items-center gap-2">
                  <span className="text-brand-primary font-bold">Email:</span> 
                  jadams@flowershopnetwork.com
                </p>
              </div>
            </section>Section content completed.
          </div>
        </div>
      </main>

      <CartSidebar />
      <Footer />
    </div>
  );
}
