
import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import {

    IconSearch,
    IconFilter,
    IconUsers,
    IconDownload,
    IconChevronLeft,
    IconChevronRight,
    IconMail,
    IconPhone,
    IconCalendar,
    IconUserCircle
} from "@tabler/icons-react";

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchCustomers = async () => {
        try {
           const res = await fetch(`${API_BASE}/api/customers`);
            const data = await res.json();
            setCustomers(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching customers:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c =>
        (c.first_name + " " + c.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const currentItems = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const exportToCSV = () => {
        const headers = ["ID", "First Name", "Last Name", "Email", "Joined Date"];
        const data = filteredCustomers.map(c => [
            c.id,
            c.first_name,
            c.last_name,
            c.email,
            new Date(c.createdAt).toLocaleDateString()
        ]);

        const csvContent = [headers, ...data].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "customers_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
                        <IconUsers size={32} className="text-brand-primary" />
                        Customer Registry
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your floral community and member base.</p>
                </div>
                {/* <div className="flex items-center gap-3">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <IconDownload size={18} />
                        Export Data
                    </button>
                </div> */}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Table Toolbar */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                            <IconSearch size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white focus:border-brand-primary/30 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
                            <IconFilter size={20} />
                        </button>
                        <div className="h-6 w-px bg-slate-200 mx-1" />
                        <p className="text-sm font-semibold text-slate-500">
                            Total: <span className="text-slate-900">{filteredCustomers.length}</span> Members
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Customer Info</th>
                                <th className="px-6 py-4">Contact Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400 font-medium">
                                        No customers found matching your criteria.
                                    </td>
                                </tr>
                            ) : currentItems.map((customer) => (
                                <tr key={customer.id} className="group hover:bg-brand-secondary/30 transition-colors cursor-default">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm ring-4 ring-white group-hover:scale-110 transition-transform">
                                                <IconUserCircle size={22} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm whitespace-nowrap">{customer.first_name} {customer.last_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {customer.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                            <IconMail size={16} className="text-slate-400" />
                                            {customer.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-600">
                                            Active Member
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-400 text-[11px] font-bold">
                                            <IconCalendar size={14} />
                                            {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between mt-auto">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all disabled:opacity-40 border border-transparent hover:border-slate-200"
                        >
                            <IconChevronLeft size={18} />
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1
                                        ? "bg-brand-primary text-white shadow-lg shadow-violet-200"
                                        : "text-slate-500 hover:bg-white border border-transparent hover:border-slate-200"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all disabled:opacity-40 border border-transparent hover:border-slate-200"
                        >
                            Next
                            <IconChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default CustomerManagement;
