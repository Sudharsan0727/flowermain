import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconMail, IconLock, IconUser, IconPhone, IconArrowRight } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { cn } from '../lib/utils';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onToggleMode }) {
    const { customerLogin, customerRegister } = useAuth();
    const { showNotification } = useNotification();
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let result;
            if (isLogin) {
                result = await customerLogin(form.email, form.password);
            } else {
                result = await customerRegister(form);
            }

            if (result.success) {
                if (result.needsVerification) {
                    showNotification("Please check your email and verify your identity to proceed.", "info", 5000);
                    setSuccess(true);
                } else {
                    onClose();
                }
            } else {
                setError(result.error ? `${result.message}: ${result.error}` : result.message);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Header Image/Pattern */}
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(124,58,237,0.2),transparent_50%)]"></div>
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md"
                        >
                            <IconX size={20} />
                        </button>
                        <div className="absolute bottom-6 left-10">
                            <h2 className="text-2xl font-serif text-white italic">
                                {success ? 'Identity Initialized' : (isLogin ? 'Enter the Vault' : 'Join the Archive')}
                            </h2>
                        </div>
                    </div>

                    <div className="p-10 space-y-8">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-rose-50 border border-rose-100 text-rose-500 text-xs font-bold rounded-2xl flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                {error}
                            </motion.div>
                        )}

                        {success ? (
                            <div className="text-center space-y-6 py-4">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                                    <IconMail size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-bold text-slate-900">Verification Sent</h4>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                        An authentication link has been dispatched to <span className="text-slate-900 font-bold">{form.email}</span>. Please verify your identity to proceed.
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setSuccess(false); setIsLogin(true); }}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-brand-primary transition-all"
                                >
                                    Proceed to Login
                                </button>
                            </div>
                        ) : (
                            <>
                            <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">First Name</label>
                                        <div className="relative">
                                            <IconUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Jane"
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all"
                                                value={form.first_name}
                                                onChange={e => setForm({ ...form, first_name: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Doe"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all"
                                            value={form.last_name}
                                            onChange={e => setForm({ ...form, last_name: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                <div className="relative">
                                    <IconMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="jane@example.com"
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone Number</label>
                                    <div className="relative">
                                        <IconPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+44 700 000 000"
                                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Secret Key (Password)</label>
                                <div className="relative">
                                    <IconLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-brand-primary transition-all shadow-xl disabled:opacity-50 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {loading ? 'Initializing...' : (isLogin ? 'Access Archive' : 'Establish Identity')}
                                    {!loading && <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                                </span>
                            </button>
                        </form>

                        <div className="pt-6 border-t border-slate-50 text-center space-y-4">
                            <p className="text-xs text-slate-400 font-medium">
                                {isLogin ? "New to our botanical circle?" : "Already part of the archive?"}
                            </p>
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                            >
                                {isLogin ? 'Request Invitation (Register)' : 'Enter Vault (Login)'}
                            </button>
                            
                            <button 
                                onClick={onClose}
                                className="block w-full text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-500 pt-2"
                            >
                                Continue Browsing as Guest
                            </button>
                        </div>
                        </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
