const Setting = require('./src/models/Setting');
const AtelierHour = require('./src/models/AtelierHour');
const FooterLink = require('./src/models/FooterLink');
const sequelize = require('./src/config/database');

const seedSettings = async () => {
    try {
        // Removed sync({ alter: true }) for VPS safety
        const defaults = [
            { group: 'site', key: 'site_name', value: 'Atelier Botanical', type: 'string' },
            { group: 'site', key: 'contact_email', value: 'concierge@atelier.com', type: 'string' },
            { group: 'site', key: 'site_logo', value: '', type: 'string' },
            { group: 'site', key: 'site_favicon', value: '', type: 'string' },
            { group: 'site', key: 'site_meta_description', value: 'Bespoke floral architecture for life\'s artisanal moments.', type: 'string' },
            { group: 'site', key: 'theme_color', value: '#7c3aed', type: 'string' },
            { group: 'site', key: 'secondary_color', value: '#fafaf9', type: 'string' },
            { group: 'business', key: 'currency', value: 'USD', type: 'string' },
            { group: 'business', key: 'tax_rate', value: '18', type: 'number' },
            { group: 'business', key: 'delivery_fee', value: '99', type: 'number' },
            { group: 'business', key: 'same_day_delivery', value: 'true', type: 'boolean' },
            { group: 'business', key: 'operating_country', value: 'United States', type: 'string' },
            { group: 'business', key: 'timezone', value: 'America/New_York', type: 'string' },
            { group: 'business', key: 'date_format', value: 'MM/DD/YYYY', type: 'string' },
            { group: 'business', key: 'shop_phone', value: '+1 (555) 000-0000', type: 'string' },
            { group: 'business', key: 'shop_whatsapp', value: '+1 (555) 000-0000', type: 'string' },
            { group: 'business', key: 'shop_address', value: '123 Floral Ave, New York, NY 10001', type: 'string' },
            { group: 'business', key: 'min_order_amount', value: '50', type: 'number' },
            { group: 'business', key: 'daily_order_limit', value: '0', type: 'number' },
            { group: 'business', key: 'disabled_delivery_dates', value: '', type: 'string' },
            { group: 'business', key: 'same_day_cutoff', value: '14:00', type: 'string' },
            { group: 'business', key: 'measurement_unit', value: 'imperial', type: 'string' },
            { group: 'site', key: 'social_instagram', value: '', type: 'string' },
            { group: 'site', key: 'social_facebook', value: '', type: 'string' },
            { group: 'site', key: 'social_pinterest', value: '', type: 'string' }
        ];

        for (const s of defaults) {
            await Setting.findOrCreate({
                where: { key: s.key },
                defaults: s
            });
        }

        // Seed Default Atelier Hours
        const existingHours = await AtelierHour.count();
        if (existingHours === 0) {
            const defaultHours = [
                { day: 'Mon', hours: '8:30 AM - 4:30 PM', isClosed: false, position: 1 },
                { day: 'Tue', hours: '8:30 AM - 4:30 PM', isClosed: false, position: 2 },
                { day: 'Wed', hours: '8:30 AM - 4:30 PM', isClosed: false, position: 3 },
                { day: 'Thu', hours: '8:30 AM - 4:30 PM', isClosed: false, position: 4 },
                { day: 'Fri', hours: '8:30 AM - 6:30 PM', isClosed: false, position: 5 },
                { day: 'Sat', hours: '10:00 AM - 6:00 PM', isClosed: false, position: 6 },
                { day: 'Sun', hours: 'Closed', isClosed: true, position: 7 }
            ];
            await AtelierHour.bulkCreate(defaultHours);
            console.log('Atelier Registry: Initial hours synchronized.');
        }

        // Seed Default Footer Links
        const existingLinks = await FooterLink.count();
        if (existingLinks === 0) {
            const defaultLinks = [
                // Artisanal Studio
                { category: 'Artisanal Studio', label: 'Our Philosophy', url: '#', position: 1 },
                { category: 'Artisanal Studio', label: 'Floral Archives', url: '#', position: 2 },
                { category: 'Artisanal Studio', label: 'Sustainability', url: '#', position: 3 },
                { category: 'Artisanal Studio', label: 'Bespoke Suites', url: '#', position: 4 },
                
                // Client Service
                { category: 'Client Service', label: 'Track Acquisition', url: '#', position: 5 },
                { category: 'Client Service', label: 'Delivery Protocol', url: '#', position: 6 },
                { category: 'Client Service', label: 'Care Instructions', url: '#', position: 7 },
                { category: 'Client Service', label: 'Returns Archive', url: '#', position: 8 },
                
                // The Collective
                { category: 'The Collective', label: 'Easter', url: '/easter', position: 9 },
                { category: 'The Collective', label: 'Roses', url: '/roses', position: 10 },
                { category: 'The Collective', label: 'Birthday', url: '/birthday', position: 11 },
                { category: 'The Collective', label: 'Sympathy', url: '#', position: 12 },
                { category: 'The Collective', label: 'Occasions', url: '#', position: 13 },
                { category: 'The Collective', label: 'Holidays', url: '#', position: 14 }
            ];
            await FooterLink.bulkCreate(defaultLinks);
            console.log('Atelier Registry: Default footer links deployed.');
        }

        console.log('Atelier Registry: Default settings commissioned successfully.');
    } catch (err) {
        console.error('Atelier Registry: Seeding failed:', err);
    }
};

module.exports = seedSettings;

if (require.main === module) {
    seedSettings();
}
