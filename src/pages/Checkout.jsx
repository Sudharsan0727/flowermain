import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import { IconCheck } from '@tabler/icons-react';
import FlowerLogo from '../assets/FlowerLogo.png';
import API_BASE from '../config';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { getImageUrl } from '../utils/imageHelper';
const Checkout = () => {
   const { cartItems, addOrder, clearCart } = useCart();
   const { customer, loading: authLoading, verifySession } = useAuth();
   const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
   const { settings } = useSettings();
   const [isScrolled, setIsScrolled] = useState(false);
   const [activeStep, setActiveStep] = useState(1);
   const navigate = useNavigate();

   const API_URL = `${API_BASE}/api`;

   const occasionMessages = {
      'New Born': [
         "Welcome to the world, little one! Congratulations on your new arrival.",
         "So happy for you and your growing family! Best wishes to you all.",
         "A new baby is a blessing. Wishing you joy and sleep!",
         "Congratulations on your beautiful new addition to the family!",
         "Wishing you and your new baby much love and happiness."
      ],
      'Birthday': [
         "Hope your day is as bright as these blooms! Happy Birthday!",
         "Wishing you a year filled with love, laughter, and flowers. Happy Birthday!",
         "Another year older, another year of being wonderful. Enjoy your day!",
         "To a very special person on their very special day. Happy Birthday!",
         "May your birthday be filled with happiness and the scent of fresh flowers!"
      ],
      'Anniversary': [
         "Wishing you both a lifetime of happiness together. Happy Anniversary!",
         "May your love continue to grow more beautiful with each passing year.",
         "Cheers to many more years of love and laughter. Happy Anniversary!",
         "To a beautiful couple on their anniversary. Wishing you the best!",
         "Celebrate the love you share and the memories you've made. Happy Anniversary!"
      ],
      'Just Because': [
         "Just because you deserve something beautiful today!",
         "Thinking of you and sending a little floral cheer your way.",
         "No special reason, just wanted to brighten your day!",
         "Because you're wonderful and I was thinking of you.",
         "Sending these blooms just to make you smile."
      ],
      'Get Well': [
         "Sending you strength and sunshine. Get well soon!",
         "Wishing you a speedy recovery and better days ahead.",
         "Thinking of you and wishing you a quick return to health.",
         "Hope these flowers brighten your day and help you feel better.",
         "Rest up and get well soon! We're all rooting for you."
      ],
      'Funeral / Sympathy': [
         "With deepest sympathy as you remember a life well-lived.",
         "Sending love, peace, and strength during this difficult time.",
         "Our thoughts and prayers are with you and your family.",
         "May these flowers bring a small measure of comfort to your heart.",
         "Remembering [Name] with love and honor. So sorry for your loss."
      ],
      'General / Others': [
         "Just because you deserve something beautiful today!",
         "Thinking of you and sending a little floral cheer your way.",
         "A small token of appreciation for everything you do.",
         "Wishing you a wonderful day filled with beauty.",
         "Whatever the occasion, hope these blooms make it special!"
      ]
   };

   const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      paymentMethod: 'razorpay',
      deliveryMethod: 'ship',
      deliveryDate: '',
      timeSlot: 'Morning (9AM - 12PM)',
      occasion: '',
      location: '',
      signature: '',
      giftMessage: '',
      orderNotes: ''
   });
   const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
   const [tempSelectedMessage, setTempSelectedMessage] = useState('');
   const [savedAddresses, setSavedAddresses] = useState([]);
   const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
   const [showStep1Suggestions, setShowStep1Suggestions] = useState(false);
   const [errors, setErrors] = useState({});
   const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
   const [atelierHours, setAtelierHours] = useState([]);

    // Discount State
   const [promoCode, setPromoCode] = useState('');
   const [applyingDiscount, setApplyingDiscount] = useState(false);
   const [appliedDiscount, setAppliedDiscount] = useState(null);
   const [discountError, setDiscountError] = useState('');

   useEffect(() => {
      const handleScroll = () => {
         setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);

      // Check if logged in (Guest checkout supported)
      // if (!authLoading && !customer) {
      //    setIsAuthModalOpen(true);
      // }

      // Fetch Saved Addresses
      const token = localStorage.getItem('customer_token');
      if (token) {
         fetch(`${API_URL}/addresses`, {
            headers: { 'Authorization': `Bearer ${token}` }
         })
            .then(res => res.json())
            .then(data => {
               if (Array.isArray(data)) setSavedAddresses(data);
            })
            .catch(err => console.error("Error fetching addresses:", err));
      }

      return () => window.removeEventListener('scroll', handleScroll);
   }, [customer, authLoading]);

   // Auto-fill form if customer logged in
   useEffect(() => {
      if (customer) {
         setFormData(prev => ({
            ...prev,
            firstName: customer.first_name || prev.firstName,
            lastName: customer.last_name || prev.lastName,
            email: customer.email || prev.email,
            phone: customer.phone || prev.phone
         }));
      }
   }, [customer]);

   // Calculate Totals using high precision
   const subtotal = cartItems.reduce((acc, item) => {
      const base = parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
      let extra = 0;
      if (item.options?.chocolates) {
         const match = item.options.chocolates.match(/\+(\d+\.\d+)/);
         if (match) extra += parseFloat(match[1]);
      }
      if (item.options?.stuffedAnimal) {
         const match = item.options.stuffedAnimal.match(/\+(\d+\.\d+)/);
         if (match) extra += parseFloat(match[1]);
      }
      return acc + (base + extra) * item.quantity;
   }, 0);

   const shipping = subtotal > 99 ? 0 : 15;
   const discountAmount = appliedDiscount?.discountAmount || 0;
   const discountedSubtotal = Math.max(0, subtotal - discountAmount);
   const tax = discountedSubtotal * 0.08;
   const total = discountedSubtotal + shipping + tax;

   const handleApplyDiscount = async () => {
      if (!promoCode.trim()) return;
      setApplyingDiscount(true);
      setDiscountError('');

      try {
         const res = await fetch(`${API_URL}/discounts/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               code: promoCode,
               cartItems,
               customerId: customer?.id,
               customerEmail: formData.email,
               subtotal
            })
         });

         const data = await res.json();
         if (data.valid) {
            setAppliedDiscount({
               ...data,
               discountAmount: parseFloat(data.discountAmount) || 0
            });
            setDiscountError('');
         } else {
            setAppliedDiscount(null);
            setDiscountError(data.message);
         }
      } catch (err) {
         console.error("Discount validation failed:", err);
         setDiscountError('Failed to validate discount code.');
      } finally {
         setApplyingDiscount(false);
      }
   };

   useEffect(() => {
      const handleScroll = () => {
         setIsScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);

      // Fetch Saved Addresses
      const token = localStorage.getItem('customer_token');
      if (token) {
         fetch(`${API_URL}/addresses`, {
            headers: { 'Authorization': `Bearer ${token}` }
         })
            .then(res => res.json())
            .then(data => {
               if (Array.isArray(data)) setSavedAddresses(data);
            })
            .catch(err => console.error("Error fetching addresses:", err));
      }

      // Fetch Atelier Hours
      fetch(`${API_BASE}/api/atelier-hours`)
         .then(res => res.json())
         .then(data => {
            if (Array.isArray(data)) setAtelierHours(data);
         })
         .catch(err => console.error("Error fetching atelier hours:", err));

      return () => window.removeEventListener('scroll', handleScroll);
   }, [customer, authLoading]);

   // Auto-fill form with the default saved address if available
   useEffect(() => {
      if (savedAddresses.length > 0 && !formData.address) {
         const defaultAddress = savedAddresses.find(a => a.is_default) || savedAddresses[0];
         setFormData(prev => ({
            ...prev,
            firstName: defaultAddress.first_name || prev.firstName,
            lastName: defaultAddress.last_name || prev.lastName,
            address: defaultAddress.street || prev.address,
            city: defaultAddress.city || prev.city,
            state: defaultAddress.state || prev.state,
            zip: defaultAddress.zip || prev.zip,
            phone: defaultAddress.phone || prev.phone
         }));
      }
   }, [savedAddresses]);

   const cityToStateMap = {
      'Chennai': 'Tamil Nadu',
      'Coimbatore': 'Tamil Nadu',
      'Madurai': 'Tamil Nadu',
      'Bangalore': 'Karnataka',
      'Mumbai': 'Maharashtra',
      'Delhi': 'Delhi',
      'Hyderabad': 'Telangana',
      // Examples, can be expanded
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;

      if (name === 'deliveryDate') {
         const today = new Date();
         const year = today.getFullYear();
         const month = String(today.getMonth() + 1).padStart(2, '0');
         const day = String(today.getDate()).padStart(2, '0');
         const todayStr = `${year}-${month}-${day}`;

         if (value < todayStr) {
            setErrorModal({
               isOpen: true,
               title: "Invalid Date",
               message: "We don't allow delivery on previous dates. Please select a current or future date."
            });
            return;
         }

         const date = new Date(value);
         const dateStr = value; // value is already YYYY-MM-DD from input type date
         const disabledDatesStr = settings.disabled_delivery_dates || '';
         const disabledDates = disabledDatesStr.split(',').map(d => {
            const t = d.trim();
            if (/^\d{2}-\d{2}-\d{4}$/.test(t)) {
               const [dd, mm, yyyy] = t.split('-');
               return `${yyyy}-${mm}-${dd}`;
            }
            return t;
         });

         const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
         const selectedDayName = dayNames[date.getDay()];
         const shopHour = atelierHours.find(h => h.day.startsWith(selectedDayName));
         
         if (shopHour && shopHour.isClosed) {
            setErrorModal({
               isOpen: true,
               title: "Shop Closed",
               message: `Our boutique is closed on ${selectedDayName}s for artisanal maintenance. Please select another date.`
            });
            return;
         }
         if (disabledDates.includes(dateStr)) {
            setErrorModal({
               isOpen: true,
               title: "Shop Closed",
               message: "The boutique is closed on the selected date for artisanal maintenance. Please select another date."
            });
            return;
         }
      }

      setFormData(prev => {
         if (name === 'phone' && /[a-zA-Z]/.test(value)) return prev;
         const newData = { ...prev, [name]: value };

         // Auto-fetch State if City is updated
         if (name === 'city') {
            const city = value.trim();
            // Case-insensitive lookup
            const foundCity = Object.keys(cityToStateMap).find(c => c.toLowerCase() === city.toLowerCase());
            if (foundCity) {
               newData.state = cityToStateMap[foundCity];
            }
         }

         // Open message modal if occasion is updated
         if (name === 'occasion') {
            setIsMessageModalOpen(true);
            setTempSelectedMessage(''); // Reset selection
         }

         return newData;
      });
   };

   const handleApplyTemplate = () => {
      if (tempSelectedMessage) {
         setFormData(prev => ({
            ...prev,
            giftMessage: (prev.giftMessage ? prev.giftMessage + "\n" : "") + tempSelectedMessage
         }));
      }
      setIsMessageModalOpen(false);
   };

   const selectSavedAddress = (addr) => {
      setFormData(prev => ({
         ...prev,
         firstName: addr.first_name || prev.firstName,
         lastName: addr.last_name || prev.lastName,
         address: addr.street,
         city: addr.city,
         state: addr.state || '',
         zip: addr.zip,
         phone: addr.phone || prev.phone
      }));
      setShowAddressSuggestions(false);
      setShowStep1Suggestions(false);
      setErrors(prev => {
         const newErrors = { ...prev };
         delete newErrors.firstName;
         delete newErrors.lastName;
         delete newErrors.phone;
         delete newErrors.address;
         delete newErrors.city;
         delete newErrors.state;
         delete newErrors.zip;
         return newErrors;
      });
   };

   const validateStep = (step) => {
      const newErrors = {};
      if (step === 1) {
         if (!formData.firstName.trim()) newErrors.firstName = "First name required";
         if (!formData.lastName.trim()) newErrors.lastName = "Last name required";
         if (!formData.email.trim()) newErrors.email = "Email required";
         else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
         if (!formData.phone.trim()) {
            newErrors.phone = "Phone required";
         } else {
            const digitsOnly = formData.phone.replace(/\D/g, '');
            if (digitsOnly.length < 6 || digitsOnly.length > 15) {
               newErrors.phone = "Must be between 6 and 15 digits";
            }
         }
      } else if (step === 2) {
         if (!formData.address.trim()) newErrors.address = "Address required";
         if (!formData.city.trim()) newErrors.city = "City required";
         if (!formData.state.trim()) newErrors.state = "State required";
         if (!formData.zip.trim()) newErrors.zip = "Zip code required";
         if (!formData.deliveryDate) newErrors.deliveryDate = "Delivery date required";
         if (!formData.occasion) newErrors.occasion = "Occasion required";
         if (!formData.location) newErrors.location = "Location required";
         if (formData.giftMessage && formData.giftMessage.length > 100) newErrors.giftMessage = `Exceeds 100 char limit by ${formData.giftMessage.length - 100}`;
         if (formData.orderNotes && formData.orderNotes.length > 100) newErrors.orderNotes = `Exceeds 100 char limit by ${formData.orderNotes.length - 100}`;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleNextStep = (step) => {
      if (validateStep(step)) {
         setActiveStep(step + 1);
         setTimeout(() => {
            const el = document.getElementById(`step-${step + 1}`);
            if (el) {
               const y = el.getBoundingClientRect().top + window.scrollY - 100;
               window.scrollTo({ top: y, behavior: 'smooth' });
            }
         }, 100);
      } else {
         setTimeout(() => {
            const errorElement = document.querySelector('.border-red-400');
            if (errorElement) {
               const y = errorElement.getBoundingClientRect().top + window.scrollY - 150;
               window.scrollTo({ top: y, behavior: 'smooth' });
               errorElement.focus();
            }
         }, 100);
      }
   };

   const handleOrderSubmission = async (paymentId = null) => {
      const token = localStorage.getItem('customer_token');
      const sessionId = localStorage.getItem('cart_session_id') || `GUEST-${Math.random().toString(36).substr(2, 9)}`;

      const payload = {
         items: cartItems,
         totalAmount: total,
         paymentMethod: formData.paymentMethod,
         paymentId: paymentId,
         customerInfo: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone
         },
         shippingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip
         },
         name: `${formData.firstName} ${formData.lastName}`,
         email: formData.email,
         phone: formData.phone,
         firstName: formData.firstName,
         lastName: formData.lastName,
         deliveryMethod: formData.deliveryMethod,
         deliveryDate: formData.deliveryDate,
         timeSlot: formData.timeSlot,
         giftMessage: formData.giftMessage,
         occasionType: formData.occasion,
         location: formData.location,
         signature: formData.signature,
         orderNotes: formData.orderNotes,
         sessionId: sessionId,
         discountId: appliedDiscount?.discountId,
         discountAmount: appliedDiscount?.discountAmount
      };

      try {
         const response = await fetch(`${API_URL}/orders/place`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               ...(token && { 'Authorization': `Bearer ${token}` })
            },
            credentials: 'include',
            body: JSON.stringify(payload)
         });

         if (response.ok) {
            const result = await response.json();

            if (result.token) {
               localStorage.setItem('customer_token', result.token);
               await verifySession();
            }

            // Explicit backend cart liquidation on success
            try {
               await fetch(`${API_BASE}/api/cart/clear`, {
                  method: 'DELETE',
                  headers: { 
                     'Content-Type': 'application/json',
                     ...(result.token ? { 'Authorization': `Bearer ${result.token}` } : (token && { 'Authorization': `Bearer ${token}` }))
                  },
                  credentials: 'include',
                  body: JSON.stringify({ sessionId })
               });
            } catch (e) {
               console.warn("[CHECKOUT_LIQUIDATION_DELAYED]: Direct cart wipe failed, though order persisted.");
            }

            clearCart();
            navigate('/order-success', {
               state: {
                  items: cartItems,
                  transactionId: paymentId || result.orderId,
                  total: total,
                  discountAmount: appliedDiscount?.discountAmount || 0,
                  customerName: `${formData.firstName} ${formData.lastName}`,
                  customerEmail: formData.email
               }
            });
         } else {
            const err = await response.json();
            console.error(`[ORDER_SUBMIT_FAILURE] Status: ${response.status} URL: ${response.url}`, err);
            setErrorModal({
               isOpen: true,
               title: "Order Blocked",
               message: err.error || err.message || "Failed to finalize your registry selection."
            });
         }
      } catch (err) {
         console.error("[ORDER_SUBMIT_CRASH] Critical failure:", err);
         setErrorModal({
            isOpen: true,
            title: "Connection Error",
            message: "Archive Connection Failure: Could not finalize the transaction."
         });
      }
   };

   const handlePayment = () => {
      const options = {
         key: "rzp_test_SUZjdzjcXcSFpD",
         amount: Math.round(total * 100),
         currency: "INR",
         name: "Gallatin",
         description: "Luxury Botanical Purchase",
         image: FlowerLogo,
         handler: function (response) {
            handleOrderSubmission(response.razorpay_payment_id);
         },
         prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
         },
         theme: { color: "#5b21b6" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.paymentMethod === 'razorpay') {
         handlePayment();
      } else {
         handleOrderSubmission(); // COD flow
      }
   };

   if (cartItems.length === 0) {
      return (
         <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300"><path d="m6 2-3 4v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
            </div>
            <h1 className="text-3xl font-serif text-slate-900 mb-2 italic">Archive is Empty</h1>
            <p className="text-slate-500 mb-8 max-w-sm">You haven't added any luxury specimens to your registry yet.</p>
            <Link to="/" className="px-10 py-4 bg-brand-primary text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20">
               Start Collecting
            </Link>
         </div>
      );
   }

   const steps = [
      { id: 1, label: 'Contact', icon: (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
      { id: 2, label: 'Delivery', icon: (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg> },
      { id: 3, label: 'Payment', icon: (p) => <svg {...p} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg> },
   ];

   return (
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800">
         <Header isScrolled={isScrolled} activePage="" />

         {/* ── Progress Banner ── */}
         <section className="bg-white border-b border-slate-100 pt-16 pb-12">
            <div className="container mx-auto px-6 max-w-5xl">
               <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="space-y-1">
                     <nav className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 flex gap-2">
                        <Link to="/cart" className="hover:text-brand-primary">Cart Archive</Link>
                        <span>/</span>
                        <span className="text-slate-900">Checkout</span>
                     </nav>
                     <h1 className="text-3xl md:text-4xl font-serif text-slate-900 leading-tight">Complete Your <span className="italic font-light text-brand-primary">Registry</span></h1>
                  </div>

                  {/* Progress Bubbles */}
                  <div className="flex items-center gap-4">
                     {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                           <div className={`flex flex-col items-center gap-2 group transition-all ${activeStep >= step.id ? 'opacity-100' : 'opacity-40'}`}>
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${activeStep === step.id ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110' : activeStep > step.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                                 {activeStep > step.id ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg> : <step.icon />}
                              </div>
                              <span className="text-[9px] font-black uppercase tracking-widest">{step.label}</span>
                           </div>
                           {idx < steps.length - 1 && <div className={`w-8 h-[2px] mb-6 transition-all ${activeStep > step.id ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                        </React.Fragment>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         <main className="container mx-auto px-6 py-12 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-12 items-start">

               {/* LEFT: Checkout Steps */}
               <div className="w-full lg:w-2/3 space-y-6">

                  {/* Step 1: Contact Information */}
                  <div id="step-1" className={`bg-white rounded-[2rem] border transition-all ${activeStep === 1 ? 'border-brand-primary shadow-2xl p-8' : 'border-slate-100 opacity-60 p-6'}`}>
                     <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                           <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${activeStep === 1 ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>01</span>
                           <h3 className="text-xl font-serif text-slate-900">Personal Information</h3>
                        </div>
                        {activeStep > 1 && <button onClick={() => setActiveStep(1)} className="text-[10px] font-black uppercase text-brand-primary hover:underline">Edit</button>}
                     </div>

                     {activeStep === 1 ? (
                        <div className="space-y-6 animate-fadeIn">
                           {savedAddresses.length > 0 && (
                              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                                 <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Rapid Identity Matching</h4>
                                    <button
                                       onClick={() => setShowStep1Suggestions(!showStep1Suggestions)}
                                       className="text-[10px] font-black uppercase text-brand-primary hover:underline"
                                    >
                                       {showStep1Suggestions ? "Manual Entry" : "Quick fill from saved profile"}
                                    </button>
                                 </div>
                                 {showStep1Suggestions && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                                       {savedAddresses.map(addr => (
                                          <div
                                             key={addr.id}
                                             onClick={() => selectSavedAddress(addr)}
                                             className="p-4 bg-white border border-slate-100 rounded-xl hover:border-brand-primary cursor-pointer transition-all hover:shadow-lg group"
                                          >
                                             <p className="text-[10px] font-bold text-brand-primary mb-1 uppercase tracking-tighter">{addr.title} Profile</p>
                                             <p className="text-xs font-bold text-slate-900">{addr.first_name} {addr.last_name}</p>
                                             <p className="text-[10px] text-slate-400 font-medium">{addr.phone}</p>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           )}

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">First Name</label>
                                 <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Eleanor" className={`w-full px-6 py-4 bg-slate-50 border ${errors.firstName ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-inner`} />
                                 {errors.firstName && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.firstName}</p>}
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Last Name</label>
                                 <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Vance" className={`w-full px-6 py-4 bg-slate-50 border ${errors.lastName ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-inner`} />
                                 {errors.lastName && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.lastName}</p>}
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Email Registry</label>
                                 <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="eleanor@studio.com" className={`w-full px-6 py-4 bg-slate-50 border ${errors.email ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-inner`} />
                                 {errors.email && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.email}</p>}
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Contact Number</label>
                                 <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (212) 000-000" className={`w-full px-6 py-4 bg-slate-50 border ${errors.phone ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-inner`} />
                                 {errors.phone && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.phone}</p>}
                              </div>
                           </div>
                           <button onClick={() => handleNextStep(1)} className="w-full py-5 bg-brand-primary text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20">
                              Continue To Delivery
                           </button>
                        </div>
                     ) : (
                        <div className="flex gap-4 text-xs font-medium text-slate-500 italic">
                           {formData.firstName} {formData.lastName} • {formData.email}
                        </div>
                     )}
                  </div>

                  {/* Step 2: Delivery Specifics */}
                  <div id="step-2" className={`bg-white rounded-[2rem] border transition-all ${activeStep === 2 ? 'border-brand-primary shadow-2xl p-8' : 'border-slate-100 opacity-60 p-6'}`}>
                     <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                           <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${activeStep === 2 ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>02</span>
                           <h3 className="text-xl font-serif text-slate-900">Delivery Architecture</h3>
                        </div>
                        {activeStep > 2 && <button onClick={() => setActiveStep(2)} className="text-[10px] font-black uppercase text-brand-primary hover:underline">Edit</button>}
                     </div>

                     {activeStep === 2 && (
                        <div className="space-y-8 animate-fadeIn">
                           {savedAddresses.length > 0 && (
                              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                                 <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Saved Landmarks Detected</h4>
                                    <button
                                       onClick={() => setShowAddressSuggestions(!showAddressSuggestions)}
                                       className="text-[10px] font-black uppercase text-brand-primary hover:underline"
                                    >
                                       {showAddressSuggestions ? "Close suggestions" : "Use saved address"}
                                    </button>
                                 </div>

                                 {showAddressSuggestions && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                                       {savedAddresses.map(addr => (
                                          <div
                                             key={addr.id}
                                             onClick={() => selectSavedAddress(addr)}
                                             className="p-4 bg-white border border-slate-100 rounded-xl hover:border-brand-primary cursor-pointer transition-all hover:shadow-lg group"
                                          >
                                             <p className="text-[10px] font-bold text-brand-primary mb-1 uppercase tracking-tighter">{addr.title}</p>
                                             <p className="text-xs font-bold text-slate-900">{addr.street}</p>
                                             <p className="text-[10px] text-slate-400 font-medium">{addr.city}, {addr.zip}</p>
                                          </div>
                                       ))}
                                    </div>
                                 )}
                              </div>
                           )}

                           <div className="space-y-6">
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Street Address</label>
                                 <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="124 Studio Heights" className={`w-full px-6 py-4 bg-white border ${errors.address ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm`} />
                                 {errors.address && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.address}</p>}
                              </div>
                              <div className="grid grid-cols-2 gap-6">
                                 <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Chelsea" className={`w-full px-6 py-4 bg-white border ${errors.city ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm`} />
                                    {errors.city && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.city}</p>}
                                 </div>
                                 <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">State</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="London" className={`w-full px-6 py-4 bg-white border ${errors.state ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm`} />
                                    {errors.state && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.state}</p>}
                                 </div>
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Postal Code</label>
                                 <input type="text" name="zip" value={formData.zip} onChange={handleInputChange} placeholder="SW3 4RY" className={`w-full px-6 py-4 bg-white border ${errors.zip ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm`} />
                                 {errors.zip && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.zip}</p>}
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Delivery Date</label>
                                                                 <input 
                                    type="date" 
                                    name="deliveryDate" 
                                    value={formData.deliveryDate} 
                                    min={(() => {
                                       const today = new Date();
                                       const y = today.getFullYear();
                                       const m = String(today.getMonth() + 1).padStart(2, '0');
                                       const d = String(today.getDate()).padStart(2, '0');
                                       return `${y}-${m}-${d}`;
                                    })()} 
                                    onChange={handleInputChange}
                                    onClick={(e) => e.target.showPicker()}
                                    onFocus={(e) => e.target.showPicker()}
                                    onKeyDown={(e) => e.preventDefault()}
                                    className={`w-full px-6 py-4 bg-white border ${errors.deliveryDate ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm cursor-pointer`} 
                                 />
                                 {errors.deliveryDate && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.deliveryDate}</p>}
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Time Slot</label>
                                 <select name="timeSlot" value={formData.timeSlot} onChange={handleInputChange} className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm">
                                    <option>Morning (9AM - 12PM)</option>
                                    <option>Afternoon (12PM - 4PM)</option>
                                    <option>Evening (4PM - 8PM)</option>
                                 </select>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Occasion</label>
                                 <select name="occasion" value={formData.occasion} onChange={handleInputChange} className={`w-full px-6 py-4 bg-white border ${errors.occasion ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm`}>
                                    <option value="" disabled hidden>Choose Occasion</option>
                                    <option value="New Born">New Born</option>
                                    <option value="Birthday">Birthday</option>
                                    <option value="Anniversary">Anniversary</option>

                                    <option value="Just Because">Just Because</option>
                                    <option value="Get Well">Get Well</option>
                                    <option value="Funeral / Sympathy">Funeral / Sympathy</option>
                                    <option value="General / Others">General / Others</option>
                                 </select>
                                 {errors.occasion && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.occasion}</p>}
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Location</label>
                                 <select name="location" value={formData.location} onChange={handleInputChange} className={`w-full px-6 py-4 bg-white border ${errors.location ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm`}>
                                    <option value="" disabled hidden>Choose Location</option>
                                    <option value="Home">Home</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Business">Business</option>
                                    <option value="Church">Church</option>
                                    <option value="Hospital">Hospital</option>
                                    <option value="Nursing Home">Nursing Home</option>
                                 </select>
                                 {errors.location && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.location}</p>}
                              </div>
                           </div>



                           <div className="space-y-1.5 relative">
                              <div className="flex justify-between items-center px-1">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Gift Message (Optional)</label>
                                 <span className={`text-[10px] font-bold ${formData.giftMessage?.length > 100 ? 'text-red-500' : 'text-slate-400'}`}>
                                    {formData.giftMessage?.length || 0}/100 {formData.giftMessage?.length > 100 && `(+${formData.giftMessage.length - 100} extra)`}
                                 </span>
                              </div>
                              <textarea name="giftMessage" value={formData.giftMessage} onChange={handleInputChange} placeholder="Write a heartfelt note..." className={`w-full px-6 py-4 bg-white border ${errors.giftMessage || formData.giftMessage?.length > 100 ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm min-h-[100px]`} />
                              {errors.giftMessage && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.giftMessage}</p>}
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Signature</label>
                              <input type="text" name="signature" value={formData.signature} onChange={handleInputChange} placeholder="Your name or anonymous" className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm" />
                           </div>

                           <div className="space-y-1.5 relative">
                              <div className="flex justify-between items-center px-1">
                                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Delivery Instructions (Optional)</label>
                                 <span className={`text-[10px] font-bold ${formData.orderNotes?.length > 100 ? 'text-red-500' : 'text-slate-400'}`}>
                                    {formData.orderNotes?.length || 0}/100 {formData.orderNotes?.length > 100 && `(+${formData.orderNotes.length - 100} extra)`}
                                 </span>
                              </div>
                              <textarea name="orderNotes" value={formData.orderNotes} onChange={handleInputChange} placeholder="Special delivery instructions, gate codes, etc." className={`w-full px-6 py-4 bg-white border ${errors.orderNotes || formData.orderNotes?.length > 100 ? 'border-red-400' : 'border-slate-100'} rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm min-h-[100px]`} />
                              {errors.orderNotes && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{errors.orderNotes}</p>}
                           </div>

                           <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                              <p className="text-xs text-brand-primary/80 font-medium leading-relaxed italic">
                                 <strong className="text-brand-primary font-bold">Note:</strong> We use fresh materials to create each piece with care. If a substitution is needed due to availability, we'll choose a suitable alternative that keeps the look and feel of your arrangement just as special.
                              </p>
                           </div>

                           <button onClick={() => handleNextStep(2)} className="w-full py-5 bg-brand-primary text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20">
                              Proceed to Payment
                           </button>
                        </div>
                     )}

                     {activeStep > 2 && (
                        <div className="flex gap-4 text-xs font-medium text-slate-500 italic">
                           {formData.address}, {formData.city}
                        </div>
                     )}
                  </div>

                  <div id="step-3" className={`bg-white rounded-[2rem] border transition-all ${activeStep === 3 ? 'border-brand-primary shadow-2xl p-8' : 'border-slate-100 opacity-60 p-6'}`}>
                     <div className="flex items-center gap-4 mb-8">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${activeStep === 3 ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}`}>03</span>
                        <h3 className="text-xl font-serif text-slate-900">Secure Payment</h3>
                     </div>

                     {activeStep === 3 && (
                        <div className="space-y-8 animate-fadeIn">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <button
                                 type="button"
                                 onClick={() => setFormData({ ...formData, paymentMethod: 'razorpay' })}
                                 className={`p-6 border-2 rounded-[2rem] flex items-center gap-4 transition-all ${formData.paymentMethod === 'razorpay' ? 'border-brand-primary bg-violet-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                              >
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.paymentMethod === 'razorpay' ? 'bg-white text-brand-primary shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                 </div>
                                 <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Online Payment</p>
                                    <p className="text-[8px] text-slate-500 font-bold mt-0.5">Secure Razorpay Terminal</p>
                                 </div>
                              </button>

                              <button
                                 type="button"
                                 onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                                 className={`p-6 border-2 rounded-[2rem] flex items-center gap-4 transition-all ${formData.paymentMethod === 'cod' ? 'border-brand-primary bg-violet-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                              >
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.paymentMethod === 'cod' ? 'bg-white text-brand-primary shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="12" x="2" y="6" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" /></svg>
                                 </div>
                                 <div className="text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Cash on Delivery</p>
                                    <p className="text-[8px] text-slate-500 font-bold mt-0.5">Pay upon specimen arrival</p>
                                 </div>
                              </button>
                           </div>

                           <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                              <p className="text-xs text-slate-500 italic leading-relaxed font-medium">
                                 By confirming, you agree to our <span className="text-brand-primary font-bold hover:underline cursor-pointer">Specimen Terms</span> and botanical handling protocols.
                              </p>
                           </div>

                           <button onClick={handleSubmit} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-brand-primary transition-all shadow-2xl">
                              Authorize Transaction — ${total.toFixed(2)}
                           </button>
                        </div>
                     )}
                  </div>

               </div>

               {/* RIGHT: High-Precision Summary */}
               <div className="w-full lg:w-1/3">
                   <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-2xl sticky top-32 flex flex-col max-h-[calc(100vh-140px)]">
                      {/* Fixed Header */}
                      <div className="flex justify-between items-center mb-6 shrink-0">
                         <h4 className="text-xl font-serif text-slate-900">Registry Summary</h4>
                         <Link to="/cart" className="text-[9px] font-black uppercase text-brand-primary bg-violet-50 px-3 py-1 rounded-full border border-brand-primary/10">Modify Bag</Link>
                      </div>

                      {/* Fixed Promo Section */}
                      <div className="space-y-2 mb-4 shrink-0">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Promo Code</label>
                         <div className="flex gap-2">
                            <input
                               type="text"
                               value={promoCode}
                               onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                               placeholder="ENTER CODE"
                               disabled={appliedDiscount}
                               className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:border-brand-primary outline-none transition-all shadow-inner"
                            />
                            {appliedDiscount ? (
                               <button
                                  onClick={() => { setAppliedDiscount(null); setPromoCode(''); }}
                                  className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200"
                               >
                                  Remove
                               </button>
                            ) : (
                               <button
                                  onClick={handleApplyDiscount}
                                  disabled={applyingDiscount || !promoCode}
                                  className="px-4 py-3 bg-brand-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-accent disabled:opacity-50 transition-all shadow-lg shadow-brand-primary/20"
                               >
                                  {applyingDiscount ? '...' : 'Apply'}
                               </button>
                            )}
                         </div>
                         {discountError && <p className="text-[9px] text-red-500 font-bold uppercase pl-1">{discountError}</p>}
                         {appliedDiscount && <p className="text-[9px] text-emerald-500 font-bold uppercase pl-1">{appliedDiscount.message}</p>}
                      </div>

                      {/* Scrollable Items List */}
                      <div className="space-y-4 overflow-y-auto no-scrollbar flex-grow min-h-[140px] mb-4">
                         {cartItems.map(item => {
                            const base = parseFloat(item.price.toString().replace(/[^0-9.]/g, ''));
                            let extra = 0;
                            if (item.options?.chocolates) {
                               const match = item.options.chocolates.match(/\+(\d+\.\d+)/);
                               if (match) extra += parseFloat(match[1]);
                            }
                            if (item.options?.stuffedAnimal) {
                               const match = item.options.stuffedAnimal.match(/\+(\d+\.\d+)/);
                               if (match) extra += parseFloat(match[1]);
                            }
                            return (
                               <div key={item.cartKey || item.id} className="flex gap-4 group">
                                  <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-50">
                                     <img src={getImageUrl(item.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                  </div>
                                  <div className="flex-grow min-w-0">
                                     <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                                     <p className="text-[10px] text-slate-400 font-medium">Qty: {item.quantity} • ${(base + extra).toFixed(2)} ea</p>
                                  </div>
                                  <p className="text-xs font-sans font-black text-slate-900">${((base + extra) * item.quantity).toFixed(2)}</p>
                               </div>
                            );
                         })}
                      </div>

                      {/* Fixed Calculation Section */}
                      <div className="pt-4 border-t border-slate-100 space-y-2 shrink-0">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium text-xs">Subtotal</span>
                            <span className="text-slate-900 font-bold text-xs">${subtotal.toFixed(2)}</span>
                         </div>
                         
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium text-xs">Shipping</span>
                            <span className="text-slate-900 font-bold text-xs">{shipping === 0 ? <span className="text-emerald-500 uppercase text-[10px] font-black tracking-widest">Free</span> : `$${shipping.toFixed(2)}`}</span>
                         </div>
                         
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium text-xs">Estimated Tax</span>
                            <span className="text-slate-900 font-bold text-xs">${tax.toFixed(2)}</span>
                         </div>

                         {appliedDiscount && (
                            <div className="py-2 px-3 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center animate-fadeIn">
                               <span className="text-[9px] font-black uppercase text-emerald-700 tracking-widest">Savings</span>
                               <span className="text-xs font-sans font-black text-emerald-700">-${parseFloat(appliedDiscount.discountAmount).toFixed(2)}</span>
                            </div>
                         )}

                         {appliedDiscount?.type === 'buy_x_get_y' && parseFloat(appliedDiscount.discountAmount) > 0 && (
                            <p className="text-[9px] text-emerald-600 font-black uppercase tracking-[0.1em] text-center italic py-1">
                               ✨ BOGO Offer Activated
                            </p>
                         )}

                         <div className="pt-4 flex justify-between items-center border-t border-slate-100 mt-2">
                            <span className="text-base font-serif text-slate-900 italic">Total</span>
                            <div className="text-right">
                               <p className="text-xl font-sans font-bold text-slate-900 tracking-tight">${total.toFixed(2)}</p>
                               <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">USD</p>
                            </div>
                         </div>
                      </div>
                  </div>
               </div>
            </div>
         </main>

         <CartSidebar />
         <Footer />

         <Modal
            isOpen={isMessageModalOpen}
            onClose={() => setIsMessageModalOpen(false)}
            title={`${formData.occasion} Message Gallery`}
            footer={
               <div className="flex gap-4">
                  <button
                     onClick={() => setIsMessageModalOpen(false)}
                     className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={handleApplyTemplate}
                     disabled={!tempSelectedMessage}
                     className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-accent transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50"
                  >
                     Apply Selection
                  </button>
               </div>
            }
         >
            <div className="space-y-4">
               <p className="text-xs text-slate-400 font-medium italic mb-6">Select a curated botanical message to accompany your arrangement.</p>
               {occasionMessages[formData.occasion]?.map((msg, idx) => (
                  <div
                     key={idx}
                     onClick={() => setTempSelectedMessage(msg)}
                     className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${tempSelectedMessage === msg ? 'border-brand-primary bg-violet-50 shadow-lg' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                  >
                     <div className="flex gap-4 items-start">
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${tempSelectedMessage === msg ? 'border-brand-primary bg-brand-primary text-white' : 'border-slate-200'}`}>
                           {tempSelectedMessage === msg && <IconCheck size={14} strokeWidth={4} />}
                        </div>
                        <p className={`text-sm leading-relaxed ${tempSelectedMessage === msg ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>"{msg}"</p>
                     </div>
                  </div>
               ))}
            </div>
         </Modal>

         <Modal
            isOpen={errorModal.isOpen}
            onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
            title={errorModal.title}
            footer={
               <button
                  onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
                  className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-brand-primary transition-all shadow-2xl"
               >
                  Understood
               </button>
            }
         >
            <div className="flex flex-col items-center text-center space-y-8 py-4">
               <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
               </div>
               <div className="space-y-3">
                  <h4 className="text-xl font-serif text-slate-900 italic">System Interruption</h4>
                  <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                     {errorModal.message}
                  </p>
               </div>
            </div>
         </Modal>
         <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => {
               setIsAuthModalOpen(false);
               // if (!customer) navigate('/cart'); // Optional: enforce login or allow guest
            }} 
            initialMode="register" 
         />
      </div>
   );
};

export default Checkout;
