const Setting = require('./src/models/Setting');
const sequelize = require('./src/config/database');

async function forceUpdate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // Update Site Name
        await Setting.upsert({
            key: 'site_name',
            value: 'MBW Flowers Shop',
            group: 'site',
            type: 'string'
        });

        // Update Site Logo (if you uploaded mbw.webp, let's force it)
        await Setting.upsert({
            key: 'site_logo',
            value: '/uploads/mbw.webp',
            group: 'site',
            type: 'string'
        });

        // Update Footer Logo
        await Setting.upsert({
            key: 'footer_logo',
            value: '/uploads/mbw.webp',
            group: 'site',
            type: 'string'
        });

        console.log('✅ DATABASE FORCE UPDATED: Shalini Flower & mbw.webp set.');
        process.exit(0);
    } catch (err) {
        console.error('Update failed:', err);
        process.exit(1);
    }
}

forceUpdate();
