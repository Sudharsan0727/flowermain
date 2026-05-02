import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import { IconDeviceFloppy, IconUpload, IconPhoto } from "@tabler/icons-react";
import { useNotification } from "../../context/NotificationContext";
import { getImageUrl } from "../../utils/imageHelper";

const FuneralContentManagement = () => {
    const API_URL = `${API_BASE}/api/funeral/content`;
    const [content, setContent] = useState({
        bannerImage: '',
        bannerTitle: '',
        bannerSubtitle: '',
        bannerDescription: '',
        introText: '',
        introSubtext: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await fetch(API_URL, { credentials: 'include' });
            const data = await res.json();
            if (data) {
                setContent(data);
            }
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setIsLoading(false);
            showNotification("Failed to load funeral content.", "error");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await fetch(API_URL, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
            showNotification("Funeral content updated successfully!", "success");
        } catch (error) {
            console.error(error);
            showNotification("Failed to update content.", "error");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showNotification("File is too large (max 5MB).", "error");
            return;
        }

        showNotification("Uploading image...", "info");
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                credentials: 'include',
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.imageUrl) {
                setContent({ ...content, bannerImage: data.imageUrl });
                showNotification(`Image uploaded successfully!`, "success");
            } else {
                showNotification(data.error || "Upload failed.", "error");
            }
        } catch (error) {
            console.error('Upload failed:', error);
            showNotification("Upload failed. Please try again.", "error");
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-screen">Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Funeral Content</h1>
                        <p className="text-slate-500 font-medium">Manage the hero banner and introductory text for the Funeral Delivery page.</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                    <form onSubmit={handleSave} className="space-y-8">
                        {/* Hero Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">Hero Section</h2>
                            
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Banner Image</label>
                                <div className="relative group max-w-xl">
                                    <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 mb-3 flex items-center justify-center">
                                        {content.bannerImage ? (
                                            <img src={getImageUrl(content.bannerImage)} className="w-full h-full object-cover" alt="Banner Preview" />
                                        ) : (
                                            <IconPhoto size={40} className="text-slate-300" />
                                        )}
                                    </div>
                                    <label className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-brand-primary hover:text-brand-primary transition-colors text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm">
                                        <IconUpload size={16} /> Upload New Banner Image
                                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Banner Title</label>
                                    <input 
                                        type="text" 
                                        value={content.bannerTitle || ''} 
                                        onChange={(e) => setContent({ ...content, bannerTitle: e.target.value })} 
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-bold text-slate-700" 
                                        placeholder="e.g. Funeral & Memorial"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Banner Subtitle</label>
                                    <input 
                                        type="text" 
                                        value={content.bannerSubtitle || ''} 
                                        onChange={(e) => setContent({ ...content, bannerSubtitle: e.target.value })} 
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-bold text-brand-primary" 
                                        placeholder="e.g. Delivery Services"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Banner Description</label>
                                <textarea 
                                    value={content.bannerDescription || ''} 
                                    onChange={(e) => setContent({ ...content, bannerDescription: e.target.value })} 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium text-slate-600 leading-relaxed" 
                                    rows="3"
                                    placeholder="Description text under the title..."
                                />
                            </div>
                        </div>

                        {/* Intro Section */}
                        <div className="space-y-6 pt-6 border-t border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-2">Introductory Content</h2>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Main Intro Text</label>
                                <textarea 
                                    value={content.introText || ''} 
                                    onChange={(e) => setContent({ ...content, introText: e.target.value })} 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium text-slate-600 leading-relaxed" 
                                    rows="4"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Italic Subtext</label>
                                <input 
                                    type="text" 
                                    value={content.introSubtext || ''} 
                                    onChange={(e) => setContent({ ...content, introSubtext: e.target.value })} 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all font-medium italic text-slate-600" 
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <button type="submit" className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2">
                                <IconDeviceFloppy size={18} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default FuneralContentManagement;
