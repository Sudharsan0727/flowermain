import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import {

    IconPlus,
    IconEdit,
    IconTrash,
    IconEye,
    IconGripVertical,
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconX,
    IconPencil,
    IconDeviceFloppy
} from "@tabler/icons-react";
import { Reorder } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";

const SETTINGS_API = `${API_BASE}/api/section-settings`;
const SECTION_KEY = "faq";

const FaqManagement = () => {
    const API_URL = `${API_BASE}/api/faqs`;
    const [faqs, setFaqs] = useState([]);
    const [hasChanged, setHasChanged] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const { showNotification } = useNotification();

    // Section heading/description state
    const [sectionSettings, setSectionSettings] = useState({
        faq_tagline: "Common Inquiries",
        faq_heading: "Your Questions, Answered.",
        faq_description: "Everything you need to know about our sourcing, delivery, and floral care. Can't find what you're looking for?",
        faq_button_text: "Contact Our Studio"
    });
    const [isEditingSection, setIsEditingSection] = useState(false);
    const [sectionDraft, setSectionDraft] = useState({});

    // Modal state for actions
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchFaqs();
        fetchSectionSettings();
    }, []);

    const fetchSectionSettings = async () => {
        try {
            const res = await fetch(`${SETTINGS_API}?section=${SECTION_KEY}`, { credentials: 'include' });
            const data = await res.json();
            if (Object.keys(data).length > 0) {
                setSectionSettings(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveSectionSettings = async () => {
        try {
            await fetch(`${SETTINGS_API}/upsert`, {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sectionDraft)
            });
            setSectionSettings(prev => ({ ...prev, ...sectionDraft }));
            setIsEditingSection(false);
            showNotification("Section settings saved!", "success");
        } catch (err) {
            showNotification("Failed to save settings.", "error");
        }
    };

    const fetchFaqs = async () => {
        try {
            const res = await fetch(API_URL, { credentials: 'include' });
            const data = await res.json();
            setFaqs(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReorder = (newOrder) => {
        setFaqs(newOrder);
        setHasChanged(true);
    };

    const handleSaveSequence = async () => {
        try {
            const orderedIds = faqs.map(f => f.id);
            await fetch(`${API_URL}/reorder`, {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds })
            });
            setHasChanged(false);
            showNotification("FAQ sequence saved!", "success");
        } catch (err) {
            showNotification("Failed to save sequence.", "error");
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const method = editingFaq.id ? 'PUT' : 'POST';
            const url = editingFaq.id ? `${API_URL}/${editingFaq.id}` : API_URL;
            await fetch(url, {
                credentials: 'include',
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingFaq)
            });
            fetchFaqs();
            setEditingFaq(null);
            showNotification(`FAQ ${editingFaq.id ? 'updated' : 'created'} successfully!`, "success");
        } catch (error) {
            showNotification("Error saving FAQ.", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/${deletingId}`, { method: 'DELETE', credentials: 'include' });
            fetchFaqs();
            setIsPromptModalOpen(false);
            showNotification("FAQ deleted successfully.", "success");
        } catch (e) {
            showNotification("Failed to delete.", "error");
        }
    };

    const handleToggleStatus = async (faq) => {
        try {
            const newStatus = faq.status === 'Active' ? 'Inactive' : 'Active';
            await fetch(`${API_URL}/${faq.id}`, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchFaqs();
        } catch (e) { console.error(e); }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">

                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">FAQ Management</h1>
                        <p className="text-slate-500 font-medium">Manage all questions and answers displayed in the premium FAQ section.</p>
                    </div>
                    <div className="flex gap-3">
                        {hasChanged && (
                            <button onClick={handleSaveSequence} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-100">
                                Save Sequence
                            </button>
                        )}
                        <button
                            onClick={() => setEditingFaq({ question: '', answer: '', status: 'Active' })}
                            className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <IconPlus size={18} />
                            Add New FAQ
                        </button>
                    </div>
                </div>

                {/* ── Section Heading / Description Editor ── */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-black text-slate-800 tracking-tight">Section Heading &amp; Description</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Controls the left panel text — tagline, big heading, description paragraph, and button label.</p>
                        </div>
                        {!isEditingSection ? (
                            <button
                                onClick={() => { setSectionDraft({ ...sectionSettings }); setIsEditingSection(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand-secondary text-brand-primary rounded-xl font-bold text-xs hover:bg-brand-primary hover:text-white transition-all"
                            >
                                <IconPencil size={15} />
                                Edit Section
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingSection(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">
                                    Cancel
                                </button>
                                <button onClick={handleSaveSectionSettings} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-100">
                                    <IconDeviceFloppy size={15} />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>

                    {!isEditingSection ? (
                        // Preview mode — mirrors the homepage left panel
                        <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest block">{sectionSettings.faq_tagline}</span>
                            <h3 className="text-2xl font-serif text-slate-800 leading-tight">{sectionSettings.faq_heading}</h3>
                            <p className="text-sm text-slate-500 font-light leading-relaxed">{sectionSettings.faq_description}</p>
                            <div className="pt-2">
                                <span className="inline-flex items-center gap-3 text-brand-primary font-bold text-[10px] tracking-widest uppercase border-b border-brand-primary/30 pb-1">
                                    {sectionSettings.faq_button_text}
                                    {/* <svg width="14" height="10" viewBox="0 0 18 12" fill="none" className="stroke-current"><path d="M12 1L17 6L12 11M1 6H17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> */}
                                </span>
                            </div>
                        </div>
                    ) : (
                        // Edit mode
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                        Top Tagline <span className="text-slate-400 normal-case font-normal tracking-normal">e.g. "Common Inquiries"</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={sectionDraft.faq_tagline || ''}
                                        onChange={e => setSectionDraft({ ...sectionDraft, faq_tagline: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm"
                                        placeholder="e.g. Common Inquiries"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                        Button Text <span className="text-slate-400 normal-case font-normal tracking-normal">e.g. "Contact Our Studio"</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={sectionDraft.faq_button_text || ''}
                                        onChange={e => setSectionDraft({ ...sectionDraft, faq_button_text: e.target.value })}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm"
                                        placeholder="e.g. Contact Our Studio"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                    Main Heading <span className="text-slate-400 normal-case font-normal tracking-normal">e.g. "Your Questions, Answered."</span>
                                </label>
                                <input
                                    type="text"
                                    value={sectionDraft.faq_heading || ''}
                                    onChange={e => setSectionDraft({ ...sectionDraft, faq_heading: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm font-serif"
                                    placeholder="e.g. Your Questions, Answered."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">
                                    Description Paragraph
                                </label>
                                <textarea
                                    value={sectionDraft.faq_description || ''}
                                    onChange={e => setSectionDraft({ ...sectionDraft, faq_description: e.target.value })}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-colors text-sm"
                                    rows="3"
                                    placeholder="Everything you need to know about our sourcing..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* FAQs List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                        <div className="min-w-[800px]">
                            <div className="bg-slate-50 border-b border-slate-100 flex items-center py-5">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-20 flex-1 min-w-[300px]">Question &amp; Answer</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-[150px] px-8">Status</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right min-w-[150px] px-8">Actions</div>
                            </div>

                            <Reorder.Group axis="y" values={faqs} onReorder={handleReorder} className="divide-y divide-slate-50">

                                {faqs.map((faq) => (
                                    <Reorder.Item
                                        key={faq.id}
                                        value={faq}
                                        className="group hover:bg-brand-secondary/30 transition-all duration-300 w-full flex items-center cursor-grab active:cursor-grabbing"
                                    >
                                        <div className="flex-1 flex items-start py-6">
                                            <div className="pl-8 pt-1 text-slate-200 group-hover:text-brand-primary transition-colors">
                                                <IconGripVertical size={24} />
                                            </div>
                                            <div className="flex-1 px-6 min-w-[300px]">
                                                <p className="text-sm font-black text-slate-800 tracking-tight font-serif mb-1 group-hover:text-brand-primary transition-colors">{faq.question}</p>
                                                <p className="text-xs text-slate-500 font-light leading-relaxed line-clamp-2">{faq.answer}</p>
                                            </div>
                                            <div className="px-8 w-[150px] pt-1">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${faq.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                    {faq.status === "Active" ? <IconCircleCheckFilled size={14} /> : <IconCircleXFilled size={14} />}
                                                    {faq.status}
                                                </div>
                                            </div>
                                            <div className="px-8 flex items-center justify-end gap-3 min-w-[150px] pt-1">
                                                <button onClick={() => handleToggleStatus(faq)} className="text-slate-400 hover:text-blue-500 transition-colors">
                                                    <IconEye size={18} />
                                                </button>
                                                <button onClick={() => setEditingFaq(faq)} className="text-slate-400 hover:text-brand-primary transition-colors">
                                                    <IconEdit size={18} />
                                                </button>
                                                <button onClick={() => { setDeletingId(faq.id); setModalTitle("Delete FAQ"); setIsPromptModalOpen(true); }} className="text-slate-400 hover:text-rose-500 transition-colors">
                                                    <IconTrash size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </div>
                    </div>
                </div>


                {/* Editor Modal */}
                {editingFaq && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-10 relative">
                            <button
                                onClick={() => setEditingFaq(null)}
                                className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                                <IconX size={20} className="stroke-[3]" />
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 font-serif mb-8 text-center italic">{editingFaq.id ? 'Edit FAQ' : 'Add New FAQ'}</h2>
                            <form onSubmit={handleEditSave} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Question</label>
                                    <input type="text" value={editingFaq.question} onChange={e => setEditingFaq({ ...editingFaq, question: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-serif text-slate-800" placeholder="e.g., Do you offer same-day delivery?" required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Answer</label>
                                    <textarea value={editingFaq.answer} onChange={e => setEditingFaq({ ...editingFaq, answer: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" rows="5" placeholder="Detailed answer explaining your policy..." required />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setEditingFaq(null)} className="flex-1 h-14 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl">Cancel</button>
                                    <button type="submit" className="flex-2 h-14 bg-brand-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:bg-brand-accent transition-colors">Save FAQ</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Prompt Modal */}
                <Modal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} title={modalTitle}>
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                            <IconTrash size={40} />
                        </div>
                        <p className="text-slate-500 text-sm">Are you sure you want to remove this FAQ? This action cannot be undone.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setIsPromptModalOpen(false)} className="flex-1 h-14 bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 h-14 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl">Confirm Delete</button>
                        </div>
                    </div>
                </Modal>

            </div>
        </AdminLayout>
    );
};

export default FaqManagement;



