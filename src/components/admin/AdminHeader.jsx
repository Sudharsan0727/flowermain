import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    IconFlower,
    IconSearch,
    IconBell,
    IconMessageDots,
    IconExternalLink,
    IconChevronDown,
    IconUser,
    IconLogout,
    IconSettings,
    IconCalendar,
    IconX,
    IconArrowRight,
    IconShoppingBag,
    IconUsers,
    IconPackage
} from "@tabler/icons-react";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { getImageUrl } from "../../utils/imageHelper";
import { cn } from "../../lib/utils";
import API_BASE from "../../config";

const AdminHeader = () => {
    const { admin, logout } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();

    // UI State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isMessagesOpen, setIsMessagesOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [globalResults, setGlobalResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const searchInputRef = useRef(null);

    // Static Navigation Pages
    const searchablePages = [
        { title: "Executive Overview", path: "/admin", category: "Navigation", type: 'page' },
        { title: "Product Inventory", path: "/admin/products", category: "Navigation", type: 'page' },
        { title: "Main Banners", path: "/admin/banners", category: "Navigation", type: 'page' },
        { title: "General Settings", path: "/admin/settings?tab=general", category: "Navigation", type: 'page' },
        { title: "Staff Management", path: "/admin/settings?tab=staff", category: "Navigation", type: 'page' },
        { title: "Customer Registry", path: "/admin/customers", category: "Navigation", type: 'page' },
        { title: "Order History", path: "/admin/orders", category: "Navigation", type: 'page' },
        { title: "Media Library", path: "/admin/media", category: "Navigation", type: 'page' },
    ];

    // Global Search Logic (Live Data)
    useEffect(() => {
        if (searchQuery.length < 2) {
            setGlobalResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            try {
                // Fetch from multiple sources in parallel
                const [prodRes, orderRes, custRes] = await Promise.all([
                    fetch(`${API_BASE}/api/products?search=${searchQuery}`, { credentials: 'include' }),
                    fetch(`${API_BASE}/api/orders?search=${searchQuery}`, { credentials: 'include' }),
                    fetch(`${API_BASE}/api/customers?search=${searchQuery}`, { credentials: 'include' })
                ]);

                const prods = await prodRes.json();
                const orders = await orderRes.json();
                const custs = await custRes.json();

                const results = [
                    ...(prods.products || prods || []).slice(0, 3).map(p => ({ title: p.name, path: `/admin/products?id=${p.id}`, category: "Product", type: 'product' })),
                    ...(orders.orders || orders || []).slice(0, 3).map(o => ({ title: `Order #${o.id}`, path: `/admin/orders?id=${o.id}`, category: "Order", type: 'order' })),
                    ...(custs.customers || custs || []).slice(0, 3).map(c => ({ title: c.username || c.email, path: `/admin/customers?id=${c.id}`, category: "Customer", type: 'customer' }))
                ];

                setGlobalResults(results);
            } catch (err) {
                console.error("Global search failed:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const filteredPages = [
        ...searchablePages.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())),
        ...globalResults
    ];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setIsProfileOpen(false);
                setIsNotificationsOpen(false);
                setIsMessagesOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearInterval(timer);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center justify-between px-6 shadow-sm">
                {/* Brand & Greeting Section */}
                <div className="flex items-center gap-8 w-auto">
                    <Link to="/admin" className="flex items-center gap-4 group transition-all">
                        <div className="h-16 flex items-center justify-center overflow-hidden">
                            {settings.site_logo ? (
                                <img
                                    src={getImageUrl(settings.site_logo)}
                                    alt={settings.site_name}
                                    className="h-full w-auto object-contain py-1"
                                />
                            ) : (
                                <IconFlower size={32} className="text-brand-primary" />
                            )}
                        </div>
                        <div className="hidden lg:block">
                            <h2 className="font-serif text-xl font-black text-slate-900 leading-none tracking-tight">
                                {settings.site_name?.split(' ')[0] || 'Bouquet'}
                            </h2>
                            <p className="text-xs uppercase tracking-[0.2em] text-brand-primary font-black mt-1 opacity-90">
                                {settings.site_name?.split(' ').slice(1).join(' ') || 'Explorer'}
                            </p>
                        </div>
                    </Link>

                    <div className="h-8 w-px bg-slate-100 hidden xl:block" />

                    <div className="hidden xl:block">
                        <h3 className="text-sm font-bold text-slate-800">{getGreeting()}, {admin?.username || 'Admin'}!</h3>
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <IconCalendar size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{formatDate(currentTime)}</span>
                        </div>
                    </div>
                </div>

                {/* Enhanced User-Friendly Search Trigger */}
                <div className="flex-1 max-w-lg mx-8 flex items-center">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="relative flex-1 group flex items-center px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-brand-primary/30 transition-all text-slate-400"
                    >
                        <IconSearch size={18} className="mr-3 group-hover:text-brand-primary transition-colors" />
                        <span className="text-sm font-medium">Quick Search...</span>
                        <div className="ml-auto flex items-center">
                            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-200 rounded bg-white">Ctrl + K</kbd>
                        </div>
                    </button>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    {/* View Store Quick Link */}
                    <Link
                        to="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-brand-primary font-bold text-xs transition-all hover:bg-brand-secondary rounded-xl"
                    >
                        <IconExternalLink size={16} />
                        <span>View Store</span>
                    </Link>

                    <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block" />

                    <div className="flex items-center gap-1 text-slate-400 relative">
                        {/* Messages */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMessagesOpen(!isMessagesOpen)}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-xl transition-all relative group",
                                    isMessagesOpen ? "bg-brand-secondary text-brand-primary" : "hover:bg-slate-50"
                                )}
                            >
                                <IconMessageDots size={20} className="group-hover:scale-110 transition-transform" />
                                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                            </button>

                            {isMessagesOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMessagesOpen(false)} />
                                    <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Inbound Florist Chat</h4>
                                            <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-2 py-0.5 rounded-full">2 NEW</span>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {[
                                                { name: "John Doe", text: "Is the wedding bouquet collection updated?", time: "2 min ago", path: "/admin/products" },
                                                { name: "Sarah Smith", text: "Order #8492 delivery confirmation needed.", time: "1 hour ago", path: "/admin/orders?id=8492" },
                                                { name: "Global Support", text: "System maintenance scheduled for tonight.", time: "3 hours ago", path: "/admin" }
                                            ].map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => { navigate(msg.path); setIsMessagesOpen(false); }}
                                                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 group"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-sm font-bold text-slate-900">{msg.name}</span>
                                                        <span className="text-[10px] text-slate-400">{msg.time}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 line-clamp-1 group-hover:text-slate-700">{msg.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => { navigate("/admin/customers"); setIsMessagesOpen(false); }}
                                            className="w-full text-center py-3 text-[10px] font-black uppercase tracking-widest text-brand-primary bg-slate-50 hover:bg-brand-secondary transition-colors transition-all"
                                        >
                                            Open Florist Inbox
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={cn(
                                    "w-10 h-10 flex items-center justify-center rounded-xl transition-all relative group",
                                    isNotificationsOpen ? "bg-brand-secondary text-brand-primary" : "hover:bg-slate-50"
                                )}
                            >
                                <IconBell size={20} className="group-hover:scale-110 transition-transform" />
                            </button>

                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                    <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">System Notifications</h4>
                                            <button className="text-[10px] font-bold text-brand-primary hover:underline">Mark all read</button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {[
                                                { title: "Low Stock Alert", desc: "Red Roses (50cm) is below critical limit.", icon: "bg-amber-500", time: "10 min ago", path: "/admin/products" },
                                                { title: "New Order", desc: "Order #8493 was just placed by Sarah Smith.", icon: "bg-emerald-500", time: "25 min ago", path: "/admin/orders?id=8493" },
                                                { title: "Backup Complete", desc: "Daily florist data backup successful.", icon: "bg-blue-500", time: "4 hours ago", path: "/admin/settings?tab=general" }
                                            ].map((note, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => { navigate(note.path); setIsNotificationsOpen(false); }}
                                                    className="p-4 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0 flex gap-3"
                                                >
                                                    <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", note.icon)} />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{note.title}</p>
                                                        <p className="text-xs text-slate-500">{note.desc}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">{note.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => { navigate("/admin/products"); setIsNotificationsOpen(false); }}
                                            className="w-full text-center py-3 text-[10px] font-black uppercase tracking-widest text-brand-primary bg-slate-50 hover:bg-brand-secondary transition-colors transition-all"
                                        >
                                            View Security Registry
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-100 mx-1" />

                    {/* Profile Section */}
                    <div className="relative ml-2">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`flex items-center gap-2 pl-2 pr-1 py-1 rounded-2xl transition-all ${isProfileOpen ? "bg-brand-secondary/50" : "hover:bg-slate-50"}`}
                        >
                            <div className="w-9 h-9 rounded-full bg-brand-secondary border border-brand-primary/10 p-0.5 overflow-hidden shadow-inner">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                                    alt="Admin Profile"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <IconChevronDown size={14} className={`text-slate-400 transition-transform duration-300 mr-1 ${isProfileOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl z-50 p-2 animate-fade-in origin-top-right ring-4 ring-slate-900/5">
                                    <div className="p-4 flex items-center gap-3 border-b border-slate-50 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-brand-primary shrink-0">
                                            <IconUser size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 uppercase tracking-tight truncate">{admin?.username || 'Admin User'}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{admin?.role || 'Store Manager'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Link
                                            to="/admin/settings"
                                            onClick={() => setIsProfileOpen(false)}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-brand-secondary hover:text-brand-primary rounded-2xl transition-all"
                                        >
                                            <IconSettings size={18} />
                                            System Settings
                                        </Link>
                                        <button
                                            onClick={logout}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                        >
                                            <IconLogout size={18} />
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Global Command Palette (Search Overlay) */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:pt-40">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSearchOpen(false)} />
                    <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
                        <div className="p-6 border-b border-slate-50 flex items-center">
                            <IconSearch size={24} className="text-brand-primary mr-4" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Type to find pages, products, or settings..."
                                className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-slate-900 placeholder-slate-300"
                            />
                            <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                                <IconX size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                            {filteredPages.length > 0 ? (
                                filteredPages.map((page, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            navigate(page.path);
                                            setIsSearchOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between p-4 hover:bg-brand-secondary rounded-2xl transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-white flex items-center justify-center text-slate-400 group-hover:text-brand-primary transition-all">
                                                {page.type === 'product' && <IconPackage size={20} />}
                                                {page.type === 'order' && <IconShoppingBag size={20} />}
                                                {page.type === 'customer' && <IconUsers size={20} />}
                                                {page.type === 'page' && <IconFlower size={20} />}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-slate-900 line-clamp-1">{page.title}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{page.category}</p>
                                            </div>
                                        </div>
                                        <IconArrowRight size={18} className="text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-slate-400 font-medium">No results found for "{searchQuery}"</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-200 rounded bg-white">ESC</kbd>
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">to close</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 border border-slate-200 rounded bg-white">ENTER</kbd>
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">to select</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminHeader;



