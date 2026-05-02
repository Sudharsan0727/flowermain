require('dotenv').config();
const sequelize = require('../src/config/database');

async function fixImages() {
    try {
        const domain = process.env.APP_DOMAIN || 'https://flowershop.mbwhost.in';
        console.log(`--- PATCHING ALL TABLES FOR DOMAIN: ${domain} ---`);

        // Get every table name from the database automatically
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);

        for (const row of tables) {
            const table = row.table_name;
            try {
                // Try to update the 'image' column if it exists in this table
                await sequelize.query(`
                    UPDATE "${table}" 
                    SET "image" = REPLACE("image", 'http://localhost:3001', '${domain}')
                    WHERE "image" LIKE 'http://localhost:3001%';
                `);
                console.log(`✅ Checked/Patched table: ${table}`);
            } catch (e) {
                // Skip if table doesn't have an 'image' column
            }
            
            try {
                // Also patch 'imageSecondary' and 'imageTertiary' for Banners
                await sequelize.query(`
                    UPDATE "${table}" 
                    SET "imageSecondary" = REPLACE("imageSecondary", 'http://localhost:3001', '${domain}')
                    WHERE "imageSecondary" LIKE 'http://localhost:3001%';
                `);
                await sequelize.query(`
                    UPDATE "${table}" 
                    SET "imageTertiary" = REPLACE("imageTertiary", 'http://localhost:3001', '${domain}')
                    WHERE "imageTertiary" LIKE 'http://localhost:3001%';
                `);
            } catch (e) {}
        }

        console.log('--- ALL TABLES SCANNED & PATCHED ---');
        process.exit(0);
    } catch (err) {
        console.error('Patch Failed:', err.message);
        process.exit(1);
    }
}
fixImages();
