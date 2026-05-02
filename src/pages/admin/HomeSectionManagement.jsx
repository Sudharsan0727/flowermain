import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import { 

  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconPlus as IconAdd,
  IconPencil,
  IconDeviceFloppy,
  IconPhotoStar,
  IconX,
  IconGripVertical,
  IconEye,
  IconEyeOff
} from "@tabler/icons-react";
import { Reorder } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";

const SECTIONS_API = `${API_BASE}/api/home-sections`;

const HomeSectionManagement = ({ sectionType, pageTitle, description }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const { showNotification } = useNotification();
    const [hasChanged, setHasChanged] = useState(false);

    // Section heading state
    const [sectionSetting, setSectionSetting] = useState({
        title: "",
        subtitle: "",
        description: ""
    });
    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [headerDraft, setHeaderDraft] = useState({});

    // Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [sectionType]);

    useEffect(() => {
        if (editingItem) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [editingItem]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(SECTIONS_API, { credentials: 'include' });
            const data = await res.json();
            
            // Find our specific section header
            const currentSection = data.sections.find(s => s.section_type === sectionType);
            if (currentSection) {
                setSectionSetting(currentSection);
            } else {
                setSectionSetting({ title: pageTitle, subtitle: "", description: "" });
            }

            // Filter items for this section
            const sectionItems = data.items.filter(item => item.section_type === sectionType);
            setItems(sectionItems);
        } catch (err) {
            showNotification("Failed to fetch data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHeader = async () => {
        try {
            const res = await fetch(`${SECTIONS_API}/section/${sectionType}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(headerDraft),
                credentials: 'include'
            });
            if (res.ok) {
                setSectionSetting(await res.json());
                setIsEditingHeader(false);
                showNotification("Header updated successfully!", "success");
            }
        } catch (err) {
            showNotification("Error updating header", "error");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch(`${API_BASE}/api/upload`, { 
                method: 'POST', 
                body: formData,
                credentials: 'include'
            });
            const data = await res.json();
            if (data.imageUrl) {
                setEditingItem(prev => ({ ...prev, image: data.imageUrl }));
                setImagePreview(data.imageUrl);
            }
        } catch (err) {
            showNotification("Error uploading image", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleItemSave = async (e) => {
        e.preventDefault();
        try {
            const method = editingItem.id ? 'PUT' : 'POST';
            const url = editingItem.id ? `${SECTIONS_API}/items/${editingItem.id}` : `${SECTIONS_API}/items`;
            const payload = { ...editingItem, section_type: sectionType };
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            
            if (res.ok) {
                fetchData();
                setEditingItem(null);
                showNotification(`Item ${editingItem.id ? 'updated' : 'added'} successfully!`, "success");
            }
        } catch (error) {
            showNotification("Error saving item", "error");
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`${SECTIONS_API}/items/${deletingId}`, { 
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                fetchData();
                setIsDeleteModalOpen(false);
                showNotification("Item removed", "success");
            }
        } catch (e) {
            showNotification("Delete failed", "error");
        }
    };

    const handleToggleActive = async (item) => {
        try {
            const nextStatus = !item.is_active;
            const res = await fetch(`${SECTIONS_API}/items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: nextStatus }),
                credentials: 'include'
            });
            if (res.ok) {
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: nextStatus } : i));
                showNotification(`Item ${nextStatus ? 'activated' : 'deactivated'}`, "success");
            }
        } catch (error) {
            showNotification("Status update failed", "error");
        }
    };

    const handleReorder = (newOrder) => {
        setItems(newOrder);
        setHasChanged(true);
    };

    const handleSavePositions = async () => {
        try {
            const res = await fetch(`${SECTIONS_API}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds: items.map(i => i.id) }),
                credentials: 'include'
            });
            
            if (res.ok) {
                setHasChanged(false);
                showNotification("Gallery sequence synchronized!", "success");
            }
        } catch (error) {
            showNotification("Sequence synchronization failed.", "error");
        }
    };

    if (loading) return <AdminLayout><div className="p-20 text-center text-slate-400">Restoring boutique data...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-32">
                
                {/* Page Navigation Area */}
                <div className="mb-10 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">{pageTitle}</h1>
                        <p className="text-slate-500 font-medium">{description}</p>
                    </div>
                    <div className="flex gap-3">
                        {hasChanged && (
                            <button onClick={handleSavePositions} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-xs">
                                Save Sequence
                            </button>
                        )}
                        <button 
                            onClick={() => { setEditingItem({ title: '', price: '', image: '', badge: '', stock_status: 'In stock' }); setImagePreview(""); }}
                            className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 flex items-center gap-2"
                        >
                            <IconPlus size={18} />
                            Add New Arrangement
                        </button>
                    </div>
                </div>

                {/* Section Header Editor */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 mb-10 overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">Section Content Management</h2>
                            <p className="text-xs text-slate-400 font-medium tracking-tight">Customize the branding and call-to-action for this boutique collection.</p>
                        </div>
                        {!isEditingHeader ? (
                            <button 
                                onClick={() => { setHeaderDraft({ ...sectionSetting }); setIsEditingHeader(true); }}
                                className="px-5 py-2.5 bg-brand-secondary text-brand-primary rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-brand-primary hover:text-white transition-all"
                            >
                                <IconPencil size={14} /> Edit Header
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditingHeader(false)} className="px-5 py-2.5 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">Cancel</button>
                                <button onClick={handleSaveHeader} className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-100">
                                    <IconDeviceFloppy size={14} /> Save Header
                                </button>
                            </div>
                        )}
                    </div>

                    {!isEditingHeader ? (
                        <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[3px] mb-2 block">{sectionSetting.subtitle || "LATEST RELEASES"}</span>
                            <h3 className="text-3xl font-serif text-slate-900 mb-3 italic">{sectionSetting.title}</h3>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{sectionSetting.description || "Curated boutique arrangements designed for premium seasonal gifting."}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tagline (Subtitle)</label>
                                    <input 
                                        type="text" 
                                        value={headerDraft.subtitle} 
                                        onChange={e => setHeaderDraft({...headerDraft, subtitle: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm"
                                        placeholder="e.g. JUST ARRIVED"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Primary Heading</label>
                                    <input 
                                        type="text" 
                                        value={headerDraft.title} 
                                        onChange={e => setHeaderDraft({...headerDraft, title: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-serif"
                                        placeholder="e.g. Signature Arrangements"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description / Bio</label>
                                <textarea 
                                    rows={4}
                                    value={headerDraft.description} 
                                    onChange={e => setHeaderDraft({...headerDraft, description: e.target.value})}
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm no-scrollbar"
                                    placeholder="Briefly describe what makes this collection special..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Items Grid */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="divide-y divide-slate-50">
                        {items.length === 0 && <div className="p-20 text-center text-slate-300 italic font-medium">No curated items found in this collection. Start by adding one!</div>}
                        {items.map((item) => (
                            <Reorder.Item 
                                key={item.id} 
                                value={item}
                                className="group hover:bg-slate-50/50 transition-all duration-300 w-full flex items-center cursor-grab active:cursor-grabbing p-6"
                            >
                                <div className="text-slate-200 group-hover:text-brand-primary transition-colors mr-6">
                                    <IconGripVertical size={24} />
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-20 rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                                            <img src={item.image} className="w-full h-full object-cover" alt="item" />
                                        </div>
                                        <div>
                                            {item.badge && <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1 block">{item.badge}</span>}
                                            <h4 className="text-sm font-black text-slate-800 tracking-tight uppercase">{item.title}</h4>
                                            <p className="text-xs font-bold text-emerald-600 mt-1">{item.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right px-8">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-xs font-bold text-slate-900">{item.stock_status}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleToggleActive(item)}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${item.is_active ? 'bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                title={item.is_active ? 'Hide from store' : 'Show in store'}
                                            >
                                                {item.is_active ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                                            </button>
                                            <button 
                                                onClick={() => { setEditingItem(item); setImagePreview(item.image); }}
                                                className="w-10 h-10 bg-brand-secondary text-brand-primary rounded-xl flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                            >
                                                <IconEdit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => { setDeletingId(item.id); setIsDeleteModalOpen(true); }}
                                                className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <IconTrash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            </div>

            {/* Modal Editor */}
            {editingItem && createPortal(
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in" 
                        onClick={() => setEditingItem(null)}
                    ></div>
                    
                    <div className="bg-white rounded-[3rem] shadow-[0_20px_100px_rgba(0,0,0,0.3)] w-full max-w-4xl p-12 relative max-h-[90vh] overflow-y-auto no-scrollbar z-10 animate-bloom-in origin-center">
                        <button 
                            onClick={() => setEditingItem(null)} 
                            className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 hover:rotate-90 transition-all duration-300"
                        >
                            <IconX size={32} />
                        </button>
                        
                        <h2 className="text-2xl font-black text-slate-900 font-serif mb-10 italic text-center">
                            {editingItem.id ? 'Refine Arrangement' : 'Curate New Arrangement'}
                        </h2>
                        
                        <form onSubmit={handleItemSave} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Display Title</label>
                                    <input type="text" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-bold uppercase tracking-wider" placeholder="e.g. Midnight Rose Symphony" required />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Investment (Price)</label>
                                        <input type="text" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm font-black text-brand-primary" placeholder="e.g. $89.00" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status Badge</label>
                                        <input type="text" value={editingItem.badge} onChange={e => setEditingItem({...editingItem, badge: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm" placeholder="e.g. BEST SELLER" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Availability Notice</label>
                                    <input type="text" value={editingItem.stock_status} onChange={e => setEditingItem({...editingItem, stock_status: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-primary transition-all text-sm" placeholder="e.g. In stock / Only 2 left" />
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Visual Masterpiece</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-4 flex flex-col items-center justify-center relative overflow-hidden h-[300px] bg-slate-50">
                                    {imagePreview ? (
                                        <img src={imagePreview} className="w-full h-full object-cover absolute inset-0 rounded-[2rem] p-3" alt="p" />
                                    ) : (
                                        <div className="flex flex-col items-center text-slate-300 italic"><IconPhotoStar size={48} className="mb-4 opacity-50" />Choose imagery</div>
                                    )}
                                    <div className="absolute inset-0 bg-brand-primary/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                        <div className="px-6 py-3 bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Replace Image</div>
                                    </div>
                                </div>
                                <input type="text" value={editingItem.image} onChange={e => {setEditingItem({...editingItem, image: e.target.value}); setImagePreview(e.target.value);}} className="w-full p-3 bg-slate-100 rounded-xl text-[9px] text-slate-400 font-bold border-none" placeholder="Or provide secure source URL..." />
                                
                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setEditingItem(null)} className="flex-1 h-16 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-[0.2em] rounded-3xl active:scale-95 transition-transform">Cancel</button>
                                    <button type="submit" disabled={isUploading} className="flex-[2] h-16 bg-brand-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-violet-200 active:scale-[0.98] transition-all">Preserve Masterpiece</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>, 
                document.body
            )}

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Remove Selection">
                <div className="text-center p-6 space-y-6">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto"><IconTrash size={40} /></div>
                    <p className="text-slate-500 text-sm font-medium">This will permanently remove this arrangement from the homepage. Proceed with caution.</p>
                    <div className="flex gap-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black text-xs uppercase rounded-2xl">Return back</button>
                        <button onClick={handleDelete} className="flex-1 py-4 bg-rose-500 text-white font-black text-xs uppercase rounded-2xl shadow-xl shadow-rose-100">Permanently Remove</button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default HomeSectionManagement;



