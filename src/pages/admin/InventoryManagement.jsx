import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import {

    IconPackage,
    IconAlertTriangle,
    IconX,
    IconCheck,
    IconPlus,
    IconMinus,
    IconSearch,
    IconFilter,
    IconRefresh
} from "@tabler/icons-react";

const InventoryManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("all"); // all, low, out

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchProducts = async () => {
        setSyncing(true);
        try {
            const res = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
            const data = await res.json();
            setProducts(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching inventory:", err);
            setLoading(false);
        } finally {
            setTimeout(() => setSyncing(false), 500);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleUpdateStock = async (id, currentStock, delta) => {
        const newStock = Math.max(0, parseInt(currentStock) + delta);
        try {
            const res = await fetch(`${API_BASE}/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: newStock }),
                credentials: 'include'
            });
            if (res.ok) {
                setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
            }
        } catch (err) {
            console.error("Stock update failed:", err);
        }
    };

    const stats = {
        total: products.length,
        lowStock: products.filter(p => p.stock > 0 && p.stock < 5).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        totalValue: products.reduce((acc, p) => acc + (parseFloat(p.price.toString().replace('$', '')) * p.stock), 0)
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (filterBy === "low") return matchesSearch && p.stock > 0 && p.stock < 5;
        if (filterBy === "out") return matchesSearch && p.stock === 0;
        return matchesSearch;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterBy]);

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif tracking-tight">Florist Inventory</h1>
                        <p className="text-slate-500 mt-1">Clinical oversight of your botanical holdings.</p>
                    </div>
                    <button
                        onClick={fetchProducts}
                        disabled={syncing}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${syncing ? 'bg-slate-50 text-slate-400 cursor-wait' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <IconRefresh size={18} className={syncing ? "animate-spin" : ""} />
                        {syncing ? 'Synchronizing...' : 'Sync Registry'}
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                            <IconPackage size={80} />
                        </div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Holdings Value</p>
                        <h2 className="text-3xl font-serif font-black text-brand-primary italic">${stats.totalValue.toLocaleString()}</h2>
                    </div>

                    <div
                        onClick={() => setFilterBy("low")}
                        className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${filterBy === "low" ? 'bg-amber-50 border-amber-200 shadow-lg' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}
                    >
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Low Stock Alerts</p>
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-serif font-black text-amber-600">{stats.lowStock}</h2>
                            {stats.lowStock > 0 && <IconAlertTriangle className="text-amber-500 animate-bounce" size={20} />}
                        </div>
                    </div>

                    <div
                        onClick={() => setFilterBy("out")}
                        className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${filterBy === "out" ? 'bg-rose-50 border-rose-200 shadow-lg' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}
                    >
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Archived (Out)</p>
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-serif font-black text-rose-600">{stats.outOfStock}</h2>
                            {stats.outOfStock > 0 && <IconX className="text-rose-500" size={20} />}
                        </div>
                    </div>

                    <div
                        onClick={() => setFilterBy("all")}
                        className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${filterBy === "all" ? 'bg-emerald-50 border-emerald-200 shadow-lg' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}
                    >
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Specimens</p>
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-serif font-black text-emerald-600">{stats.total}</h2>
                            <IconCheck className="text-emerald-500" size={20} />
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="relative flex-1 max-w-sm">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                                <IconSearch size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by botanical name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-primary/20 transition-all text-sm font-bold shadow-inner"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Displaying {filteredProducts.length} Selections</span>
                            <button
                                onClick={() => { setFilterBy("all"); setSearchQuery(""); }}
                                className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                <IconFilter size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-grow">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-50">
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    <th className="px-8 py-5">Specimen Info</th>
                                    <th className="px-8 py-5">Current Stock</th>
                                    <th className="px-8 py-5">Inventory Status</th>
                                    <th className="px-8 py-5 text-right">Quick Adjustment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-32 text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : paginatedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-32 text-center">
                                            <div className="opacity-20 flex flex-col items-center gap-4">
                                                <IconPackage size={60} stroke={1} />
                                                <p className="text-sm font-serif italic">No botanical specimens found in this registry.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : paginatedItems.map((p) => (
                                    <tr key={p.id} className="group hover:bg-violet-50/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-16 rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative group-hover:scale-105 transition-transform duration-500">
                                                    <img src={p.image} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{p.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter italic">Value: {p.price}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-xl font-serif font-black ${p.stock === 0 ? 'text-rose-600' : p.stock < 5 ? 'text-amber-600' : 'text-slate-900'}`}>
                                                {p.stock.toLocaleString()} <span className="text-[10px] uppercase font-bold text-slate-300">Specimens</span>
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.stock === 0 ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                    p.stock < 10 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                {p.stock === 0 ? 'Archived Out' : p.stock < 10 ? 'Low Stock Alert' : 'Stock Optimal'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateStock(p.id, p.stock, -1)}
                                                    className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm active:scale-90"
                                                >
                                                    <IconMinus size={18} />
                                                </button>
                                                <div className="w-px h-6 bg-slate-100 mx-1" />
                                                <button
                                                    onClick={() => handleUpdateStock(p.id, p.stock, 5)}
                                                    className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-brand-primary transition-all shadow-lg active:scale-95"
                                                >
                                                    <IconPlus size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Archival Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-8 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:shadow-md disabled:opacity-30 disabled:hover:shadow-none transition-all"
                            >
                                Previous Archive
                            </button>

                            <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-brand-primary text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:border-brand-primary/20 hover:text-brand-primary'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:shadow-md disabled:opacity-30 disabled:hover:shadow-none transition-all"
                            >
                                Next Archive
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default InventoryManagement;
