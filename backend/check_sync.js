const sequelize = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function checkSync() {
    try {
        await sequelize.authenticate();
        console.log('--- RECONCILIATION DIAGNOSTIC FOR DEMO_FLOWER ---');

        // Fetch ALL tables across ALL case sensitivities
        const allTables = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `, { type: QueryTypes.SELECT });

        for (const t of allTables) {
            const name = t.table_name;
            const res = await sequelize.query(`SELECT COUNT(*) FROM "${name}"`, { type: QueryTypes.SELECT });
            console.log(`Table: "${name.padEnd(20)}" | Records: ${res[0].count}`);
        }

        console.log('\n--- END OF REPORT ---');
        process.exit(0);
    } catch (e) {
        console.error('Diagnostic error:', e.message);
        process.exit(1);
    }
}
checkSync();
