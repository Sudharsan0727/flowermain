const sequelize = require('../src/config/database');

async function checkDuplicates() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const tablesToCheck = [
            'orders', 'Orders',
            'order_items', 'OrderItems',
            'customers', 'Customers',
            'products', 'Products',
            'activity_logs', 'ActivityLogs'
        ];

        console.log('\n--- TABLE RECORD COUNT CHECK ---');
        for (const table of tablesToCheck) {
            try {
                const [[countObj]] = await sequelize.query(`SELECT COUNT(*) as cnt FROM "${table}"`);
                console.log(`Table "${table}": ${countObj.cnt} records`);
            } catch (err) {
                // Table doesn't exist, which is fine
                // console.log(`Table "${table}" does not exist.`);
            }
        }

        console.log('\n--- DIAGNOSTIC COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Diagnostic Failed:', err.message);
        process.exit(1);
    }
}

checkDuplicates();
