
import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import { createPortal } from "react-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import {

    IconPlus,
    IconSearch,
    IconFilter,
    IconDownload,
    IconEdit,
    IconTrash,
    IconFlower,
    IconDotsVertical,
    IconChevronLeft,
    IconChevronRight,
    IconUpload,
    IconX,
    IconCheck,
    IconChevronDown,
    IconEye,
    IconEyeOff
} from "@tabler/icons-react";
import { getImageUrl } from "../../utils/imageHelper";



// ... Modal component ...
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    const modalUI = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-10 pointer-events-none">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md pointer-events-auto" onClick={onClose}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-bloom-in pointer-events-auto max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight font-serif">{title}</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all hover:scale-110 active:scale-95">
                        <IconX size={20} />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto no-scrollbar flex-1">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalUI, document.body);
};


const ImageUpload = ({ onUpload, currentUrl, label }) => {
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file) => {
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large (max 5MB).');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE}/api/upload`, { credentials: 'include',
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.imageUrl) {
                onUpload(data.imageUrl);
                console.log(`Image compressed to ${data.size} KB`);
            } else {
                alert(data.error || 'Upload failed.');
            }
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                <span className="text-[10px] text-slate-400 font-bold">REC: 600x600px</span>
            </div>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    accept="image/*"
                />
                {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                ) : currentUrl ? (
                    <img src={getImageUrl(currentUrl)} alt="Preview" className="h-24 w-24 object-cover rounded-xl shadow-sm" />
                ) : (
                    <div className="text-center py-2">
                        <IconUpload className="mx-auto text-slate-400 group-hover:text-brand-primary" size={24} />
                        <p className="text-xs text-slate-400 mt-1">Click to upload image</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ title: '', text: '', type: 'success' });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [categoriesMap, setCategoriesMap] = useState({});

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/menus`, { credentials: 'include' });
            const data = await res.json();
            const map = {};
            data.forEach(menu => {
                if (menu.status === 'active') {
                    map[menu.name] = (menu.subItems || [])
                        .filter(sub => sub.status === 'active')
                        .map(sub => sub.name);
                }
            });
            setCategoriesMap(map);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        sub_category: '',
        stock: 0,
        badge: ''
    });

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/products`, { credentials: 'include' });
            const data = await res.json();
            setProducts(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching products:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const downloadSampleTemplate = () => {
        const headers = ["name", "price", "category", "stock", "image", "description", "sub_category", "badge"];
        const sampleData = [
            ["Velvet Red Roses", "$45.00", "Roses", "24", "https://images.unsplash.com/photo-1548013146-72479...?", "Premium red roses", "Bouquets", "New"],
            ["Spring Sunshine Mix", "$38.00", "Easter", "12", "https://images.unsplash.com/photo-1518701005...?", "Bright spring mix", "Seasonal", "Sale"]
        ];

        const csvContent = [headers, ...sampleData].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "product_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/products/bulk-upload`, { credentials: 'include',
                method: 'POST',
                body: formData,
            });
            const result = await res.json();

            setStatusMessage({
                title: 'Upload Successful',
                text: result.message,
                type: 'success'
            });
            setShowStatusModal(true);
            await fetchProducts();
        } catch (err) {
            console.error("Bulk upload failed:", err);
            setStatusMessage({
                title: 'Upload Failed',
                text: 'There was an error processing your bulk upload. Please check the file format.',
                type: 'error'
            });
            setShowStatusModal(true);
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    const handleToggleStatus = async (product) => {
        try {
            const newStatus = product.status === 'Active' ? 'Inactive' : 'Active';
            const res = await fetch(`${API_BASE}/api/products/${product.id}`, { credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
                setStatusMessage({
                    title: 'Status Updated',
                    text: `Product is now ${newStatus}.`,
                    type: 'success'
                });
                setShowStatusModal(true);
            }
        } catch (err) {
            console.error("Toggle failed:", err);
        }
    };

    const handleAddClick = () => {
        setModalMode('add');
        setEditingProduct(null);
        setForm({
            name: '',
            description: '',
            price: '',
            image: '',
            category: Object.keys(categoriesMap)[0] || '',
            sub_category: '',
            stock: 0,
            badge: ''
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (product) => {
        setModalMode('edit');
        setEditingProduct(product);
        setForm({
            name: product.name,
            description: product.description || '',
            price: product.price,
            image: product.image,
            category: product.category,
            sub_category: product.sub_category || '',
            stock: product.stock,
            badge: product.badge || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            const res = await fetch(`${API_BASE}/api/products/${productToDelete.id}`, { method: 'DELETE' , credentials: 'include' });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== productToDelete.id));
                setShowDeleteConfirm(false);
                setProductToDelete(null);
                setStatusMessage({
                    title: 'Deleted!',
                    text: 'The product has been successfully removed.',
                    type: 'success'
                });
                setShowStatusModal(true);
            }
        } catch (err) {
            console.error("Delete failed:", err);
            setStatusMessage({
                title: 'Delete Failed',
                text: 'There was an error removing the product.',
                type: 'error'
            });
            setShowStatusModal(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = modalMode === 'add'
            ? `${API_BASE}/api/products`
            : `${API_BASE}/api/products/${editingProduct.id}`;

        const method = modalMode === 'add' ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, { 
                credentials: 'include',
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                await fetchProducts();
                setIsModalOpen(false);
                setStatusMessage({
                    title: modalMode === 'add' ? 'Product Added!' : 'Update Complete!',
                    text: `Your product specs have been successfully ${modalMode === 'add' ? 'saved' : 'updated'}.`,
                    type: 'success'
                });
                setShowStatusModal(true);
            } else {
                throw new Error("Action failed");
            }
        } catch (err) {
            console.error("Submit failed:", err);
            setStatusMessage({
                title: 'Process Error',
                text: 'Something went wrong while saving. Please try again.',
                type: 'error'
            });
            setShowStatusModal(true);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <AdminLayout>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif">Product Inventory</h1>
                        <p className="text-slate-500 mt-1">Manage your flower collection and stock levels.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            id="bulk-upload-input"
                            className="hidden"
                            accept=".csv, .xlsx, .xls"
                            onChange={handleBulkUpload}
                        />
                        <button
                            onClick={downloadSampleTemplate}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <IconDownload size={18} />
                            Sample Template
                        </button>
                        <button
                            onClick={() => document.getElementById('bulk-upload-input').click()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-100 transition-all shadow-sm"
                        >
                            <IconUpload size={18} />
                            Bulk Upload
                        </button>
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-violet-800 transition-all shadow-lg shadow-violet-200"
                        >
                            <IconPlus size={18} />
                            Add New Product
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    {/* Table Toolbar ... (rest of render logic)
                    {/* Table Toolbar */}
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                                <IconSearch size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search flowers by name, category..."
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
                                Showing <span className="text-slate-900">{filteredProducts.length}</span> products
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    <th className="px-6 py-4">Product Info</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Sub-Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : currentItems.map((product) => (
                                    <tr key={product.id} className="group hover:bg-brand-secondary/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                    <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: PRD-{1000 + product.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600 font-medium">{product.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-400 font-bold">{product.sub_category || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{product.price}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{product.stock} pcs</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.status === 'Active' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                                                    {product.status || 'Active'}
                                                </span>
                                                <span className={`text-[10px] font-bold px-3 ${product.stock > 10 ? "text-green-500" :
                                                    product.stock > 0 ? "text-amber-500" :
                                                        "text-red-500"
                                                    }`}>
                                                    {product.stock > 10 ? "Full Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 text-slate-400">
                                                <button
                                                    onClick={() => handleToggleStatus(product)}
                                                    className={`p-2 rounded-lg transition-all ${product.status === 'Active' ? 'hover:text-emerald-600 hover:bg-emerald-50' : 'hover:text-brand-primary hover:bg-brand-primary/10'}`}
                                                    title={product.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {product.status === 'Active' ? <IconEye size={18} /> : <IconEyeOff size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(product)}
                                                    className="p-2 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all" title="Edit"
                                                >
                                                    <IconEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(product)}
                                                    className="p-2 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
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
                                            : "text-slate-500 hover:bg-white hover:text-brand-primary border border-transparent hover:border-slate-200"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-transparent hover:border-slate-200"
                            >
                                Next
                                <IconChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </AdminLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'Catalog New Product' : 'Edit Product Details'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <ImageUpload
                        label="Product Image"
                        currentUrl={form.image}
                        onUpload={(url) => setForm({ ...form, image: url })}
                    />

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                            placeholder="e.g. Lavender Dream"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (e.g. $45.00)</label>
                            <input
                                type="text"
                                required
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Level</label>
                            <input
                                type="number"
                                required
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                            <div className="relative">
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value, sub_category: '' })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold appearance-none pr-10"
                                >
                                    {Object.keys(categoriesMap).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <IconChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {categoriesMap[form.category] && categoriesMap[form.category].length > 0 && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sub-Category</label>
                            <div className="relative">
                                <select
                                    value={form.sub_category}
                                    onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold appearance-none pr-10"
                                >
                                    <option value="">Select a sub-category...</option>
                                    {categoriesMap[form.category].map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                                <IconChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    )}


                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Badge (Optional)</label>
                        <input
                            type="text"
                            value={form.badge}
                            onChange={(e) => setForm({ ...form, badge: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold"
                            placeholder="New, Sale, etc."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-primary outline-none transition-all text-sm font-semibold resize-none"
                            placeholder="Product details..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-violet-800 transition-all shadow-xl shadow-violet-200 mt-4"
                    >
                        {modalMode === 'add' ? 'Catalog Specimen' : 'Update Specifications'}
                    </button>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 bg-rose-100 text-rose-600">
                            <IconTrash size={40} stroke={2.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Are you sure?</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed text-sm font-medium">
                            You are about to delete <span className="text-rose-600 font-bold">"{productToDelete?.name}"</span>. This action cannot be undone.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${statusMessage.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {statusMessage.type === 'success' ? <IconCheck size={40} stroke={2.5} /> : <IconX size={40} stroke={2.5} />}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{statusMessage.title}</h3>
                        <p className="text-slate-600 mb-8 leading-relaxed text-sm font-medium">{statusMessage.text}</p>
                        <button
                            onClick={() => setShowStatusModal(false)}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductManagement;



