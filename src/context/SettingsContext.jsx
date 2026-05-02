
    import React, { createContext, useContext, useState, useEffect } from 'react';
    import API_BASE from '../config';

    const SettingsContext = createContext();

    export const SettingsProvider = ({ children }) => {
        const [settings, setSettings] = useState({});
        const [loading, setLoading] = useState(true);

        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/settings`, { credentials: 'include' });
                const data = await res.json();
                const settingsMap = {};
                data.forEach(s => {
                    settingsMap[s.key] = s.value;
                });
                setSettings(settingsMap);
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            fetchSettings();
            window.addEventListener('settingsUpdated', fetchSettings);
            return () => window.removeEventListener('settingsUpdated', fetchSettings);
        }, []);

        const getCurrencySymbol = () => {
            const currency = settings.currency || 'USD';
            const symbols = {
                'USD': '$',
                'EUR': '€',
                'GBP': '£',
                'INR': '₹',
                'CAD': '$',
                'AUD': '$',
                'SGD': '$',
                'AED': 'د.إ'
            };
            return symbols[currency] || '$';
        };

        const formatPrice = (price) => {
            if (!price) return '';
            // If price is already a string with a symbol, try to extract the number
            const numericPrice = typeof price === 'string' 
                ? parseFloat(price.replace(/[^\d.]/g, '')) 
                : price;
            
            if (isNaN(numericPrice)) return price;

            const symbol = getCurrencySymbol();
            return `${symbol}${numericPrice.toFixed(2)}`;
        };

        return (
            <SettingsContext.Provider value={{ settings, loading, fetchSettings, getCurrencySymbol, formatPrice }}>
                {children}
            </SettingsContext.Provider>
        );
    };

    export const useSettings = () => useContext(SettingsContext);
