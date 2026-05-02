const sequelize = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function diagnostic() {
    try {
        await sequelize.authenticate();
        console.log('--- DATABASE DIAGNOSTIC (DEMO_FLOWER) ---');
        console.log('Backend connected successfully.');

        // List all tables
        const tables = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `, { type: QueryTypes.SELECT });

        console.log(`\nFound ${tables.length} tables in public schema:`);
        for (const t of tables) {
            const rowCount = await sequelize.query(`SELECT COUNT(*) FROM "${t.table_name}"`, { type: QueryTypes.SELECT });
            console.log(`- ${t.table_name.padEnd(20)} | Rows: ${rowCount[0].count}`);
        }

        console.log('\n--------------------------------------');
        process.exit(0);
    } catch (e) {
        console.error('Diagnostic Failure:', e.message);
        process.exit(1);
    }
}
diagnostic();
