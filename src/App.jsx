import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Easter from './pages/Easter'
import Roses from './pages/Roses'
import Birthday from './pages/Birthday'
import ProductDetails from './pages/ProductDetails'
import Checkout from './pages/Checkout'
import Cart from './pages/Cart'
import Account from './pages/Account'
import OrderSuccess from './pages/OrderSuccess'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import HospitalFlowerDelivery from './pages/HospitalFlowerDelivery'
import FuneralFlowerDelivery from './pages/FuneralFlowerDelivery'
import { NotificationProvider } from './context/NotificationContext'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import ScrollToTop from './components/ScrollToTop'
import CollectionPage from './pages/CollectionPage'
import API_BASE from './config';
import { getImageUrl } from './utils/imageHelper';

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import ProductManagement from './pages/admin/ProductManagement'
import MenuOverview from './pages/admin/MenuOverview'
import BannerManagement from './pages/admin/BannerManagement'
import AdminComingSoon from './pages/admin/ComingSoon'
import BenefitManagement from './pages/admin/BenefitManagement'
import CategoryManagement from './pages/admin/CategoryManagement'
import FaqManagement from './pages/admin/FaqManagement'
import TestimonialManagement from './pages/admin/TestimonialManagement'
import SubscriptionManagement from './pages/admin/SubscriptionManagement'
import AtelierManagement from './pages/admin/AtelierManagement'
import FooterManagement from './pages/admin/FooterManagement'
import AdminLogin from './pages/admin/Login'
import ProtectedRoute from './components/admin/ProtectedRoute'
import MediaManagement from './pages/admin/MediaManagement'
import PageManagement from './pages/admin/PageManagement'
import SignatureManagement from './pages/admin/SignatureManagement'
import DiscoveryManagement from './pages/admin/DiscoveryManagement'
import InventoryManagement from './pages/admin/InventoryManagement'
import SettingsManagement from './pages/admin/SettingsManagement'
import CustomerManagement from './pages/admin/CustomerManagement'
import OrderManagement from './pages/admin/OrderManagement'
import DeliveryArea from './pages/DeliveryArea'
import FuneralContentManagement from './pages/admin/FuneralContentManagement'
import FuneralFacilityManagement from './pages/admin/FuneralFacilityManagement'
import HospitalContentManagement from './pages/admin/HospitalContentManagement'
import HospitalFacilityManagement from './pages/admin/HospitalFacilityManagement'
import DeliveryAreaManagement from './pages/admin/DeliveryAreaManagement'
import DeliveryAreaContentManagement from './pages/admin/DeliveryAreaContentManagement'
import DiscountManagement from './pages/admin/DiscountManagement'

function App() {
  return (
    <SettingsProvider>
      <SettingsContent />
    </SettingsProvider>
  )
}

function SettingsContent() {
  const { settings } = useSettings();

  useEffect(() => {
    // Apply visual protocol (CSS Variables)
    if (settings.theme_color) {
      document.documentElement.style.setProperty('--brand-primary', settings.theme_color);
      document.documentElement.style.setProperty('--brand-accent', settings.theme_color);
    }
    if (settings.secondary_color) {
      document.documentElement.style.setProperty('--brand-secondary', settings.secondary_color);
    }
    if (settings.site_name) {
      document.title = settings.site_slogan ? `${settings.site_name} - ${settings.site_slogan}` : settings.site_name;
    }
    if (settings.site_favicon) {
      const favicon = document.querySelector('link[rel="icon"]');
      const faviconUrl = getImageUrl(settings.site_favicon);
      if (favicon) {
        favicon.href = faviconUrl;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = faviconUrl;
        document.head.appendChild(newFavicon);
      }
    }
  }, [settings]);

  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* User Side */}
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/account" element={<Account />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/hospital-flower-delivery" element={<HospitalFlowerDelivery />} />
              <Route path="/funeral-flower-delivery" element={<FuneralFlowerDelivery />} />
              <Route path="/easter" element={<CollectionPage slug="easter" />} />
              <Route path="/roses" element={<CollectionPage slug="roses" />} />
              <Route path="/birthday" element={<CollectionPage slug="birthday" />} />
              <Route path="/funeral-flowers" element={<CollectionPage slug="funeral-flowers" />} />
              <Route path="/cremation-memorial" element={<CollectionPage slug="cremation-memorial" />} />
              <Route path="/:slug" element={<CollectionPage />} />


              {/* Admin Side */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin/header" element={<ProtectedRoute><MenuOverview /></ProtectedRoute>} />
              <Route path="/admin/banners" element={<ProtectedRoute><BannerManagement /></ProtectedRoute>} />
              {/* <Route path="/admin/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} /> */}
              <Route path="/admin/benefits" element={<ProtectedRoute><BenefitManagement /></ProtectedRoute>} />
              <Route path="/admin/categories" element={<ProtectedRoute><CategoryManagement /></ProtectedRoute>} />
              <Route path="/admin/faqs" element={<ProtectedRoute><FaqManagement /></ProtectedRoute>} />
              <Route path="/admin/testimonials" element={<ProtectedRoute><TestimonialManagement /></ProtectedRoute>} />
              <Route path="/admin/signature" element={<ProtectedRoute><SignatureManagement /></ProtectedRoute>} />
              <Route path="/admin/discoveries" element={<ProtectedRoute><DiscoveryManagement /></ProtectedRoute>} />
              <Route path="/admin/newsletter" element={<ProtectedRoute><SubscriptionManagement /></ProtectedRoute>} />
              <Route path="/admin/atelier" element={<ProtectedRoute><AtelierManagement /></ProtectedRoute>} />
              <Route path="/admin/footer" element={<ProtectedRoute><FooterManagement /></ProtectedRoute>} />
              {/* <Route path="/admin/orders" element={<ProtectedRoute><AdminComingSoon title="Order Management" /></ProtectedRoute>} /> */}
              {/* <Route path="/admin/customers" element={<ProtectedRoute><AdminComingSoon title="Customer Management" /></ProtectedRoute>} /> */}
              <Route path="/admin/orders" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />

              <Route path="/admin/settings" element={<ProtectedRoute><SettingsManagement /></ProtectedRoute>} />
              <Route path="/admin/media" element={<ProtectedRoute><MediaManagement /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
              <Route path="/admin/pages" element={<ProtectedRoute><PageManagement /></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
              <Route path="/admin/funeral-content" element={<ProtectedRoute><FuneralContentManagement /></ProtectedRoute>} />
              <Route path="/admin/funeral-facilities" element={<ProtectedRoute><FuneralFacilityManagement /></ProtectedRoute>} />
              <Route path="/admin/hospital-content" element={<ProtectedRoute><HospitalContentManagement /></ProtectedRoute>} />
              <Route path="/admin/hospital-facilities" element={<ProtectedRoute><HospitalFacilityManagement /></ProtectedRoute>} />
              <Route path="/admin/delivery-areas" element={<ProtectedRoute><DeliveryAreaManagement /></ProtectedRoute>} />
              <Route path="/admin/delivery-content" element={<ProtectedRoute><DeliveryAreaContentManagement /></ProtectedRoute>} />
              <Route path="/admin/discounts" element={<ProtectedRoute><DiscountManagement /></ProtectedRoute>} />
              <Route path="/delivery-area" element={<DeliveryArea />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
