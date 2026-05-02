import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';

export default function TermsConditions() {
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
            <span className="text-brand-primary text-[10px] font-black tracking-[0.5em] uppercase">Service Agreement</span>
            <h1 className="text-5xl md:text-7xl font-serif text-slate-900 leading-tight">Terms & <span className="italic font-light text-brand-primary">Conditions</span></h1>
            <p className="text-slate-400 text-sm font-medium tracking-widest uppercase italic">BY: FLOWER SHOP NETWORK, INC.</p>
          </div>
        </div>
      </section>

      {/* ── Content Section ── */}
      <main className="container mx-auto px-6 lg:px-12 py-24">
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-10 md:p-20 shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-accent/10"></div>
          
          <div className="prose prose-slate max-w-none space-y-12 text-slate-600 leading-relaxed font-light">
            
            {/* 1. Delivery Policy */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">Delivery Policy</h2>
              <div className="space-y-4">
                <p>
                  Occasionally, floral substitutions are necessary due to temporary, regional availability issues. If this is the case with the gift you’ve selected, our experienced florists will ensure that the style and theme of your arrangement is preserved and will substitute only fresh flowers of equal or higher value. We will do our best to accommodate deliveries at specific times of day, but we cannot guarantee it.
                </p>
                <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl">
                  <p className="text-sm text-rose-700 font-medium">
                    The customer takes full responsibility that the given recipient information is complete and correct. If there is a delay in the delivery due to incorrect or incomplete information (including door code) provided by the customer, the order will not be refunded.
                  </p>
                </div>
                <p>
                  During extreme weather conditions we cannot guarantee that your order will be delivered on time and date. If we do not succeed in delivering your order, the order will be delivered as soon as possible.
                </p>
                <p>
                  Please be advised that we are unable to cancel or change any orders already delivered or presently en route to delivery. If you find it necessary to cancel or change delivery dates or addresses for any other orders, simply call our shop directly. We are also unable to accept cancellations or change requests via e-mail.
                </p>
              </div>
            </section>

            {/* 2. Privacy Policy Snippet */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">Privacy Policy</h2>
              <div className="space-y-4">
                <p>
                  We take your privacy seriously and will take all measures to protect your personal information. Any personal information received will only be used to fill your order. We will not sell or redistribute your information to anyone.
                </p>
                <p className="text-sm bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
                  We cannot ensure that all of your private communications and other personally identifiable information will never be disclosed in ways not otherwise described in this Privacy Policy. For example, we may be required to disclose information to the government or third parties under certain circumstances... We can (and you authorize us to) disclose any information about you to law enforcement or other government officials as we, in our sole discretion, believe necessary or appropriate.
                </p>
              </div>
            </section>

            {/* 3. Payment Process */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">Payment Process</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Accepted Methods</p>
                  <ul className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> AMEX</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Discover</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Visa</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> MasterCard</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> PayPal (US)</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div> Apple Pay</li>
                  </ul>
                </div>
                <div className="bg-slate-900 text-slate-300 p-8 rounded-[2rem] space-y-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-accent">Legal Agreement</p>
                  <p className="text-sm leading-relaxed">
                    All charges for orders placed on this website will appear on your payment statement as <span className="text-white font-bold">Flower Shop Network, Inc.</span>
                  </p>
                </div>
              </div>
              <p>
                Flower Shop Network, Inc. bills your payment method at the point of sale to ensure that work can begin on the design of your order. Once you click “Place Order” in the check-out process, we will attempt to secure authorization.
              </p>
            </section>

            {/* 4. Service Fees & Confirmation */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h2 className="text-lg font-serif text-slate-900 italic">Service Fees</h2>
                <p className="text-sm">A service fee is applied for all orders placed on this website.</p>
              </div>
              <div className="space-y-4">
                <h2 className="text-lg font-serif text-slate-900 italic">Order Confirmation</h2>
                <p className="text-sm">An order confirmation will appear upon completion of checkout and will be sent to the e-mail address entered during checkout.</p>
              </div>
            </section>

            {/* 5. Content Rights */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif text-slate-900 italic border-l-4 border-brand-primary pl-6">Upload & Content</h2>
              <div className="p-8 bg-brand-primary/5 rounded-[2.5rem] border border-brand-primary/10">
                <p className="text-sm leading-relaxed italic">
                  Downloading content from Flower Shop Network, Inc. hosted websites is at your own risk. All content, including images, are protected by copyright laws. All images on the website are owned by the florist shop or Flower Shop Network, Inc., and any commercial use or display of those images and plagiarism of text, without approval, is strictly forbidden.
                </p>
              </div>
            </section>

            {/* 6. Sales Tax */}
            <section className="pt-8 border-t border-slate-100">
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest text-center">
                Sales tax will be charged where applicable.
              </p>
            </section>

          </div>
        </div>
      </main>

      <CartSidebar />
      <Footer />
    </div>
  );
}
