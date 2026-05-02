const sequelize = require('../src/config/database');

async function trace() {
    try {
        console.log('--- DATABASE CONNECTION TRACE ---');
        console.log('DB Name:', sequelize.config.database);
        console.log('DB Host:', sequelize.config.host);
        console.log('DB User:', sequelize.config.username);

        await sequelize.authenticate();
        console.log('\n--- CHECKING REAL-TIME DATA ---');
        
        // Check for any records at all in the orders table
        const [orders] = await sequelize.query('SELECT * FROM "orders" LIMIT 5');
        console.log(`Orders found in table "orders": ${orders.length}`);

        // Check the Activity Logs to see if the "Place Order" request happened
        const [logs] = await sequelize.query('SELECT * FROM "activity_logs" ORDER BY "created_at" DESC LIMIT 5');
        console.log('\n--- LAST 5 ACTIVITY LOGS ---');
        logs.forEach(l => console.log(`${l.created_at}: ${l.method} ${l.path} -> ${l.status}`));

        process.exit(0);
    } catch (err) {
        console.error('Trace Failed:', err.message);
        process.exit(1);
    }
}
trace();
