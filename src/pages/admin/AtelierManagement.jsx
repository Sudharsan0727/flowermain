import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import {

    IconPlus,
    IconEdit,
    IconTrash,
    IconEye,
    IconCircleCheckFilled,
    IconCircleXFilled,
    IconX,
    IconPencil,
    IconDeviceFloppy,
    IconGripVertical,
    IconClock
} from "@tabler/icons-react";
import { Reorder } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";

const SETTINGS_API = `${API_BASE}/api/section-settings`;
const SECTION_KEY = "atelier";

const AtelierManagement = () => {
    const API_URL = `${API_BASE}/api/atelier-hours`;
    const [hours, setHours] = useState([]);
    const [hasChanged, setHasChanged] = useState(false);
    const [editingHour, setEditingHour] = useState(null);
    const { showNotification } = useNotification();

    // Section heading/description state
    const [sectionSettings, setSectionSettings] = useState({
        atelier_tagline: "Visit Our Florist",
        atelier_heading: "Step into our London studio to experience the scents and textures of our latest floral arrivals in person.",
        atelier_description: "Visits and pick-up orders are strictly limited to these hours.",
        atelier_location_title: "Florist Location",
        atelier_location_text: "84 Kings Road, Chelsea, London SW3 4TZ",
        atelier_concierge_title: "Concierge",
        atelier_concierge_text: "+44 20 7123 4567, hello@boutique.com",
        atelier_btn1_text: "Get Directions",
        atelier_btn1_link: "/directions",
        atelier_btn2_text: "Navigate to Studio",
        atelier_btn2_link: "/studio",
    });
    const [isEditingSection, setIsEditingSection] = useState(false);
    const [sectionDraft, setSectionDraft] = useState({});

    // Modal state for actions
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchHours();
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
            console.error(err);
            showNotification("Failed to save settings.", "error");
        }
    };

    const fetchHours = async () => {
        try {
            const res = await fetch(API_URL, { credentials: 'include' });
            const data = await res.json();
            setHours(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReorder = (newOrder) => {
        setHours(newOrder);
        setHasChanged(true);
    };

    const handleSaveSequence = async () => {
        try {
            const orderedIds = hours.map(h => h.id);
            await fetch(`${API_URL}/reorder`, {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds })
            });
            setHasChanged(false);
            showNotification("Sequence saved!", "success");
        } catch (err) {
            showNotification("Failed to save sequence.", "error");
        }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            const method = editingHour.id ? 'PUT' : 'POST';
            const url = editingHour.id ? `${API_URL}/${editingHour.id}` : API_URL;
            await fetch(url, {
                credentials: 'include',
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingHour)
            });
            fetchHours();
            setEditingHour(null);
            showNotification(`Day ${editingHour.id ? 'updated' : 'added'} successfully!`, "success");
        } catch (error) {
            showNotification("Error saving.", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/${deletingId}`, { method: 'DELETE', credentials: 'include' });
            fetchHours();
            setIsPromptModalOpen(false);
            showNotification("Deleted successfully.", "success");
        } catch (e) {
            showNotification("Failed to delete.", "error");
        }
    };

    const handleToggleStatus = async (hour) => {
        try {
            const newStatus = hour.status === 'Active' ? 'Inactive' : 'Active';
            await fetch(`${API_URL}/${hour.id}`, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchHours();
        } catch (e) { console.error(e); }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">

                {/* Page Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Florist Management</h1>
                        <p className="text-slate-500 font-medium">Control the business hours, location, and concierge details.</p>
                    </div>
                    <div className="flex gap-3">
                        {hasChanged && (
                            <button onClick={handleSaveSequence} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-100">
                                Save Sequence
                            </button>
                        )}
                        <button
                            onClick={() => setEditingHour({ day: '', hours: '', status: 'Active', isClosed: false })}
                            className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <IconPlus size={18} />
                            Add New Day
                        </button>
                    </div>
                </div>

                {/* ── Section Heading & Info Editor ── */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-base font-black text-slate-800 tracking-tight">Section Content &amp; Contact Info</h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">Edit main title, descriptions, and the footer contact blocks.</p>
                        </div>
                        {!isEditingSection ? (
                            <button
                                onClick={() => { setSectionDraft({ ...sectionSettings }); setIsEditingSection(true); }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-brand-secondary text-brand-primary rounded-xl font-bold text-xs hover:bg-brand-primary hover:text-white transition-all"
                            >
                                <IconPencil size={15} />
                                Edit Content
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-slate-50 p-8 rounded-2xl border border-slate-100">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{sectionSettings.atelier_tagline}</span>
                                <h3 className="text-2xl font-serif text-slate-800 leading-tight">{sectionSettings.atelier_heading}</h3>
                                <p className="text-xs text-slate-400 italic">** {sectionSettings.atelier_description}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 md:border-t-0 md:border-l md:pl-10">
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sectionSettings.atelier_location_title}</h4>
                                    <p className="text-xs text-slate-700 font-bold leading-relaxed">{sectionSettings.atelier_location_text}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sectionSettings.atelier_concierge_title}</h4>
                                    <p className="text-xs text-slate-700 font-bold leading-relaxed">{sectionSettings.atelier_concierge_text}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Tagline (Left Header)</label>
                                    <input type="text" value={sectionDraft.atelier_tagline || ''} onChange={e => setSectionDraft({ ...sectionDraft, atelier_tagline: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Footnote Quote (Right Footer)</label>
                                    <input type="text" value={sectionDraft.atelier_description || ''} onChange={e => setSectionDraft({ ...sectionDraft, atelier_description: e.target.value })} className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Main Heading Text</label>
                                <textarea rows="2" value={sectionDraft.atelier_heading || ''} onChange={e => setSectionDraft({ ...sectionDraft, atelier_heading: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-serif italic" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-2">Location Block</h4>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Title</label>
                                        <input type="text" value={sectionDraft.atelier_location_title || ''} onChange={e => setSectionDraft({ ...sectionDraft, atelier_location_title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Address Text</label>
                                        <input type="text" value={sectionDraft.atelier_location_text || ''} onChange={e => setSectionDraft({ ...sectionDraft, atelier_location_text: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-2">Concierge Block</h4>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Title</label>
                                        <input type="text" value={sectionDraft.atelier_concierge_title || ''} onChange={e => setSectionDraft({ ...sectionDraft, atelier_concierge_title: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Contact Details</label>
                                        <input type="text" value={sectionDraft.atelier_concierge_text || ''} onChange={e => setSectionDraft({ ...sectionDraft, atelier_concierge_text: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-2">Button 1 (Directions)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Text</label>
                                            <input type="text" value={sectionDraft.atelier_btn1_text || ''} onChange={e => setSectionDraft({ ...sectionDraft, atelier_btn1_text: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Link/URL</label>
                                            <input type="text" value={sectionDraft.atelier_btn1_link || ''} onChange={e => setSectionDraft({ ...sectionDraft, atelier_btn1_link: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b pb-2">Button 2 (Studio)</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Text</label>
                                            <input type="text" value={sectionDraft.atelier_btn2_text || ''} onChange={e => setSectionDraft({ ...sectionDraft, atelier_btn2_text: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Link/URL</label>
                                            <input type="text" value={sectionDraft.atelier_btn2_link || ''} onChange={e => setSectionDraft({ ...sectionDraft, atelier_btn2_link: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hours Reorderable List */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto no-scrollbar">
                        <div className="min-w-[800px]">
                            <div className="bg-slate-50 border-b border-slate-100 flex items-center py-5">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-20 flex-1">Day &amp; Schedule</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-[160px] px-8">Status</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right w-[150px] px-8">Actions</div>
                            </div>

                            <Reorder.Group axis="y" values={hours} onReorder={handleReorder} className="divide-y divide-slate-50">

                                {hours.map((item) => (
                                    <Reorder.Item
                                        key={item.id}
                                        value={item}
                                        className="group hover:bg-brand-secondary/30 transition-all duration-300 w-full flex items-center cursor-grab active:cursor-grabbing"
                                    >
                                        <div className="flex-1 flex items-center py-6">
                                            <div className="pl-8 text-slate-200 group-hover:text-brand-primary transition-colors">
                                                <IconGripVertical size={24} />
                                            </div>
                                            <div className="flex-1 px-6 flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-all">
                                                    <IconClock size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-slate-800 tracking-tight font-serif group-hover:text-brand-primary transition-colors">{item.day}</p>
                                                    <p className={`text-xs font-bold ${item.isClosed ? 'text-rose-500 italic' : 'text-slate-500'}`}>
                                                        {item.isClosed ? 'Closed' : item.hours}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="px-8 w-[160px]">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${item.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                                    {item.status === "Active" ? <IconCircleCheckFilled size={14} /> : <IconCircleXFilled size={14} />}
                                                    {item.status}
                                                </div>
                                            </div>
                                            <div className="px-8 flex items-center justify-end gap-3 w-[150px]">
                                                <button onClick={() => handleToggleStatus(item)} className="text-slate-400 hover:text-blue-500 transition-colors">
                                                    <IconEye size={18} />
                                                </button>
                                                <button onClick={() => setEditingHour(item)} className="text-slate-400 hover:text-brand-primary transition-colors">
                                                    <IconEdit size={18} />
                                                </button>
                                                <button onClick={() => { setDeletingId(item.id); setModalTitle("Delete Day"); setIsPromptModalOpen(true); }} className="text-slate-400 hover:text-rose-500 transition-colors">
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
                {editingHour && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 relative">
                            <button
                                onClick={() => setEditingHour(null)}
                                className="absolute top-6 right-6 w-10 h-10 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                                <IconX size={20} className="stroke-[3]" />
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 font-serif mb-8 text-center italic">{editingHour.id ? 'Edit Day' : 'Add Day'}</h2>
                            <form onSubmit={handleEditSave} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Day Name</label>
                                    <input type="text" value={editingHour.day} onChange={e => setEditingHour({ ...editingHour, day: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-serif text-slate-800" placeholder="e.g. Monday" required />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <input type="checkbox" checked={editingHour.isClosed} onChange={e => setEditingHour({ ...editingHour, isClosed: e.target.checked })} className="w-4 h-4 rounded border-slate-200 text-brand-primary focus:ring-brand-primary" id="isClosed" />
                                    <label htmlFor="isClosed" className="text-sm font-bold text-slate-700">Mark as 'Closed'</label>
                                </div>
                                {!editingHour.isClosed && (
                                    <div>
                                        <label className="block text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Operating Hours</label>
                                        <input type="text" value={editingHour.hours} onChange={e => setEditingHour({ ...editingHour, hours: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="e.g. 8:30 AM - 4:30 PM" />
                                    </div>
                                )}
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setEditingHour(null)} className="flex-1 h-14 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl">Cancel</button>
                                    <button type="submit" className="flex-2 h-14 bg-brand-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg hover:bg-brand-accent transition-colors">Save Details</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                <Modal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} title={modalTitle}>
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                            <IconTrash size={40} />
                        </div>
                        <p className="text-slate-500 text-sm">Are you sure you want to remove this day? This will hide it from the footer schedule.</p>
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

export default AtelierManagement;



