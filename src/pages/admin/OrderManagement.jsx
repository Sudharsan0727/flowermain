import React, { useState, useEffect } from "react";
import {
   IconShoppingBag,
   IconFilter,
   IconSearch,
   IconCalendar,
   IconChevronDown,
   IconDotsVertical,
   IconEye,
   IconCheck,
   IconTruck,
   IconPackage,
   IconX,
   IconExternalLink,
   IconFileInvoice
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "../../components/admin/AdminLayout";
import { cn } from "../../lib/utils";
import API_BASE from "../../config";
import { generateInvoice } from "../../utils/invoiceGenerator";

const OrderManagement = () => {
   const [orders, setOrders] = useState([]);
   const [loading, setLoading] = useState(true);
   const [statusFilter, setStatusFilter] = useState("all");
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10;

   const fetchOrders = async () => {
      try {
         setLoading(true);
         const url = `${API_BASE}/api/orders/admin/all?status=${statusFilter}`;
         const response = await fetch(url, { credentials: 'include' });
         if (response.ok) {
            const data = await response.json();
            setOrders(data);
         }
      } catch (error) {
         console.error("Error fetching orders:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchOrders();
      setCurrentPage(1); // Reset to first page on filter change
   }, [statusFilter]);

   useEffect(() => {
      setCurrentPage(1); // Reset to first page on search
   }, [searchQuery]);

   const updateOrderStatus = async (orderId, newStatus) => {
      try {
         const response = await fetch(`${API_BASE}/api/orders/admin/${orderId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ status: newStatus })
         });
         if (response.ok) {
            fetchOrders();
            if (selectedOrder?.id === orderId) {
               setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
         }
      } catch (error) {
         console.error("Error updating status:", error);
      }
   };

   const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
         case "placed": return "bg-blue-50 text-blue-600 border-blue-100";
         case "confirmed": return "bg-indigo-50 text-indigo-600 border-indigo-100";
         case "packed": return "bg-amber-50 text-amber-600 border-amber-100";
         case "shipped": return "bg-violet-50 text-violet-600 border-violet-100";
         case "delivered": return "bg-emerald-50 text-emerald-600 border-emerald-100";
         case "cancelled": return "bg-rose-50 text-rose-600 border-rose-100";
         default: return "bg-slate-50 text-slate-600 border-slate-100";
      }
   };

   const filteredOrders = orders.filter(order =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()))
   );

   const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

   return (
      <AdminLayout>
         <div className="bg-[#fdfcff] min-h-screen pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
               <div>
                  <h1 className="text-4xl font-serif text-slate-900 mb-2">Order <span className="italic text-brand-primary">Archive</span></h1>
                  <p className="text-slate-400 font-medium text-sm">Managing the lifecycle of luxury botanical acquisitions.</p>
               </div>

               <div className="flex flex-wrap items-center gap-3">
                  <div className="relative group">
                     <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                     <input
                        type="text"
                        placeholder="Search by ID or client..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm w-full md:w-[300px]"
                     />
                  </div>

                  <div className="relative">
                     <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none pl-6 pr-12 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:border-brand-primary outline-none transition-all shadow-sm cursor-pointer"
                     >
                        <option value="all">All Statuses</option>
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                     </select>
                     <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
               </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/30">
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">S.no</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer name</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer phone number</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Reference</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Path</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                           <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        <AnimatePresence mode="popLayout">
                           {currentOrders.length > 0 ? currentOrders.map((order, idx) => (
                              <motion.tr
                                 layout
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 exit={{ opacity: 0 }}
                                 key={order.id}
                                 className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                 onClick={() => setSelectedOrder(order)}
                              >
                                 <td className="px-8 py-6">
                                    <div className="text-sm font-bold text-slate-900">{startIndex + idx + 1}</div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="text-sm font-bold text-slate-900">{order.customer_name || "Boutique Client"}</div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="text-sm font-bold text-slate-900">{order.customer_phone || "N/A"}</div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="text-sm font-black text-slate-900 mb-1">#{order.id.split('-')[0].toUpperCase()}</div>
                                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                                       <IconCalendar size={12} />
                                       {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="text-sm font-bold text-slate-900">{order.customer_name || "Boutique Client"}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">{order.customer_email || "N/A"}</div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="text-sm font-black text-brand-primary">${parseFloat(order.total_amount).toFixed(2)}</div>
                                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{order.payment_method} • {order.payment_status}</div>
                                    {order.discount_code && parseFloat(order.discount_amount) > 0 && (
                                       <div className="text-[10px] text-emerald-500 font-bold tracking-tight mt-0.5">
                                          -{parseFloat(order.discount_amount).toFixed(2)} ({order.discount_code})
                                       </div>
                                    )}
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="flex justify-center">
                                       <span className={cn(
                                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                                          getStatusColor(order.status)
                                       )}>
                                          {order.status}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary/20 transition-all shadow-sm">
                                          <IconEye size={18} />
                                       </button>
                                       {/* <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary/20 transition-all shadow-sm">
                                      <IconDotsVertical size={18} />
                                   </button> */}
                                    </div>
                                 </td>
                              </motion.tr>
                           )) : (
                              <tr>
                                 <td colSpan="8" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-4 grayscale opacity-30">
                                       <IconShoppingBag size={48} />
                                       <p className="text-sm font-serif italic text-slate-400">No botanical acquisitions found in this archive.</p>
                                    </div>
                                 </td>
                              </tr>
                           )}
                        </AnimatePresence>
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
               <div className="mt-8 flex justify-between items-center px-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                     Showing luxury acquisitions {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
                  </p>

                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={cn(
                           "w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-sm",
                           currentPage === 1
                              ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                              : "bg-white border-slate-100 text-slate-600 hover:border-brand-primary/20 hover:text-brand-primary"
                        )}
                     >
                        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                           <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                     </button>

                     {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                           key={pageNum}
                           onClick={() => setCurrentPage(pageNum)}
                           className={cn(
                              "w-10 h-10 rounded-xl text-[10px] font-black transition-all",
                              currentPage === pageNum
                                 ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                 : "bg-white border border-slate-100 text-slate-600 hover:border-brand-primary/20 hover:text-brand-primary"
                           )}
                        >
                           {pageNum}
                        </button>
                     ))}

                     <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={cn(
                           "w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-sm",
                           currentPage === totalPages
                              ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                              : "bg-white border-slate-100 text-slate-600 hover:border-brand-primary/20 hover:text-brand-primary"
                        )}
                     >
                        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                     </button>
                  </div>
               </div>
            )}

            {/* Order Details Modal */}
            <AnimatePresence>
               {selectedOrder && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                     <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                     >
                        {/* Modal Left: Status & Summary */}
                        <div className="w-full md:w-1/3 bg-slate-50 p-10 border-r border-slate-100 overflow-y-auto no-scrollbar">
                           <button onClick={() => setSelectedOrder(null)} className="mb-10 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 flex items-center gap-2 group">
                              <IconX size={14} className="transition-transform group-hover:rotate-90" /> Close Details
                           </button>

                           <h2 className="text-2xl font-serif text-slate-900 mb-8">Acquisition <span className="italic text-brand-primary">Path</span></h2>

                           <div className="space-y-8 relative">
                              <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />

                              {[
                                 { id: 'placed', label: 'Order Placed', icon: IconCheck },
                                 { id: 'confirmed', label: 'Confirmed', icon: IconPackage },
                                 { id: 'packed', label: 'Curated & Packed', icon: IconPackage },
                                 { id: 'shipped', label: 'In Transit', icon: IconTruck },
                                 { id: 'delivered', label: 'Arrived', icon: IconCheck }
                              ].map((step, idx) => {
                                 const isCompleted = ["placed", "confirmed", "packed", "shipped", "delivered"].indexOf(selectedOrder.status) >= ["placed", "confirmed", "packed", "shipped", "delivered"].indexOf(step.id);
                                 const isActive = selectedOrder.status === step.id;

                                 return (
                                    <button
                                       key={step.id}
                                       onClick={() => updateOrderStatus(selectedOrder.id, step.id)}
                                       className={cn(
                                          "flex items-center gap-4 w-full text-left group transition-all relative z-10",
                                          isCompleted ? "opacity-100" : "opacity-30 hover:opacity-60"
                                       )}
                                    >
                                       <div className={cn(
                                          "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                                          isActive ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-110" :
                                             isCompleted ? "bg-white border-emerald-500 text-emerald-500" : "bg-white border-slate-200 text-slate-300"
                                       )}>
                                          <step.icon size={14} />
                                       </div>
                                       <div>
                                          <p className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "text-brand-primary" : "text-slate-900")}>{step.label}</p>
                                          {isActive && <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5 animate-pulse">In Progress</p>}
                                       </div>
                                    </button>
                                 );
                              })}
                           </div>

                           <div className="mt-12 pt-12 border-t border-slate-100 space-y-6">
                              <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Client Address</p>
                                 <p className="text-xs font-bold text-slate-900 leading-relaxed">{selectedOrder.shipping_address}<br />{selectedOrder.shipping_city}, {selectedOrder.shipping_zip}</p>
                              </div>

                              {selectedOrder.order_notes && (
                                 <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 transition-all hover:bg-brand-primary/10">
                                    <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-2">Private Instructions</p>
                                    <p className="text-xs italic text-slate-600 font-medium leading-relaxed">{selectedOrder.order_notes}</p>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Modal Right: Items & Valuation */}
                        <div className="flex-1 p-10 overflow-y-auto">
                           <div className="flex justify-between items-start mb-10">
                              <div>
                                 <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1 italic">Acquisition Identity</p>
                                 <h3 className="text-2xl font-bold text-slate-900 tracking-tight">#{selectedOrder.id?.split('-')[0].toUpperCase()}</h3>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Valuation</p>
                                 <p className="text-4xl font-bold text-brand-primary tracking-tighter">${parseFloat(selectedOrder.total_amount).toFixed(2)}</p>
                                 {selectedOrder.discount_code && parseFloat(selectedOrder.discount_amount) > 0 && (
                                    <p className="text-[11px] font-bold text-emerald-500 mt-1 uppercase tracking-wider">
                                       Discount: -${parseFloat(selectedOrder.discount_amount).toFixed(2)} <span className="px-1.5 py-0.5 bg-emerald-50 rounded-md text-emerald-600 border border-emerald-100/50">{selectedOrder.discount_code}</span>
                                    </p>
                                 )}
                              </div>
                           </div>

                           <div className="space-y-6">
                              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-50 pb-4 italic">Registry Items</h4>

                              <div className="space-y-4">
                                 {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 transition-all group">
                                       <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-500">
                                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                                       </div>
                                       <div className="flex-grow">
                                          <h5 className="text-sm font-bold text-slate-900">{item.name}</h5>
                                          <div className="flex gap-4 mt-1.5 flex-wrap">
                                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Qty: {item.quantity}</p>
                                             <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">${parseFloat(item.price).toFixed(2)} ea</p>
                                          </div>
                                          {item.options && (
                                             <div className="flex gap-2 mt-2">
                                                {Object.entries(item.options).map(([key, val]) => (
                                                   <span key={key} className="px-2 py-0.5 bg-white border border-slate-100 rounded-md text-[8px] font-black uppercase text-slate-400">{val}</span>
                                                ))}
                                             </div>
                                          )}
                                       </div>
                                       <div className="text-right">
                                          <p className="text-sm font-black text-slate-900">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="mt-12 grid grid-cols-2 gap-8">
                              <div className="space-y-4">
                                 <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">Floral Extras</h4>
                                 <div className="grid grid-cols-1 gap-2">
                                    <div className="flex justify-between text-[10px] border-b border-slate-50 pb-2">
                                       <span className="text-slate-400 font-bold uppercase tracking-tighter">Occasion</span>
                                       <span className="text-slate-900 font-black uppercase">{selectedOrder.occasion_type || 'Boutique'}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] border-b border-slate-50 pb-2">
                                       <span className="text-slate-400 font-bold uppercase tracking-tighter">Scheduled Date</span>
                                       <span className="text-slate-900 font-black uppercase">{selectedOrder.delivery_date || 'Standard'}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] border-b border-slate-50 pb-2">
                                       <span className="text-slate-400 font-bold uppercase tracking-tighter">Time Slot</span>
                                       <span className="text-slate-900 font-black uppercase">{selectedOrder.time_slot || 'ASAP'}</span>
                                    </div>
                                 </div>
                              </div>

                              <div className="p-6 bg-slate-900 text-white rounded-3xl relative overflow-hidden group">
                                 <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-3 relative z-10 italic">Gift Message Attachment</p>
                                 <p className="text-sm italic font-serif leading-relaxed relative z-10 transition-colors group-hover:text-brand-secondary">
                                    "{selectedOrder.gift_message || 'No personal message attached to this botanical piece.'}"
                                 </p>
                                 <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-700" />
                              </div>
                           </div>

                           <div className="mt-12 flex gap-4">
                              <button
                                 onClick={() => generateInvoice(selectedOrder)}
                                 className="flex-1 py-5 bg-brand-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95"
                              >
                                 <IconFileInvoice size={18} /> Download Invoice
                              </button>
                              {/* <button className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95">
                                 Issue Refund
                              </button> */}
                           </div>
                        </div>
                     </motion.div>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </AdminLayout>
   );
};

export default OrderManagement;
