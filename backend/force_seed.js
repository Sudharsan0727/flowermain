const Setting = require('./src/models/Setting');
const AtelierHour = require('./src/models/AtelierHour');
const FooterLink = require('./src/models/FooterLink');
const sequelize = require('./src/config/database');

async function forceSeed() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Force Clear and Re-seed Atelier Hours
        await AtelierHour.destroy({ where: {}, truncate: true });
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
        console.log('✅ Atelier Hours Restored.');

        // Force Clear and Re-seed Footer Links
        await FooterLink.destroy({ where: {}, truncate: true });
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
        console.log('✅ Footer Links Restored.');

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

forceSeed();
