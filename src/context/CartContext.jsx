import React, { createContext, useContext, useState, useEffect } from 'react';
import API_BASE from '../config';

const CartContext = createContext();

const API_URL = `${API_BASE}/api`;

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [orders, setOrders] = useState([]);
  const [sessionId, setSessionId] = useState(localStorage.getItem('cart_session_id'));

  // Shared Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('cart');

  // Initialize Session and Fetch Cart
  useEffect(() => {
    let sId = sessionId;
    if (!sId) {
      sId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('cart_session_id', sId);
      setSessionId(sId);
    }
    fetchCart(sId);
    
    if (localStorage.getItem('customer_token')) {
      fetchOrders();
    }
  }, []);

  // Persist Wishlist
  useEffect(() => {
    localStorage.setItem('wishlist_items', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      if (!token) {
        console.warn("[REGISTRY_SYNC] Cancellation: Identity token absent for archive fetch.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && Array.isArray(data)) {
        console.log(`[REGISTRY_SYNC] Manifesting ${data.length} archived acquisitions.`);
        const mappedOrders = data.map(order => ({
          ...order,
          date: new Date(order.created_at || order.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          }),
          total: `$${parseFloat(order.total_amount).toFixed(2)}`,
          fullItems: (order.items || []).map(item => ({
            ...item,
            price: `$${parseFloat(item.price).toFixed(2)}`
          }))
        }));
        setOrders(mappedOrders);
      } else {
        console.error("[REGISTRY_SYNC] Procurement interruption:", data.message || "Unknown archive response");
        setOrders([]);
      }
    } catch (error) {
      console.error('[REGISTRY_SYNC] Archival connection crash:', error);
    }
  };

  const fetchCart = async (sId) => {
    try {
      const token = localStorage.getItem('customer_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/cart?sessionId=${sId || sessionId}`, { headers });
      const data = await res.json();

      if (data.items) {
        const items = data.items.map(item => ({
          ...item.Product,
          id: item.product_id, // Map product_id back to id for UI consistency
          cartItemId: item.id,
          quantity: item.quantity,
          options: item.options,
          price: `$${item.price}`, // Keep UI format
          cartKey: item.id
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (product, options = {}, quantity = 1) => {
    try {
      // Workflow: Map HomeSectionItem to Product if exists
      const pId = product.product_id || product.id;

      const token = localStorage.getItem('customer_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: product.product_id || product.id,
          quantity,
          options,
          sessionId
        })
      });

      if (res.ok) {
        await fetchCart(sessionId);
        openSidebar('cart');
      } else {
        const err = await res.json();
        console.error(`[CART_ADD_FAILURE] Status: ${res.status} URL: ${res.url}`, err);
        alert(err.message || 'Error processing selection in the boutique archive.');
      }
    } catch (error) {
      console.error('[CART_ADD_CRASH] Critical failure:', error);
      alert('Archive Connection Failure: Could not reach the checkout studio.');
    }
  };

  const removeFromCart = async (cartItemId) => {
    // If cartItemId is not available (e.g. legacy local state), we might need to handle it.
    // But since we're moving to DB only, cartItemId should always be there.
    try {
      const token = localStorage.getItem('customer_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_URL}/cart/remove/${cartItemId}`, {
        method: 'DELETE',
        headers
      });
      await fetchCart(sessionId);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    try {
      const token = localStorage.getItem('customer_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${API_URL}/cart/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ cartItemId, quantity: newQuantity })
      });
      await fetchCart(sessionId);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const mergeCart = async (token) => {
    if (!token && !localStorage.getItem('customer_token')) return;
    try {
      await fetch(`${API_URL}/cart/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || localStorage.getItem('customer_token')}`
        },
        body: JSON.stringify({ sessionId })
      });
      await fetchCart(sessionId);
    } catch (error) {
      console.error('Error merging cart:', error);
    }
  };

  const openSidebar = (tab) => {
    setSidebarTab(tab);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Wishlist operations (keeping local for now unless asked)
  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const isWished = prev.some(item => item.id === product.id);
      if (isWished) {
        return prev.filter(item => item.id !== product.id);
      } else {
        openSidebar('wishlist');
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const addOrder = (order) => {
    setOrders(prev => [order, ...prev]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      wishlistItems,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      toggleWishlist,
      removeFromWishlist,
      sidebarOpen,
      sidebarTab,
      openSidebar,
      closeSidebar,
      setSidebarTab,
      clearCart,
      orders,
      addOrder,
      mergeCart,
      fetchCart,
      fetchOrders
    }}>
      {children}
    </CartContext.Provider>
  );
}
