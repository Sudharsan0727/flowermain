import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../config';
import { generateInvoice } from '../utils/invoiceGenerator';
import { getImageUrl } from '../utils/imageHelper';
import { 
  IconCheck, 
  IconPackage, 
  IconTruck, 
  IconX,
  IconFileInvoice,
  IconCalendar,
  IconShoppingBag,
  IconUser,
  IconHeart,
  IconPhone,
  IconMapPin,
  IconStar,
  IconStarFilled
} from '@tabler/icons-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import AuthModal from '../components/AuthModal';
import Modal from '../components/ui/Modal';

export default function Account() {
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    cartItems,
    wishlistItems,
    orders: contextOrders,
    addToCart,
    removeFromWishlist,
    mergeCart,
    fetchOrders
  } = useCart();
  const { customer, customerLogout, loading: authLoading } = useAuth();
  const { showNotification } = useNotification();

  const [activeSegment, setActiveSegment] = useState('dashboard');
  const [showLandmarkModel, setShowLandmarkModel] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const handleOpenReview = (item) => {
    setReviewingItem(item);
    setReviewForm({ rating: 5, comment: '' });
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.comment.trim()) {
      showNotification("Please provide a comment for your review.", "error");
      return;
    }
    setReviewSubmitting(true);
    // Simulate API call as there is no backend endpoint yet
    setTimeout(() => {
      showNotification("Thank you! Your review has been submitted and is pending approval.", "success");
      setReviewSubmitting(false);
      setReviewModalOpen(false);
    }, 1000);
  };

  const [addresses, setAddresses] = useState([]);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', email: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const location = useLocation();
  const guestState = location.state?.guestMode ? {
    first_name: location.state.customerName?.split(' ')[0] || '',
    last_name: location.state.customerName?.split(' ').slice(1).join(' ') || '',
    email: location.state.customerEmail || '',
    isGuest: true
  } : null;

  const effectiveCustomer = customer || guestState;

  useEffect(() => {
    if (effectiveCustomer) {
      setProfileForm({
        first_name: effectiveCustomer.first_name || '',
        last_name: effectiveCustomer.last_name || '',
        email: effectiveCustomer.email || ''
      });
      if (customer) {
        fetchAddresses();
        fetchOrders();
      }
    }
  }, [customer, location.state]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (effectiveCustomer?.isGuest) {
      showNotification("Registry Note: Guest profiles cannot be modified in the archive. Please register to preserve your details permanently.", "info");
      return;
    }
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE}/api/customers/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setProfileMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/addresses`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setAddresses(data);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  const [newAddress, setNewAddress] = useState({
    title: '',
    name: '',
    street: '',
    suite: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    is_default: false
  });

  const handleSaveAddress = async () => {
    if (!newAddress.street) {
      showNotification("Botanical Note: A street address is required for archival.", "warning");
      return;
    }
    const finalTitle = newAddress.title.trim() || "Home";
    try {
      const url = editingAddressId
        ? `${API_BASE}/api/addresses/${editingAddressId}`
        : `${API_BASE}/api/addresses`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newAddress,
          title: finalTitle,
          first_name: (newAddress.name || '').split(' ')[0],
          last_name: (newAddress.name || '').split(' ').slice(1).join(' ')
        })
      });
      if (res.ok) {
        await fetchAddresses();
        setShowLandmarkModel(false);
        setEditingAddressId(null);
        setNewAddress({ title: '', name: '', street: '', suite: '', city: '', state: '', zip: '', phone: '', is_default: false });
      } else {
        const err = await res.json();
        showNotification(err.error || err.message || 'Registry Interruption: Could not preserve this landmark.', "error");
      }
    } catch (err) {
      console.error("Error saving address:", err);
      showNotification('Archive Connection Failure: Could not reach the address vault.', "error");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/addresses/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        await fetchAddresses();
      } else {
        showNotification('Archive Interruption: Could not remove this landmark.', "error");
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      showNotification('Archive Connection Failure.', "error");
    }
  };
  
  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/addresses/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_default: true })
      });
      if (res.ok) {
        await fetchAddresses();
        showNotification("Preferred Landmark Established.", "success");
      } else {
        showNotification("Archive Interruption: Could not update preferences.", "error");
      }
    } catch (err) {
      console.error("Error setting default address:", err);
      showNotification('Archive Connection Failure.', "error");
    }
  };

  const handleEditAddress = (addr) => {
    setNewAddress({
      title: addr.title || '',
      name: `${addr.first_name || ''} ${addr.last_name || ''}`.trim(),
      street: addr.street || '',
      suite: addr.suite || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || '',
      phone: addr.phone || '',
      is_default: addr.is_default || false
    });
    setEditingAddressId(addr.id);
    setShowLandmarkModel(true);
  };

  const [isLogin, setIsLogin] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const { customerRegister, customerLogin } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    setRegisterSuccess('');
    try {
      const res = await customerRegister(registerForm);
      if (res.success) {
        if (res.needsVerification) {
          showNotification("Please check your email and verify your identity to proceed.", "info", 5000);
          setRegisterSuccess('Identity verification initialized. Please check your inbox for the "Yes, it was me" link.');
        }
      } else {
        setRegisterError(res.error ? `${res.message}: ${res.error}` : res.message);
      }
    } catch (err) {
      setRegisterError('Registry connection failure.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');
    try {
      const res = await customerLogin(registerForm.email, registerForm.password);
      if (!res.success) {
        setRegisterError(res.message);
      }
    } catch (err) {
      setRegisterError('Vault access failure.');
    } finally {
      setRegisterLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      showNotification("Botanical Identity Established! You may now enter the vault.", "success", 5000);
      setIsLogin(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (!effectiveCustomer && !authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 overflow-x-hidden">
        <Header isScrolled={isScrolled} activePage="account" />
        <div className="container mx-auto px-6 py-24 flex justify-center">
          <div className="w-full max-w-xl bg-white rounded-[2.5rem] p-12 shadow-2xl border border-slate-100">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <IconUser size={40} className="text-slate-300" />
              </div>
              <h1 className="text-3xl font-serif text-slate-900 mb-2">
                {isLogin ? 'Enter the Vault' : 'Join the Archive'}
              </h1>
              <p className="text-slate-400 text-sm font-medium">
                {isLogin ? 'Access your curated botanical history.' : 'Establish your identity to access curated botanical history.'}
              </p>
            </div>

            {registerError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-500 text-xs font-bold rounded-2xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                {registerError}
              </div>
            )}

            {registerSuccess ? (
              <div className="p-8 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-3xl text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <IconCheck size={24} />
                </div>
                <h3 className="text-lg font-serif italic">Identity Transmission Sent</h3>
                <p className="text-sm font-medium leading-relaxed opacity-80">
                  We have sent an authentication link to your inbox. Please verify your email to access the archive.
                </p>
                <button 
                  onClick={() => { setRegisterSuccess(''); setIsLogin(true); }}
                  className="text-xs font-black uppercase tracking-widest text-emerald-800 hover:underline pt-2"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <>
              <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all"
                      value={registerForm.first_name}
                      onChange={e => setRegisterForm({ ...registerForm, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Last Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all"
                      value={registerForm.last_name}
                      onChange={e => setRegisterForm({ ...registerForm, last_name: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all"
                  value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 700 000 000"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all"
                    value={registerForm.phone}
                    onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Secret Key (Password)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all"
                  value={registerForm.password}
                  onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-primary transition-all shadow-xl disabled:opacity-50"
              >
                {registerLoading ? 'Initializing...' : (isLogin ? 'Access Archive' : 'Establish Identity')}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-xs text-slate-400 font-medium mb-4">
                {isLogin ? "New to our botanical circle?" : "Already part of the archive?"}
              </p>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
              >
                {isLogin ? 'Request Invitation (Register)' : 'Enter Vault (Login)'}
              </button>
            </div>
            </>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin"></div></div>;
  // Member Content (Original with dynamic data)
  const user = {
    firstName: effectiveCustomer.first_name || "Member",
    lastName: effectiveCustomer.last_name || "",
    email: effectiveCustomer.email,
    memberSince: effectiveCustomer.isGuest ? "Guest Access" : "Established 2024",
    // avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
    loyaltyPoints: 0,
    tier: effectiveCustomer.isGuest ? "Guest Entry" : "Botanist Member"
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (props) => <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg> },
    { id: 'orders', label: 'Order History', icon: (props) => <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg> },
    { id: 'wishlist', label: 'My Favorites', icon: (props) => <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg> },
    { id: 'addresses', label: 'Addresses', icon: (props) => <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg> },
    { id: 'settings', label: 'Account Settings', icon: (props) => <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.74l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg> },
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "placed": return "bg-blue-50 text-blue-600 border-blue-100";
      case "confirmed": return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "packed": return "bg-amber-50 text-amber-600 border-amber-100";
      case "shipped": return "bg-violet-50 text-violet-600 border-violet-100";
      case "delivered": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "cancelled": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
      <Header isScrolled={isScrolled} activePage="account" />

      {/* ── Dashboard Hero ── */}
      <section className="bg-white border-b border-slate-100 pt-20 pb-12">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* <div className="relative group">
              <div className="absolute inset-0 bg-brand-primary/20 rounded-full blur-2xl group-hover:bg-brand-primary/30 transition-all"></div>
              <img src={user.avatar} className="w-24 md:w-32 h-24 md:h-32 rounded-full object-cover border-4 border-white shadow-2xl relative z-10" alt="Profile" />
              <button className="absolute bottom-1 right-1 w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl z-20 hover:scale-110 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              </button>
            </div> */}
            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <h1 className="text-3xl md:text-4xl font-serif text-slate-900 leading-tight">Welcome, <span className="italic font-light text-brand-primary">{user.firstName}</span></h1>
                <span className="px-4 py-1.5 bg-violet-50 text-brand-primary rounded-full text-[10px] uppercase font-black tracking-widest border border-brand-primary/10">
                  {user.tier}
                </span>
              </div>
              <p className="text-slate-400 text-sm font-medium">Member since {user.memberSince} • {user.loyaltyPoints} Blooms Accumulated</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Account Management Grid ── */}
      <main className="container mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col xl:flex-row gap-12">

          {/* 1. Universal Navigation (Sidebar/TopNav) */}
          <aside className="w-full xl:w-72">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-32">
              <nav className="flex flex-row xl:flex-col overflow-x-auto no-scrollbar">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSegment(item.id)}
                    className={`flex-grow xl:flex-initial flex items-center gap-4 px-8 py-5 transition-all text-sm font-bold whitespace-nowrap border-b-4 xl:border-b-0 xl:border-l-4 ${activeSegment === item.id ? 'bg-violet-50/50 text-brand-primary border-brand-primary' : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    <item.icon className={`transition-colors ${activeSegment === item.id ? 'text-brand-primary' : 'text-slate-300'}`} />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={effectiveCustomer.isGuest ? () => window.location.href='/' : customerLogout}
                  className="flex items-center gap-4 px-8 py-5 text-rose-500 hover:bg-rose-50 transition-all text-sm font-bold whitespace-nowrap border-l-4 border-transparent w-full text-left"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* 2. Content Segments */}
          <div className="flex-grow">

            {activeSegment === 'dashboard' && (
              <div className="space-y-10 animate-fadeIn">
                {effectiveCustomer.isGuest && (
                  <div className="bg-brand-primary/5 border border-brand-primary/10 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm shrink-0">
                      <IconUser size={24} />
                    </div>
                    <div className="flex-grow text-center sm:text-left space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">Guest Access Archive</h4>
                      <p className="text-xs text-slate-500 font-medium">You are currently viewing a temporary guest archive. To preserve your order history and manage addresses, please register for a permanent identity.</p>
                    </div>
                    <button 
                       onClick={() => window.location.href='/account'}
                       className="px-6 py-3 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-accent transition-all shadow-lg shadow-brand-primary/20 shrink-0"
                    >
                      Register Now
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 transition-all group">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Total Bloom Balance</p>
                    <div className="text-4xl font-serif text-brand-primary mb-4 flex items-baseline gap-2">
                      {user.loyaltyPoints} <span className="text-sm font-sans font-bold text-slate-300 uppercase tracking-tighter">Pts</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary w-[65%]" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">Accumulate <span className="text-brand-primary font-bold">250 more Blooms</span> to unlock the <span className="italic">Botanist Reserve</span> status.</p>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 transition-all">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Registry Overview</p>
                    <div className="text-4xl font-serif text-slate-900 mb-6">{contextOrders.length} <span className="text-sm font-sans font-bold text-slate-300 uppercase tracking-tighter">Items Ordered</span></div>
                    <button onClick={() => setActiveSegment('orders')} className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-2">
                      View registries registry
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </button>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 transition-all">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Curated Archive</p>
                    <div className="text-4xl font-serif text-slate-900 mb-6">{wishlistItems.length} <span className="text-sm font-sans font-bold text-slate-300 uppercase tracking-tighter">Favorites</span></div>
                    <button onClick={() => setActiveSegment('wishlist')} className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-2">
                      Browse archive
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-primary/20 transition-all duration-700"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-serif text-white italic">Complimentary Botanical Design</h3>
                      <p className="text-slate-400 text-sm max-w-md font-light leading-relaxed">
                        As a <span className="text-brand-accent font-bold">Platinum Member</span>, you're entitled to a personal consultation with our lead curator to design a bespoke residential subscription.
                      </p>
                    </div>
                    <button className="px-10 py-5 bg-brand-accent text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all shadow-2xl">
                      Schedule Consultation
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSegment === 'orders' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-serif text-slate-900 tracking-tight">Order Registry</h2>
                  <p className="text-xs font-bold text-slate-400">Showing {contextOrders.length} recent fulfillments</p>
                </div>

                {contextOrders.length === 0 ? (
                  <div className="bg-white p-20 rounded-[2.5rem] text-center border border-slate-100 shadow-sm space-y-4">
                    <p className="text-xl font-serif italic text-slate-400">No botanical archives found yet.</p>
                    <Link to="/" className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-widest">Begin Exploring ›</Link>
                  </div>
                ) : (
                    <div className="space-y-4">
                      {/* Floating Header */}
                      <div className="hidden md:grid grid-cols-12 px-10 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        <div className="col-span-4">Product Details</div>
                        <div className="col-span-2">Order ID</div>
                        <div className="col-span-2">Purchase Date</div>
                        <div className="col-span-2">Total Amount</div>
                        <div className="col-span-2 text-center">Actions</div>
                      </div>

                      <div className="space-y-3">
                        {contextOrders.map(order => (
                          <div key={order.id} className="bg-white hover:bg-slate-50/50 border border-slate-100 rounded-[2rem] p-4 md:p-6 transition-all hover:shadow-xl hover:shadow-brand-primary/5 group relative">
                            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                              
                              {/* Product Info */}
                              <div className="md:col-span-4 flex items-center gap-6">
                                <div className="w-16 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                  {order.fullItems && order.fullItems[0] ? (
                                    <img src={getImageUrl(order.fullItems[0].image)} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                      <IconShoppingBag size={24} />
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-serif font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{order.fullItems?.[0]?.name || 'Botanical Piece'}</p>
                                  <div className={cn(
                                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                    getStatusColor(order.status)
                                  )}>
                                    <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                                    {order.status}
                                  </div>
                                </div>
                              </div>

                              {/* ID */}
                              <div className="md:col-span-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 md:hidden">Order ID</p>
                                <span className="text-[11px] font-mono font-medium text-slate-400">#{order.id?.split('-')[0].toUpperCase()}</span>
                              </div>

                              {/* Date */}
                              <div className="md:col-span-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 md:hidden">Purchase Date</p>
                                <p className="text-[11px] font-medium text-slate-600">{order.date}</p>
                              </div>

                              {/* Valuation */}
                              <div className="md:col-span-2">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 md:hidden">Total Amount</p>
                                <p className="text-lg font-sans font-bold text-brand-primary tracking-tighter">{order.total}</p>
                              </div>

                              {/* Actions */}
                              <div className="md:col-span-2 flex justify-center md:justify-end gap-3">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-primary hover:border-brand-primary hover:shadow-lg transition-all active:scale-90"
                                  title="View Details"
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                </button>
                                <button
                                  onClick={() => {
                                    if (order.fullItems && order.fullItems[0]) {
                                      handleOpenReview(order.fullItems[0]);
                                    } else {
                                      showNotification("No items to review.", "info");
                                    }
                                  }}
                                  className="flex-grow md:flex-initial px-8 py-3 bg-brand-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-all shadow-lg shadow-brand-primary/10 active:scale-95"
                                >
                                  Review
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                )}

                {/* Detailed Order Modal (Full Manifest) */}
                <AnimatePresence>
                  {selectedOrder && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-6 animate-fadeIn">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                      >
                        {/* Modal Left: Status & Summary */}
                        <div className="w-full md:w-1/3 bg-slate-50 p-10 border-r border-slate-100 overflow-y-auto no-scrollbar">
                          <button onClick={() => setSelectedOrder(null)} className="mb-10 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 flex items-center gap-2 group">
                            <IconX size={14} className="transition-transform group-hover:rotate-90" /> Close Details
                          </button>

                          <h2 className="text-2xl font-serif text-slate-900 mb-8">Acquisition <span className="italic text-brand-primary">Path</span></h2>

                          <div className="space-y-8 relative">
                            <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />

                            {[
                              { id: 'placed', label: 'Order Placed', icon: IconCheck },
                              { id: 'confirmed', label: 'Confirmed', icon: IconPackage },
                              { id: 'packed', label: 'Curated & Packed', icon: IconPackage },
                              { id: 'shipped', label: 'In Transit', icon: IconTruck },
                              { id: 'delivered', label: 'Arrived', icon: IconCheck }
                            ].map((step, idx) => {
                              const statusOrder = ["placed", "confirmed", "packed", "shipped", "delivered"];
                              const currentStatus = selectedOrder.status?.toLowerCase() || 'placed';
                              const isCompleted = statusOrder.indexOf(currentStatus) >= statusOrder.indexOf(step.id);
                              const isActive = currentStatus === step.id;

                              return (
                                <div
                                  key={step.id}
                                  className={cn(
                                    "flex items-center gap-4 w-full text-left transition-all relative z-10",
                                    isCompleted ? "opacity-100" : "opacity-30"
                                  )}
                                >
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                                    isActive ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110" :
                                      isCompleted ? "bg-white border-emerald-500 text-emerald-500" : "bg-white border-slate-200 text-slate-300"
                                  )}>
                                    <step.icon size={14} />
                                  </div>
                                  <div>
                                    <p className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "text-brand-primary" : "text-slate-900")}>{step.label}</p>
                                    {isActive && <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 animate-pulse">In Progress</p>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-12 pt-12 border-t border-slate-100 space-y-6">
                            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 italic">Client Address</p>
                              <p className="text-xs font-bold text-slate-900 leading-relaxed">
                                {selectedOrder.shipping_address || 'No address provided'}<br />
                                {selectedOrder.shipping_city || ''}{selectedOrder.shipping_city && selectedOrder.shipping_zip ? ', ' : ''}{selectedOrder.shipping_zip || ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Modal Right: Items & Valuation */}
                        <div className="flex-1 p-10 overflow-y-auto">
                          <div className="flex justify-between items-start mb-10">
                            <div>
                              <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1 italic">Order Identification</p>
                              <h3 className="text-xl font-sans font-bold text-slate-900 tracking-tight">#{selectedOrder.id?.split('-')[0].toUpperCase()}</h3>
                              {selectedOrder.delivery_date && (
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter mt-1 flex items-center gap-1">
                                  <IconCalendar size={10} /> Arrival: {new Date(selectedOrder.delivery_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Valuation</p>
                              <p className="text-3xl font-sans font-semibold text-brand-primary tracking-tighter">{selectedOrder.total || '$0.00'}</p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-50 pb-4 italic">Registry Items</h4>

                            <div className="space-y-4">
                              {selectedOrder.fullItems && selectedOrder.fullItems.length > 0 ? selectedOrder.fullItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 transition-all group">
                                  <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                    <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-grow">
                                    <h5 className="text-sm font-bold text-slate-900">{item.name}</h5>
                                    <div className="flex gap-4 mt-1.5 flex-wrap">
                                      <p className="text-[10px] text-slate-600 font-sans font-bold uppercase tracking-wider">Qty: {item.quantity || 0}</p>
                                      <p className="text-[10px] text-brand-primary font-sans font-bold uppercase tracking-wider">{item.price || '$0.00'} ea</p>
                                    </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-2">
                                    <p className="text-xs font-sans font-bold text-slate-900">
                                      ${(parseFloat(String(item.price || '0').replace(/[^0-9.]/g, '')) * (item.quantity || 0)).toFixed(2)}
                                    </p>
                                    <button 
                                      onClick={() => handleOpenReview(item)}
                                      className="text-[9px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/20 bg-brand-primary/5 px-4 py-1.5 rounded-full hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                    >
                                      Leave Review
                                    </button>
                                  </div>
                                </div>
                              )) : (
                                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                  <p className="text-xs text-slate-400 italic font-medium">No botanical manifests found for this record.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-12 flex gap-4">
                            <button 
                              onClick={() => generateInvoice(selectedOrder, showNotification)}
                              className="flex-1 py-5 bg-brand-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                              <IconFileInvoice size={18} /> Download Invoice
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeSegment === 'wishlist' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-serif text-slate-900 tracking-tight">Curated Favorites</h2>
                  <p className="text-xs font-bold text-slate-400">{wishlistItems.length} preserved specimens</p>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="bg-white p-20 rounded-[2.5rem] text-center border border-slate-100 shadow-sm space-y-4">
                    <p className="text-xl font-serif italic text-slate-400">Your archive is awaiting its first selection.</p>
                    <Link to="/" className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-widest">Start Browsing ›</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="bg-white border border-slate-100 rounded-[2rem] p-5 flex gap-6 items-center shadow-sm group hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                        <div className="w-24 aspect-[4/5] overflow-hidden rounded-2xl bg-slate-50 shrink-0 border border-slate-50 relative">
                          <img src={getImageUrl(item.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                          <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="flex-grow space-y-1">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.category}</p>
                          <h4 className="font-serif text-lg text-slate-900 leading-tight">{item.name}</h4>
                          <p className="text-brand-primary font-bold">{item.price}</p>

                          <div className="flex gap-3 pt-3">
                            <button
                              onClick={() => addToCart(item)}
                              className="p-3 bg-slate-900 text-white rounded-xl hover:bg-brand-primary transition-all shadow-lg hover:shadow-brand-primary/20"
                              title="Add to Bag"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="p-3 bg-white border border-slate-100 text-slate-300 rounded-xl hover:border-rose-100 hover:text-rose-500 transition-all group/trash"
                              title="Remove from Archive"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/trash:rotate-12 transition-transform"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSegment === 'addresses' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <h2 className="text-2xl font-serif text-slate-900 tracking-tight">Addresses</h2>
                  <button
                    onClick={() => setShowLandmarkModel(true)}
                    className="text-[10px] font-black uppercase text-brand-primary tracking-widest py-3 px-6 bg-brand-primary/5 rounded-full hover:bg-brand-primary hover:text-white transition-all transition-all"
                  >
                    + Add Landmark
                  </button>
                </div>

                {/* Shipping Model (requested fields) */}
                {showLandmarkModel && (
                  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-fadeIn">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn">
                      <div className="p-10 pb-0 flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-serif text-slate-900">{editingAddressId ? 'Modify Landmark' : 'Add New Landmark'}</h3>
                          <p className="text-xs text-slate-400 font-medium">{editingAddressId ? 'Update your shipping destination in the archive.' : 'Save a new shipping destination to your personal archive.'}</p>
                        </div>
                        <button onClick={() => { setShowLandmarkModel(false); setEditingAddressId(null); setNewAddress({ title: '', name: '', street: '', suite: '', city: '', state: '', zip: '', phone: '', is_default: false }); }} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </button>
                      </div>

                      <div className="p-10 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Landmark Title</label>
                            <input
                              type="text"
                              value={newAddress.title}
                              onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                              placeholder="e.g. Home, Creative Studio"
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Full Name</label>
                            <input
                              type="text"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                              placeholder="Recipient's Name"
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Street Address</label>
                          <input
                            type="text"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            placeholder="124 Studio Heights..."
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Apartment / Suite</label>
                            <input
                              type="text"
                              value={newAddress.suite}
                              onChange={(e) => setNewAddress({ ...newAddress, suite: e.target.value })}
                              placeholder="Optional"
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">City</label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                              placeholder="e.g. London"
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">State / Province</label>
                            <input
                              type="text"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                              placeholder="e.g. Kensington"
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Zip / Postal Code</label>
                            <input
                              type="text"
                              value={newAddress.zip}
                              onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                              placeholder="W8 4QG"
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Phone Number</label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            placeholder="+44 (0) 20 ..."
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-3 px-1">
                          <input 
                            type="checkbox" 
                            id="is_default"
                            checked={newAddress.is_default}
                            onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                            className="w-5 h-5 rounded-lg border-slate-200 text-brand-primary focus:ring-brand-primary"
                          />
                          <label htmlFor="is_default" className="text-xs font-bold text-slate-600 cursor-pointer">Set as Preferred Landmark (Like)</label>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex gap-4">
                          <button onClick={handleSaveAddress} className="flex-grow py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20">
                            {editingAddressId ? 'Update Landmark' : 'Save Address Landmark'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {addresses.length === 0 ? (
                  <div className="bg-white p-20 rounded-[2.5rem] text-center border border-slate-100 shadow-sm space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconMapPin size={32} className="text-slate-300" />
                    </div>
                    <p className="text-xl font-serif italic text-slate-400">Your landmark archive is empty.</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Save your frequent delivery destinations here for a swifter checkout experience.</p>
                    <button 
                      onClick={() => setShowLandmarkModel(true)}
                      className="text-xs font-bold text-brand-primary hover:underline uppercase tracking-widest pt-2"
                    >
                      + Add Your First Landmark
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all shadow-xl shadow-brand-primary/5 space-y-4 relative ${addr.is_default ? 'border-brand-primary' : 'border-slate-100'}`}>
                        <div className="absolute top-6 right-8 flex gap-2">
                          {!addr.is_default && (
                            <button 
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="p-2 bg-slate-50 text-slate-300 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all group"
                              title="Set as Preferred (Like)"
                            >
                              <IconHeart size={16} className="group-hover:fill-rose-500 transition-all" />
                            </button>
                          )}
                          {addr.is_default && (
                            <span className="text-[9px] font-black uppercase text-brand-primary bg-violet-50 px-3 py-1 rounded-full border border-brand-primary/10 flex items-center gap-1">
                              <IconHeart size={10} className="fill-brand-primary" /> Preferred
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-serif text-lg mb-2">{addr.title}</h4>
                        <div className="text-sm text-slate-500 font-medium space-y-1.5">
                          <p className="text-slate-900 font-bold mb-3">{addr.first_name} {addr.last_name}</p>
                          <div className="space-y-0.5">
                            <p className="flex items-center gap-2">
                              <IconMapPin size={12} className="text-slate-300" />
                              {addr.street}{addr.suite ? `, ${addr.suite}` : ''}
                            </p>
                            <p className="pl-5">{addr.city}, {addr.state} {addr.zip}</p>
                          </div>
                          {addr.phone && (
                            <p className="flex items-center gap-2 pt-2">
                              <IconPhone size={12} className="text-slate-300" />
                              {addr.phone}
                            </p>
                          )}
                        </div>
                        <div className="pt-6 flex gap-4 border-t border-slate-50">
                          <button onClick={() => handleEditAddress(addr)} className="text-[10px] font-black uppercase text-slate-400 hover:text-brand-primary transition-colors">Modify</button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 transition-colors">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSegment === 'settings' && (
              <div className="space-y-8 animate-fadeIn">
                <h2 className="text-2xl font-serif text-slate-900 tracking-tight">Security & Identity</h2>
                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                  <form onSubmit={handleUpdateProfile} className="p-10 space-y-8">
                    {profileMessage.text && (
                      <div className={`p-4 rounded-2xl text-xs font-bold border ${profileMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                        {profileMessage.text}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">First Name</label>
                        <input
                          type="text"
                          value={profileForm.first_name}
                          onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Last Name</label>
                        <input
                          type="text"
                          value={profileForm.last_name}
                          onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Electronic Correspondence</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary transition-all outline-none"
                      />
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-primary transition-all shadow-xl disabled:opacity-50"
                      >
                        {profileLoading ? 'Archiving...' : 'Save Personal Archive'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <CartSidebar />
      <Footer />

      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Share Your Experience"
        footer={
          <div className="flex gap-4">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={reviewSubmitting}
              className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-accent transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 flex items-center justify-center"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        }
      >
        {reviewingItem && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm border border-slate-100">
                <img src={getImageUrl(reviewingItem.image)} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Evaluating</p>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">{reviewingItem.name}</h4>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Quality Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className={`transition-transform hover:scale-110 ${reviewForm.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                  >
                    {reviewForm.rating >= star ? <IconStarFilled size={28} /> : <IconStar size={28} strokeWidth={1.5} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Detailed Feedback</label>
                <span className={`text-[9px] font-bold ${reviewForm.comment.length > 500 ? 'text-red-500' : 'text-slate-400'}`}>
                  {reviewForm.comment.length}/500
                </span>
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value.slice(0, 500) })}
                placeholder="How did this botanical piece arrive? Was the recipient delighted?"
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:border-brand-primary outline-none transition-all shadow-sm min-h-[120px] resize-none"
              />
            </div>
          </div>
        )}
      </Modal>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="register"
      />
    </div>
  );
}
