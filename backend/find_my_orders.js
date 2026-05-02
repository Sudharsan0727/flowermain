const sequelize = require('../src/config/database');

async function findOrders() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Get ALL table names from the database
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);

        console.log('\n--- LOOKING FOR YOUR RECORDED TRANSACTIONS ---');
        let recordsFound = false;
        for (const { table_name } of tables) {
            // Count any table that looks like orders, order_items, or Customers
            if (table_name.toLowerCase().includes('order') || table_name.toLowerCase().includes('customer')) {
                try {
                    const [[res]] = await sequelize.query(`SELECT COUNT(*) as cnt FROM "${table_name}"`);
                    if (parseInt(res.cnt) > 0) {
                        console.log(`Table "${table_name}": ${res.cnt} records found`);
                        recordsFound = true;
                    } else {
                        console.log(`Table "${table_name}": 0 records`);
                    }
                } catch (e) {}
            }
        }

        if (!recordsFound) {
            console.log('No order or customer records found in any variant of the tables.');
        }

        console.log('\n--- DISCOVERY COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Discovery Failed:', err.message);
        process.exit(1);
    }
}

findOrders();
