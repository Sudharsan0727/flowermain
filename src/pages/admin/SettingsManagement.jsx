import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import { getImageUrl } from "../../utils/imageHelper";
import { useSearchParams } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import AdminLayout from "../../components/admin/AdminLayout";
import {

    IconSettings,
    IconUsers,
    IconHistory,
    IconGlobe,
    IconCurrencyDollar,
    IconPlus,
    IconShieldLock,
    IconTrash,
    IconCircleCheck,
    IconAlertCircle,
    IconDeviceFloppy,
    IconMail,
    IconPhoto,
    IconInfoCircle,
    IconPalette,
    IconMapPin,
    IconPhone,
    IconClock,
    IconBrandWhatsapp,
    IconWorld,
    IconBriefcase,
    IconUserCircle,
    IconMailFilled,
    IconPhoneFilled,
    IconMapPinFilled,
    IconBuilding,
    IconAddressBook,
    IconEye,
    IconEyeOff,
    IconX,
    IconLayoutDashboard,
    IconSection,
    IconFlower,
    IconSearch,
    IconFilter,
    IconPencil,
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
} from "@tabler/icons-react";

const SettingsManagement = () => {
    const { showNotification } = useNotification();
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') || 'general';
    const [activeTab, setActiveTab] = useState(tabParam);
    const [settings, setSettings] = useState([]);
    const [staff, setStaff] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [activeRole, setActiveRole] = useState('Admin'); // 'Admin', 'Staff', 'Manager'
    const [savingPerms, setSavingPerms] = useState(false);

    const [logSearch, setLogSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Staff Pagination State
    const [staffPage, setStaffPage] = useState(1);
    const staffRowsPerPage = 5;

    // Form states for new staff
    const [newStaff, setNewStaff] = useState({ username: '', email: '', password: '', role: '', phone: '', status: 'active' });
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editingStaffId, setEditingStaffId] = useState(null);

    // Form states for new custom setting
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [newCustom, setNewCustom] = useState({ key: '', value: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            // Only fetch core settings initially
            const res = await fetch(`${API_BASE}/api/settings`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch basic settings');
            const data = await res.json();
            setSettings(data || []);

            if (activeTab === 'staff') fetchStaff();
            if (activeTab === 'logs') fetchLogs();
            if (activeTab === 'privileges') fetchPermissions();

        } catch (err) {
            console.error("Clinical data fetch failed:", err);
            showNotification(`Handshake Failure: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/settings/staff`, { credentials: 'include' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.debug || data.message || 'Staff fetch failed');
            }
            const data = await res.json();
            setStaff(data || []);
        } catch (err) {
            showNotification(`Staff Sync Failure: ${err.message}`, 'error');
        }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/settings/logs`, { credentials: 'include' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.debug || data.message || 'Logs fetch failed');
            }
            const data = await res.json();
            setLogs(data || []);
        } catch (err) {
            showNotification(`Audit Sync Failure: ${err.message}`, 'error');
        }
    };

    const fetchPermissions = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/permissions?t=${Date.now()}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Permissions fetch failed');
            const data = await res.json();
            setPermissions(data || []);
        } catch (err) {
            showNotification(`Permission Sync Failure: ${err.message}`, 'error');
        }
    };

    useEffect(() => {
        if (activeTab === 'staff' && staff.length === 0) fetchStaff();
        if (activeTab === 'logs' && logs.length === 0) fetchLogs();
        if (activeTab === 'privileges' && permissions.length === 0) fetchPermissions();
    }, [activeTab]);

    useEffect(() => {
        const root = document.documentElement;
        if (showStaffModal || showCustomModal || showDeleteModal) {
            root.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        } else {
            root.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
        }
        return () => {
            root.style.overflow = 'auto';
            document.body.style.overflow = 'auto';
        };
    }, [showStaffModal, showCustomModal, showDeleteModal]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (tabParam) setActiveTab(tabParam);
    }, [tabParam]);

    const handleSaveSettings = async (group) => {
        setSaving(true);
        const groupSettings = settings.filter(s => s.group === group);
        console.log(`Syncing settings group: ${group}`, groupSettings);

        try {
            const res = await fetch(`${API_BASE}/api/settings/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: groupSettings }),
                credentials: 'include'
            });
            if (res.ok) {
                showNotification(`Florist Registry: ${group} Synchronized Successfully`, 'success');
                // Broadcast synchronization event
                window.dispatchEvent(new CustomEvent('settingsUpdated'));
                fetchData();
            } else {
                const errData = await res.json();
                showNotification(`Sync Failure: ${errData.message}`, 'error');
                console.error("Clinical registry sync failure:", errData.message);
            }
        } catch (err) {
            showNotification("Artisanal Handshake Failure", "error");
            console.error("Clinical Handshake failure:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e, key) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(key);
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
                updateSettingLocal(key, data.imageUrl);
                // Auto-save for branding images to ensure they reflect immediately
                setTimeout(() => handleSaveSettings('site'), 100);
            }
        } catch (err) {
            console.error("Clinical upload failure:", err);
        } finally {
            setUploading(null);
        }
    };

    const handleToggleStaffStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const res = await fetch(`${API_BASE}/api/settings/staff/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include'
            });
            if (res.ok) {
                showNotification(`Staff status updated to ${newStatus}`, "success");
                fetchStaff();
            } else {
                showNotification("Failed to update staff status", "error");
            }
        } catch (err) {
            console.error("Status toggle failure:", err);
            showNotification("Handshake failure", "error");
        }
    };

    const handleDeleteStaff = (id) => {
        setStaffToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteStaff = async () => {
        if (!staffToDelete) return;
        const deleteUrl = `${API_BASE}/api/settings/staff/${staffToDelete}`;
        console.log("Attempting to decommission staff at:", deleteUrl);

        try {
            const res = await fetch(deleteUrl, {
                method: 'DELETE',
                credentials: 'include'
            });

            let data;
            try {
                data = await res.json();
            } catch (e) {
                data = {};
            }

            if (res.ok) {
                showNotification("Staff member decommissioned successfully.", "success");
                fetchStaff();
                setShowDeleteModal(false);
                setStaffToDelete(null);
            } else {
                const errorMsg = data.message || `Failed to decommission staff (Status: ${res.status})`;
                showNotification(errorMsg, "error");
            }
        } catch (err) {
            console.error("Staff decommissioning failure:", err);
            showNotification("Artisanal Handshake failure (Network Error)", "error");
        }
    };

    const handleEditStaff = (s) => {
        setNewStaff({
            username: s.username,
            email: s.email,
            password: '', // Leave empty for edit unless changing
            role: s.role,
            phone: s.phone || '',
            status: s.status || 'active'
        });
        setEditingStaffId(s.id);
        setShowStaffModal(true);
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            const endpoint = editingStaffId
                ? `${API_BASE}/api/settings/staff/${editingStaffId}`
                : `${API_BASE}/api/settings/staff`;

            const method = editingStaffId ? 'PUT' : 'POST';

            // For updates, we only send password if it's not empty
            const payload = { ...newStaff };
            if (editingStaffId && !payload.password) {
                delete payload.password;
            }

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (res.ok) {
                setShowStaffModal(false);
                setEditingStaffId(null);
                setNewStaff({ username: '', email: '', password: '', role: '', phone: '', status: 'active' });
                setShowPassword(false);
                fetchStaff();
                showNotification(editingStaffId ? "Staff record updated successfully." : "Staff member authorized successfully.", "success");
            } else {
                const errData = await res.json();
                showNotification(errData.message || "Operation failed.", "error");
            }
        } catch (err) {
            console.error("Staff operation failure:", err);
            showNotification("Artisanal Handshake failed.", "error");
        }
    };

    const handleSavePermissions = async () => {
        setSavingPerms(true);
        try {
            const res = await fetch(`${API_BASE}/api/permissions/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions }),
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                showNotification("Role privileges synchronized successfully.", "success");

                // Use the fresh data returned from the server immediately
                if (data.permissions) {
                    setPermissions(data.permissions);
                } else {
                    await fetchPermissions();
                }
            }
        } catch (err) {
            console.error("Clinical privilege sync failure:", err);
            showNotification("Handshake failure during privilege sync.", "error");
        } finally {
            setSavingPerms(false);
        }
    };

    const togglePermission = (id) => {
        setPermissions(prev => prev.map(p => p.id === id ? { ...p, is_granted: !p.is_granted } : p));
    };

    const handleSelectAll = (role, select) => {
        setPermissions(prev => prev.map(p => p.role === role ? { ...p, is_granted: select } : p));
    };

    const handleAddCustomField = (e) => {
        e.preventDefault();
        if (!newCustom.key || !newCustom.value) {
            showNotification("Both Key and Value are required.", "error");
            return;
        }

        updateSettingLocal(newCustom.key, newCustom.value);
        setShowCustomModal(false);
        setNewCustom({ key: '', value: '' });
        showNotification(`New parameter '${newCustom.key}' staged globally. Remember to sync.`, "info");
    };

    const updateSettingLocal = (key, value) => {
        setSettings(prev => {
            const exists = prev.find(s => s.key === key);
            if (exists) {
                return prev.map(s => s.key === key ? { ...s, value } : s);
            }
            // Fail-safe for missing keys (default to site group)
            const siteKeys = [
                'site_logo', 'site_favicon', 'site_name', 'site_slogan', 'site_status',
                'announcement_text', 'contact_email', 'site_meta_description',
                'theme_color', 'secondary_color', 'social_instagram', 'social_facebook',
                'social_pinterest', 'supported_languages', 'default_language',
                'date_format', 'measurement_unit', 'auto_language_detection',
                'google_analytics_id'
            ];
            const g = siteKeys.includes(key) ? 'site' : 'business';
            return [...prev, { key, value, group: g }];
        });
    };

    const getSettingValue = (key, fallback = '') => {
        const s = settings.find(x => x.key === key);
        return (s && s.value !== null) ? s.value : fallback;
    };

    const filteredLogs = logs.filter(log => {
        const searchStr = (logSearch || '').toLowerCase();
        const user = (log.Admin?.username || 'System').toLowerCase();
        const action = (log.action_type || '').toLowerCase();
        const module = (log.module || '').toLowerCase();
        return user.includes(searchStr) || action.includes(searchStr) || module.includes(searchStr);
    });

    const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <AdminLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Studio Control Center</h1>
                        <p className="text-slate-500 mt-1 font-sans">Master configuration and security oversight.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
                    {[
                        { id: "general", icon: IconGlobe, label: "General" },
                        { id: "business", icon: IconCurrencyDollar, label: "Business" },
                        { id: "staff", icon: IconUsers, label: "Staff" },
                        { id: "privileges", icon: IconShieldLock, label: "User Privileges" },
                        { id: "logs", icon: IconHistory, label: "Activity Log" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? "bg-white text-brand-primary shadow-sm"
                                : "text-slate-500 hover:bg-white/50"
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
                    {activeTab === "general" && (
                        <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Branding Identity */}
                                <div className="space-y-8">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Florist Identity & Branding
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Master Logo</label>
                                            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 hover:border-brand-primary/20 transition-all">
                                                <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                                                    {getSettingValue('site_logo') ? (
                                                        <img src={`${getImageUrl(getSettingValue('site_logo'))}?t=${Date.now()}`} className="w-full h-full object-contain p-2" alt="Logo Preview" />
                                                    ) : (
                                                        <IconPhoto className="text-slate-200" size={32} />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleImageUpload(e, 'site_logo')}
                                                        className="hidden" id="logo-upload"
                                                    />
                                                    <label htmlFor="logo-upload" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[11px] uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                                                        {uploading === 'site_logo' ? 'Uploading...' : 'Acquire Logo'}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Studio Favicon</label>
                                            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                                                    {getSettingValue('site_favicon') ? (
                                                        <img src={`${getImageUrl(getSettingValue('site_favicon'))}?t=${Date.now()}`} className="w-full h-full object-contain p-1" alt="Favicon Preview" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-sm bg-slate-100" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleImageUpload(e, 'site_favicon')}
                                                        className="hidden" id="favicon-upload"
                                                    />
                                                    <label htmlFor="favicon-upload" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[11px] uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                                                        Update Icon
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-4">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Footer Logo (Optional)</label>
                                            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                                <div className="w-16 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm">
                                                    {getSettingValue('footer_logo') ? (
                                                        <img src={`${getImageUrl(getSettingValue('footer_logo'))}?t=${Date.now()}`} className="w-full h-full object-contain p-2" alt="Footer Logo Preview" />
                                                    ) : (
                                                        <IconPhoto className="text-slate-200" size={24} />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        onChange={(e) => handleImageUpload(e, 'footer_logo')}
                                                        className="hidden" id="footer-logo-upload"
                                                    />
                                                    <label htmlFor="footer-logo-upload" className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[11px] uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                                                        Set Footer Logo
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Studio Information */}
                                <div className="space-y-8">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Florist Core configuration
                                    </h3>

                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Website Name</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('site_name')}
                                                onChange={(e) => updateSettingLocal('site_name', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Brand Slogan/Tagline</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('site_slogan')}
                                                onChange={(e) => updateSettingLocal('site_slogan', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="e.g. Bespoke Floral Architecture"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Deployment Status</label>
                                                <select
                                                    value={getSettingValue('site_status', 'live')}
                                                    onChange={(e) => updateSettingLocal('site_status', e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                >
                                                    <option value="live">Live/Active</option>
                                                    <option value="maintenance">Maintenance</option>
                                                    <option value="coming_soon">Coming Soon</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Default Language</label>
                                                <select
                                                    value={getSettingValue('default_language', 'English')}
                                                    onChange={(e) => updateSettingLocal('default_language', e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                >
                                                    <option value="English">English (US/UK)</option>
                                                    <option value="Spanish">Español</option>
                                                    <option value="French">Français</option>
                                                    <option value="Arabic">العربية</option>
                                                    <option value="Hindi">हिन्दी</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Contact Archive Email</label>
                                            <input
                                                type="email"
                                                value={getSettingValue('contact_email')}
                                                onChange={(e) => updateSettingLocal('contact_email', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Palette */}
                                <div className="space-y-8 md:col-span-2 pt-8 border-t border-slate-50">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Artisanal Studio Palette
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <input
                                                type="color"
                                                value={getSettingValue('theme_color', '#7c3aed')}
                                                onChange={(e) => updateSettingLocal('theme_color', e.target.value)}
                                                className="w-20 h-20 rounded-2xl cursor-pointer border-none p-0 overflow-hidden shadow-lg"
                                            />
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Primary Shade</p>
                                                <p className="text-xl font-mono font-bold text-slate-800">{getSettingValue('theme_color', '#7c3aed').toUpperCase()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <input
                                                type="color"
                                                value={getSettingValue('secondary_color', '#fafaf9')}
                                                onChange={(e) => updateSettingLocal('secondary_color', e.target.value)}
                                                className="w-20 h-20 rounded-2xl cursor-pointer border-none p-0 overflow-hidden shadow-lg"
                                            />
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Studio Secondary</p>
                                                <p className="text-xl font-mono font-bold text-slate-800">{getSettingValue('secondary_color', '#fafaf9').toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Connectivity */}
                                <div className="space-y-8 md:col-span-2 pt-8 border-t border-slate-50">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Social Connectivity
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Instagram URL</label>
                                            <input
                                                type="text"
                                                placeholder="https://instagram.com/yourshop"
                                                value={getSettingValue('social_instagram')}
                                                onChange={(e) => updateSettingLocal('social_instagram', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Facebook Page</label>
                                            <input
                                                type="text"
                                                placeholder="https://facebook.com/yourshop"
                                                value={getSettingValue('social_facebook')}
                                                onChange={(e) => updateSettingLocal('social_facebook', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Pinterest Collection</label>
                                            <input
                                                type="text"
                                                placeholder="https://pinterest.com/yourshop"
                                                value={getSettingValue('social_pinterest')}
                                                onChange={(e) => updateSettingLocal('social_pinterest', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Global Strategy & Reach */}
                                <div className="space-y-8 md:col-span-2 pt-8 border-t border-slate-50">
                                    <h3 className="text-lg font-serif italic text-slate-800 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                        Global Strategy & Advanced analytics
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Announcement Header Text</label>
                                            <input
                                                type="text"
                                                placeholder="Free shipping on orders over $99"
                                                value={getSettingValue('announcement_text')}
                                                onChange={(e) => updateSettingLocal('announcement_text', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Google Analytics ID</label>
                                            <input
                                                type="text"
                                                placeholder="G-XXXXXXXXXX"
                                                value={getSettingValue('google_analytics_id')}
                                                onChange={(e) => updateSettingLocal('google_analytics_id', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Archival Meta Description</label>
                                            <textarea
                                                value={getSettingValue('site_meta_description')}
                                                onChange={(e) => updateSettingLocal('site_meta_description', e.target.value)}
                                                rows="1"
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800 no-scrollbar"
                                                placeholder="Brief overview for our studio's SEO synchronization..."
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Supported Languages (List)</label>
                                            <input
                                                type="text"
                                                placeholder="English, Spanish, French"
                                                value={getSettingValue('supported_languages', 'English')}
                                                onChange={(e) => updateSettingLocal('supported_languages', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Date Protocol</label>
                                            <select
                                                value={getSettingValue('date_format', 'DD/MM/YYYY')}
                                                onChange={(e) => updateSettingLocal('date_format', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            >
                                                <option value="DD/MM/YYYY">DD/MM/YYYY (UK/India)</option>
                                                <option value="MM/DD/YYYY">MM/DD/YYYY (USA)</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Measurement Logic</label>
                                            <select
                                                value={getSettingValue('measurement_unit', 'metric')}
                                                onChange={(e) => updateSettingLocal('measurement_unit', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            >
                                                <option value="metric">Metric (kg, cm, Celsius)</option>
                                                <option value="imperial">Imperial (lb, in, Fahrenheit)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Regional Auto-Detect</label>
                                            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-transparent flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-600">Smart Gateway</span>
                                                <input
                                                    type="checkbox"
                                                    checked={getSettingValue('auto_language_detection', 'true') === 'true'}
                                                    onChange={(e) => updateSettingLocal('auto_language_detection', e.target.checked ? 'true' : 'false')}
                                                    className="w-5 h-5 accent-brand-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex justify-end">
                                <button
                                    onClick={() => handleSaveSettings('site')}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-primary hover:shadow-2xl hover:shadow-violet-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <IconDeviceFloppy size={20} />
                                    {saving ? 'Synchronizing Archive...' : 'Push Mastery Sync'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "business" && (
                        <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Business Details */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconBriefcase size={16} className="text-brand-primary" />
                                        Business Details
                                    </h3>

                                    <div className="grid grid-cols-1 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Shop Name</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('shop_name', getSettingValue('site_name'))}
                                                onChange={(e) => updateSettingLocal('shop_name', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="e.g. Florist Studio"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Legal Representative</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('legal_representative')}
                                                onChange={(e) => updateSettingLocal('legal_representative', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="Full Legal Name"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Customer Support Email</label>
                                                <input
                                                    type="email"
                                                    value={getSettingValue('customer_support_email', getSettingValue('contact_email'))}
                                                    onChange={(e) => updateSettingLocal('customer_support_email', e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                    placeholder="support@flowershop.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Technical Support Email</label>
                                                <input
                                                    type="email"
                                                    value={getSettingValue('technical_support_email')}
                                                    onChange={(e) => updateSettingLocal('technical_support_email', e.target.value)}
                                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                    placeholder="tech@flowershop.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Phone Registry */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconPhoneFilled size={16} className="text-brand-primary" />
                                        Business Phone Registry
                                    </h3>

                                    <div className="grid grid-cols-1 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Business Phone-1 (Main)</label>
                                            <div className="relative">
                                                <IconPhone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" />
                                                <input
                                                    type="text"
                                                    value={getSettingValue('business_phone_main', getSettingValue('shop_phone'))}
                                                    onChange={(e) => updateSettingLocal('business_phone_main', e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                    placeholder="+1 (000) 000-0000"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Business Phone-2 (Sec)</label>
                                            <div className="relative">
                                                <IconPhone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" />
                                                <input
                                                    type="text"
                                                    value={getSettingValue('business_phone_secondary')}
                                                    onChange={(e) => updateSettingLocal('business_phone_secondary', e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                    placeholder="+1 (000) 000-0000"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">WhatsApp Registry</label>
                                            <div className="relative">
                                                <IconBrandWhatsapp size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                                <input
                                                    type="text"
                                                    value={getSettingValue('business_whatsapp')}
                                                    onChange={(e) => updateSettingLocal('business_whatsapp', e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                    placeholder="+1 (000) 000-0000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order & Fiscal Oversight */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconCircleCheck size={16} className="text-brand-primary" />
                                        Order & Fiscal Oversight
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Min Order Value</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('min_order_value', '0')}
                                                onChange={(e) => updateSettingLocal('min_order_value', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Max Order Value (US/Global)</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('max_order_value', '10000')}
                                                onChange={(e) => updateSettingLocal('max_order_value', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="10000"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Daily Order Intake Limit</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('daily_order_limit', '0')}
                                                onChange={(e) => updateSettingLocal('daily_order_limit', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="0 for no limit"
                                            />
                                            <p className="text-[9px] text-slate-400 italic font-medium px-1">Blocks new orders once this daily total is reached.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Global Studio Address */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconMapPinFilled size={16} className="text-brand-primary" />
                                        Global Studio Address
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Headquarters Address</label>
                                        <textarea
                                            value={getSettingValue('headquarters_address', getSettingValue('shop_address'))}
                                            onChange={(e) => updateSettingLocal('headquarters_address', e.target.value)}
                                            rows="3"
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800 no-scrollbar"
                                            placeholder="123 Floral Ave, New York, NY 10001"
                                        />
                                    </div>
                                </div>

                                {/* Fiscal Architecture */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconCurrencyDollar size={16} className="text-brand-primary" />
                                        Fiscal Architecture
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Global Tax Rate (%)</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('tax_rate', '18')}
                                                onChange={(e) => updateSettingLocal('tax_rate', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Delivery Threshold (Free Above)</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('delivery_threshold', '99')}
                                                onChange={(e) => updateSettingLocal('delivery_threshold', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Base Delivery Fee</label>
                                            <input
                                                type="number"
                                                value={getSettingValue('delivery_fee', '15')}
                                                onChange={(e) => updateSettingLocal('delivery_fee', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Localization */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconGlobe size={16} className="text-brand-primary" />
                                        Localization & Compliance
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Shop Default Country</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('country', 'United States')}
                                                onChange={(e) => updateSettingLocal('country', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Studio Timezone</label>
                                            <select
                                                value={getSettingValue('timezone', 'UTC')}
                                                onChange={(e) => updateSettingLocal('timezone', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            >
                                                <option value="UTC">UTC (Standard)</option>
                                                <option value="America/New_York">Eastern (EST)</option>
                                                <option value="America/Chicago">Central (CST)</option>
                                                <option value="Asia/Kolkata">India (IST)</option>
                                                <option value="Europe/London">London (GMT)</option>
                                                <option value="Dubai/Asia">Dubai (GST)</option>
                                                <option value="Canada/Toronto">Toronto (EST)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Default Currency</label>
                                            <select
                                                value={getSettingValue('currency', 'USD')}
                                                onChange={(e) => updateSettingLocal('currency', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                            >
                                                <option value="USD">USD ($) - US</option>
                                                <option value="EUR">EUR (€) - EU</option>
                                                <option value="GBP">GBP (£) - UK</option>
                                                <option value="INR">INR (₹) - India</option>
                                                <option value="AED">AED (د.إ) - Dubai</option>
                                                <option value="CAD">CAD ($) - Canada</option>
                                                <option value="AUD">AUD ($) - Australia</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Business Reg. Number (VAT/GST/EIN)</label>
                                            <input
                                                type="text"
                                                value={getSettingValue('business_reg_number')}
                                                onChange={(e) => updateSettingLocal('business_reg_number', e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                placeholder="e.g. VAT123456789"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Authorized Shipping Countries</label>
                                            <textarea
                                                value={getSettingValue('shipping_countries', 'USA, Canada, United Kingdom, UAE, India')}
                                                onChange={(e) => updateSettingLocal('shipping_countries', e.target.value)}
                                                rows="2"
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800 no-scrollbar"
                                                placeholder="Comma separated: USA, Canada, UK..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Logic */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <IconSettings size={16} className="text-brand-primary" />
                                        Operational Logic
                                    </h3>

                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <IconWorld size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Every Day Same Day</p>
                                                <p className="text-[10px] text-slate-500 font-bold italic">Enable artisanal courier for same-day requests.</p>
                                            </div>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={getSettingValue('same_day_delivery', 'true') === 'true'}
                                                onChange={(e) => updateSettingLocal('same_day_delivery', e.target.checked.toString())}
                                            />
                                            <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-primary"></div>
                                        </div>

                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Disabled Delivery Dates (Shop Leaves)</label>
                                        <div className="relative">
                                            <IconClock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary" />
                                            <input
                                                type="text"
                                                value={getSettingValue('disabled_delivery_dates', '')}
                                                onChange={(e) => updateSettingLocal('disabled_delivery_dates', e.target.value)}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold text-slate-800"
                                                 placeholder="26-04-2026, 27-04-2026"
                                            />
                                        </div>
                                        <p className="text-[9px] text-slate-400 italic font-medium px-1 leading-relaxed">
                                            To disable multiple days, enter them separated by commas. 
                                             <br />Example: <span className="text-brand-primary font-bold">28-04-2026, 29-04-2026</span> (DD-MM-YYYY format).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50 flex justify-end">
                                <button
                                    onClick={() => handleSaveSettings('business')}
                                    disabled={saving}
                                    className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-primary hover:shadow-2xl hover:shadow-violet-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <IconDeviceFloppy size={20} />
                                    {saving ? 'Synchronizing Archive...' : 'Push Master Fiscal Sync'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "staff" && (
                        <div className="p-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Archival Staff Registry</h3>
                                <button
                                    onClick={() => setShowStaffModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:shadow-md transition-all"
                                >
                                    <IconPlus size={18} />
                                    Commission New Staff
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                                            <th className="px-10 py-5">Staff Identity</th>
                                            <th className="px-10 py-5">Archival Role</th>
                                            <th className="px-10 py-5">Contact Details</th>
                                            <th className="px-10 py-5">Status</th>
                                            <th className="px-10 py-5 text-right bg-slate-50/50">Artisanal Controls</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {staff.slice((staffPage - 1) * staffRowsPerPage, staffPage * staffRowsPerPage).map((s) => (
                                            <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase">
                                                            {s.username.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{s.username}</p>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase">{s.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.role === 'superadmin' ? 'bg-violet-50 text-brand-primary border-violet-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        }`}>
                                                        {s.role}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter italic">{s.phone || 'No Phone Record'}</p>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                                        }`}>
                                                        ● {s.status || 'active'}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-right bg-slate-50/30">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button
                                                            onClick={() => handleToggleStaffStatus(s.id, s.status || 'active')}
                                                            title={s.status === 'active' ? 'Deactivate Staff' : 'Activate Staff'}
                                                            className={`p-3 transition-all hover:bg-white hover:shadow-md rounded-xl ${s.status === 'active' ? 'text-brand-primary' : 'text-slate-400'}`}
                                                        >
                                                            {s.status === 'active' ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditStaff(s)}
                                                            title="Edit Staff Details"
                                                            className="p-3 text-amber-500 hover:text-amber-600 transition-all hover:bg-amber-50 hover:shadow-md rounded-xl"
                                                        >
                                                            <IconPencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteStaff(s.id)}
                                                            title="Decommission Staff"
                                                            className="p-3 text-rose-300 hover:text-rose-600 transition-all hover:bg-rose-50 hover:shadow-md rounded-xl"
                                                        >
                                                            <IconTrash size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Staff Pagination */}
                            {staff.length > staffRowsPerPage && (
                                <div className="p-6 border-t border-slate-50 bg-white rounded-b-[2.5rem] flex items-center justify-between">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        Showing {(staffPage - 1) * staffRowsPerPage + 1} to {Math.min(staffPage * staffRowsPerPage, staff.length)} of {staff.length} staff members
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={staffPage === 1}
                                            onClick={() => setStaffPage(prev => Math.max(1, prev - 1))}
                                            className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-slate-600"
                                        >
                                            <IconChevronLeft size={18} />
                                        </button>

                                        {[...Array(Math.ceil(staff.length / staffRowsPerPage))].map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setStaffPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-[11px] font-bold transition-all ${staffPage === i + 1
                                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                                    : "border border-slate-100 text-slate-600 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button
                                            type="button"
                                            disabled={staffPage === Math.ceil(staff.length / staffRowsPerPage)}
                                            onClick={() => setStaffPage(prev => Math.min(Math.ceil(staff.length / staffRowsPerPage), prev + 1))}
                                            className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all text-slate-600"
                                        >
                                            <IconChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "privileges" && (
                        <div className="p-0 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
                            {/* Privilege Header */}
                            <div className="p-8 border-b border-slate-100 bg-brand-secondary/30 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold font-serif text-brand-primary">User Role Permissions</h3>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1 font-sans">Manage system access levels and user capabilities</p>
                                </div>
                                <button
                                    onClick={handleSavePermissions}
                                    disabled={savingPerms}
                                    className="flex items-center gap-3 px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                                >
                                    {savingPerms ? 'Synchronizing...' : 'Save Changes'}
                                    <IconDeviceFloppy size={18} />
                                </button>
                            </div>

                            <div className="flex flex-col lg:flex-row h-full">
                                {/* Role Sidebar */}
                                <div className="w-full lg:w-72 border-r border-slate-100 p-8 space-y-6 bg-brand-secondary/10">
                                    <p className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Select Role</p>
                                    <div className="space-y-3">
                                        {['Admin', 'Staff', 'Manager'].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => setActiveRole(role)}
                                                className={`w-full flex items-center justify-between px-7 py-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-300 ${activeRole === role
                                                    ? "bg-brand-primary text-white shadow-2xl shadow-indigo-200 scale-[1.02]"
                                                    : "text-slate-500 hover:bg-white hover:text-brand-primary"
                                                    }`}
                                            >
                                                {role}
                                                {activeRole === role && <IconCircleCheck size={18} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Permissions Grid */}
                                <div className="flex-1 p-12 bg-white">
                                    <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
                                        <h4 className="text-xl font-serif italic text-slate-800">Permissions for <span className="text-brand-primary font-black not-italic ml-2 uppercase tracking-tight">{activeRole}</span></h4>
                                        <div className="flex gap-6">
                                            <button onClick={() => handleSelectAll(activeRole, true)} className="text-[10px] font-black uppercase text-brand-primary hover:text-indigo-900 tracking-[0.2em] transition-colors">Select All</button>
                                            <button onClick={() => handleSelectAll(activeRole, false)} className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-600 tracking-[0.2em] transition-colors">Deselect All</button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                        {/* Grouped Permissions */}
                                        {Array.from(new Set(permissions.filter(p => p.role === activeRole).map(p => p.section))).map(section => (
                                            <div key={section} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] space-y-6 hover:bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
                                                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-brand-secondary text-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                                        {section === 'General Management' ? <IconLayoutDashboard size={20} /> : section === 'Home Page' ? <IconSection size={20} /> : section === 'Shop Management' ? <IconFlower size={20} /> : <IconShieldLock size={20} />}
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">{section}</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 pt-2">
                                                    {permissions.filter(p => p.role === activeRole && p.section === section).map(perm => (
                                                        <label key={perm.id} className="flex items-start gap-4 cursor-pointer group/item">
                                                            <div className="relative flex items-center justify-center mt-0.5">
                                                                <input
                                                                    type="checkbox"
                                                                    className="sr-only"
                                                                    checked={!!perm.is_granted}
                                                                    onChange={() => togglePermission(perm.id)}
                                                                />
                                                                <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${perm.is_granted ? 'bg-brand-primary border-brand-primary rotate-0 scale-100' : 'border-slate-200 bg-white rotate-12 scale-90'}`}></div>
                                                                {perm.is_granted && <IconCircleCheck className="absolute w-4 h-4 text-white animate-in zoom-in duration-300" />}
                                                            </div>
                                                            <span className={`text-xs font-bold transition-colors duration-300 ${perm.is_granted ? 'text-slate-900 translate-x-1' : 'text-slate-400 group-hover/item:text-slate-600'}`}>{perm.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "logs" && (
                        <div className="p-0 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full min-h-[700px]">
                            {/* Logs Header & Search */}
                            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
                                <div>
                                    <h3 className="text-2xl font-bold font-serif text-slate-800">System Activity Logs</h3>
                                    <p className="text-slate-400 text-xs mt-1 font-sans">Track system events, user activities, and data changes</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search logs..."
                                            value={logSearch}
                                            onChange={(e) => { setLogSearch(e.target.value); setCurrentPage(1); }}
                                            className="pl-11 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:border-brand-primary/20 w-full md:w-64 transition-all outline-none font-sans"
                                        />
                                    </div>
                                    <button onClick={fetchData} className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-md transition-all text-slate-400">
                                        <IconHistory size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Table Area */}
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-50 bg-slate-50/30">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">S.NO</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">USER</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">ROLE</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">ACTION</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">DETAILS</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">TIMING</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 font-sans">
                                        {paginatedLogs.map((log, index) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-8 py-6 text-sm text-slate-400 font-medium">
                                                    {(currentPage - 1) * rowsPerPage + index + 1}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                            <IconUserCircle size={20} />
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">{log.Admin?.username || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                                        {log.Admin?.role || 'Guest'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${log.action_type?.includes('LOGIN') ? 'bg-emerald-50 text-emerald-600' :
                                                        log.action_type?.includes('LOGOUT') ? 'bg-slate-100 text-slate-500' :
                                                            'bg-brand-secondary text-brand-primary'
                                                        }`}>
                                                        {log.action_type}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 max-w-xs xl:max-w-md">
                                                    <p className="text-sm text-slate-500 truncate group-hover:text-clip group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                                                        {log.module}: {log.action_type.replace(/_/g, ' ')} from {log.ip_address}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-right md:text-left">
                                                        <p className="text-[11px] font-bold text-slate-700 font-sans">{new Date(log.created_at || log.createdAt).toLocaleDateString()}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium font-sans">{new Date(log.created_at || log.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-white">
                                    <p className="text-xs font-bold text-slate-400 font-sans tracking-tight">
                                        Showing <span className="text-slate-800">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="text-slate-800">{Math.min(currentPage * rowsPerPage, filteredLogs.length)}</span> of <span className="text-slate-800">{filteredLogs.length}</span> archives
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all font-sans"
                                        >
                                            Prev
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all font-sans ${currentPage === i + 1
                                                    ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20"
                                                    : "text-slate-400 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all font-sans"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Field Modal - Horizontal Layout */}
            {showCustomModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold font-serif text-slate-800">Add New Configuration Property</h3>
                            <button onClick={() => setShowCustomModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 transition-all"><IconX size={24} /></button>
                        </div>
                        <form onSubmit={handleAddCustomField} className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6 items-end">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Property Key (Slug)</label>
                                    <input
                                        type="text" required
                                        placeholder="e.g. meta_title"
                                        value={newCustom.key}
                                        onChange={(e) => setNewCustom({ ...newCustom, key: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Value Mapping</label>
                                    <input
                                        type="text" required
                                        placeholder="e.g. Florist Botanical"
                                        value={newCustom.value}
                                        onChange={(e) => setNewCustom({ ...newCustom, value: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowCustomModal(false)} className="flex-1 py-4 bg-white border border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-50 transition-all">Discard</button>
                                <button type="submit" className="flex-1 py-4 bg-brand-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-violet-100 transition-all hover:scale-[1.02]">Stage Property</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Staff Commission Modal */}
            {showStaffModal && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold font-serif text-slate-800">{editingStaffId ? 'Update User Record' : 'Add New User'}</h3>
                            <button
                                onClick={() => {
                                    setShowStaffModal(false);
                                    setEditingStaffId(null);
                                    setNewStaff({ username: '', email: '', password: '', role: '', phone: '', status: 'active' });
                                }}
                                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"
                            >
                                <IconX size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddStaff} className="flex flex-col max-h-[90vh]">
                            {/* Scrollable Fields area */}
                            <div className="p-8 space-y-8 overflow-y-auto scrollbar-hide flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Name</label>
                                        <input
                                            type="text" required
                                            placeholder="Enter full name"
                                            value={newStaff.username}
                                            onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Role */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={newStaff.role}
                                                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all outline-none text-slate-600 font-bold appearance-none cursor-pointer pr-12"
                                            >
                                                <option value="">Select Role</option>
                                                <option value="Admin">Admin</option>
                                                <option value="Manager">Manager</option>
                                                <option value="Staff">Staff</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <IconChevronDown size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                        <input
                                            type="email" required
                                            placeholder="user@example.com"
                                            value={newStaff.email}
                                            onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Record</label>
                                        <input
                                            type="tel"
                                            placeholder="Enter phone number"
                                            value={newStaff.phone}
                                            onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all outline-none"
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            Password {editingStaffId && <span className="text-[9px] text-slate-400 font-normal normal-case ml-1">(Optional)</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required={!editingStaffId}
                                                placeholder={editingStaffId ? "Leave blank to keep current" : "Enter master password"}
                                                value={newStaff.password}
                                                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 transition-all outline-none pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Operational Status</label>
                                        <div className="flex items-center gap-8 h-[58px]">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        value="active"
                                                        checked={newStaff.status === 'active'}
                                                        onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${newStaff.status === 'active' ? 'border-brand-primary' : 'border-slate-200'}`}></div>
                                                    {newStaff.status === 'active' && <div className="absolute w-3 h-3 bg-brand-primary rounded-full animate-in zoom-in duration-200"></div>}
                                                </div>
                                                <span className={`text-sm font-bold transition-colors ${newStaff.status === 'active' ? 'text-brand-primary' : 'text-slate-500 group-hover:text-slate-700'}`}>Active</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name="status"
                                                        value="inactive"
                                                        checked={newStaff.status === 'inactive'}
                                                        onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${newStaff.status === 'inactive' ? 'border-brand-primary' : 'border-slate-200'}`}></div>
                                                    {newStaff.status === 'inactive' && <div className="absolute w-3 h-3 bg-brand-primary rounded-full animate-in zoom-in duration-200"></div>}
                                                </div>
                                                <span className={`text-sm font-bold transition-colors ${newStaff.status === 'inactive' ? 'text-brand-primary' : 'text-slate-500 group-hover:text-slate-700'}`}>Inactive</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer Buttons */}
                            <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowStaffModal(false);
                                        setEditingStaffId(null);
                                        setNewStaff({ username: '', email: '', password: '', role: '', phone: '', status: 'active' });
                                    }}
                                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-brand-primary transition-all shadow-xl shadow-slate-100 uppercase text-[10px] tracking-widest"
                                >
                                    {editingStaffId ? 'Update Record' : 'Authorize Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-10 text-center">
                        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <IconTrash size={32} />
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 mb-2 font-serif tracking-tight">Decommission Record?</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-10 px-4">
                            Are you certain you want to remove this staff member from the archival registry? This action is permanent and cannot be reversed.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDeleteStaff}
                                className="w-full py-5 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 uppercase text-[11px] tracking-widest"
                            >
                                Confirm Permanent Deletion
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setStaffToDelete(null);
                                }}
                                className="w-full py-5 bg-white border border-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-[11px] tracking-widest"
                            >
                                Cancel Archival
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default SettingsManagement;
