import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff, IconSearch } from "@tabler/icons-react";
import { useNotification } from "../../context/NotificationContext";
import Modal from "../../components/ui/Modal";
import { cn } from "../../lib/utils";

const FuneralFacilityManagement = () => {
    const API_URL = `${API_BASE}/api/funeral/facilities`;
    const [facilities, setFacilities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState("");
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
    const [currentFacility, setCurrentFacility] = useState({
        city: '',
        name: '',
        address: '',
        phone: '',
        status: 'Active',
        position: 0
    });
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            const res = await fetch(API_URL, { credentials: 'include' });
            const data = await res.json();
            if (Array.isArray(data)) {
                setFacilities(data);
            } else {
                setFacilities([]);
            }
            setIsLoading(false);
        } catch (err) {
            console.error(err);
            setIsLoading(false);
            showNotification("Failed to load facilities.", "error");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === "add") {
                await fetch(API_URL, {
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentFacility)
                });
                showNotification("Facility added successfully!", "success");
            } else {
                await fetch(`${API_URL}/${currentFacility.id}`, {
                    credentials: 'include',
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentFacility)
                });
                showNotification("Facility updated successfully!", "success");
            }
            fetchFacilities();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            showNotification("Failed to save facility.", "error");
        }
    };

    const handleDelete = async () => {
        try {
            await fetch(`${API_URL}/${deletingId}`, {
                credentials: 'include',
                method: 'DELETE'
            });
            fetchFacilities();
            setIsDeleteModalOpen(false);
            showNotification("Facility deleted successfully.", "success");
        } catch (error) {
            console.error(error);
            showNotification("Failed to delete facility.", "error");
        }
    };

    const handleToggleStatus = async (facility) => {
        try {
            const newStatus = facility.status === 'Active' ? 'Inactive' : 'Active';
            await fetch(`${API_URL}/${facility.id}`, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchFacilities();
        } catch (e) {
            console.error(e);
            showNotification("Failed to toggle status.", "error");
        }
    };

    const openAddModal = () => {
        setCurrentFacility({
            city: '',
            name: '',
            address: '',
            phone: '',
            status: 'Active',
            position: 0
        });
        setModalMode("add");
        setIsModalOpen(true);
    };

    const openEditModal = (facility) => {
        setCurrentFacility(facility);
        setModalMode("edit");
        setIsModalOpen(true);
    };

    const confirmDelete = (id) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const filteredFacilities = facilities.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        f.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
    const paginatedFacilities = filteredFacilities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-screen">Loading...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 no-scrollbar pb-32">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 font-serif mb-2 tracking-tight">Delivery Areas</h1>
                        <p className="text-slate-500 font-medium">Manage the list of partnered funeral homes and delivery facilities.</p>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={openAddModal} className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-xs shadow-lg shadow-violet-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <IconPlus size={18} />
                            Add Facility
                        </button>
                    </div>
                </div>

                <div className="mb-6 relative">
                    <input 
                        type="text" 
                        placeholder="Search facilities or cities..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all shadow-sm"
                    />
                    <IconSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility Name & Address</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">City Group</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedFacilities.map((facility) => (
                                    <tr key={facility.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-800">{facility.name}</p>
                                            <p className="text-xs text-slate-500 mt-1">{facility.address}</p>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-slate-600">
                                            <span className="bg-slate-100 px-3 py-1 rounded-full text-xs">{facility.city}</span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-slate-600">
                                            {facility.phone}
                                        </td>
                                        <td className="px-8 py-6">
                                            <button 
                                                onClick={() => handleToggleStatus(facility)}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border",
                                                    facility.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100"
                                                )}
                                            >
                                                {facility.status === "Active" ? <IconEye size={14} /> : <IconEyeOff size={14} />}
                                                {facility.status}
                                            </button>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(facility)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-brand-primary hover:border-brand-primary transition-all">
                                                    <IconEdit size={16} />
                                                </button>
                                                <button onClick={() => confirmDelete(facility.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all">
                                                    <IconTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedFacilities.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-12 text-center text-slate-400 italic">No facilities found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination UI */}
                    {totalPages > 1 && (
                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-500 font-medium">
                                Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredFacilities.length)}</span> of <span className="font-bold text-slate-900">{filteredFacilities.length}</span> results
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                                >
                                    Previous
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "w-8 h-8 rounded-xl text-[10px] font-black transition-all",
                                            currentPage === i + 1 
                                                ? "bg-brand-primary text-white shadow-lg shadow-violet-100" 
                                                : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === "add" ? "Add New Facility" : "Edit Facility"}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Facility Name</label>
                                <input 
                                    type="text" 
                                    value={currentFacility.name} 
                                    onChange={(e) => setCurrentFacility({ ...currentFacility, name: e.target.value })} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium" 
                                    required 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City Group (e.g., "New York, NY, USA")</label>
                                <input 
                                    type="text" 
                                    value={currentFacility.city} 
                                    onChange={(e) => setCurrentFacility({ ...currentFacility, city: e.target.value })} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium" 
                                    required 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Address</label>
                                <input 
                                    type="text" 
                                    value={currentFacility.address} 
                                    onChange={(e) => setCurrentFacility({ ...currentFacility, address: e.target.value })} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</label>
                                <input 
                                    type="text" 
                                    value={currentFacility.phone} 
                                    onChange={(e) => setCurrentFacility({ ...currentFacility, phone: e.target.value })} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Display Priority (0 is highest)</label>
                                <input 
                                    type="number" 
                                    value={currentFacility.position} 
                                    onChange={(e) => setCurrentFacility({ ...currentFacility, position: parseInt(e.target.value) || 0 })} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-sm font-medium" 
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-violet-100 hover:bg-slate-900 transition-all">Save Facility</button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                    <div className="space-y-6 py-4 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                            <IconTrash size={32} />
                        </div>
                        <p className="text-slate-600 font-medium">Are you sure you want to permanently delete this facility?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-100 hover:bg-red-600 transition-all">Delete Facility</button>
                        </div>
                    </div>
                </Modal>

            </div>
        </AdminLayout>
    );
};

export default FuneralFacilityManagement;
