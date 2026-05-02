const sequelize = require('../src/config/database');

async function fixSchema() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Comprehensive list of columns for 'orders' table
        const ordersColumns = [
            { name: 'customer_id', type: 'INTEGER' },
            { name: 'customer_name', type: 'VARCHAR(255)' },
            { name: 'customer_email', type: 'VARCHAR(255)' },
            { name: 'customer_phone', type: 'VARCHAR(255)' },
            { name: 'total_amount', type: 'DECIMAL(10, 2)' },
            { name: 'status', type: 'VARCHAR(255) DEFAULT \'placed\'' },
            { name: 'payment_method', type: 'VARCHAR(255) DEFAULT \'Online\'' },
            { name: 'payment_status', type: 'VARCHAR(255) DEFAULT \'pending\'' },
            { name: 'payment_id', type: 'VARCHAR(255)' },
            { name: 'shipping_address', type: 'TEXT' },
            { name: 'shipping_city', type: 'VARCHAR(255)' },
            { name: 'shipping_zip', type: 'VARCHAR(255)' },
            { name: 'delivery_method', type: 'VARCHAR(255)' },
            { name: 'delivery_date', type: 'DATE' },
            { name: 'time_slot', type: 'VARCHAR(255)' },
            { name: 'gift_message', type: 'TEXT' },
            { name: 'occasion_type', type: 'VARCHAR(255)' },
            { name: 'order_notes', type: 'TEXT' }
        ];

        console.log('--- SYNCING ORDERS TABLE ---');
        for (const col of ordersColumns) {
            try {
                await sequelize.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type};`);
                console.log(`Column "${col.name}" checked/added to orders.`);
            } catch (err) {
                console.error(`Error adding column ${col.name}:`, err.message);
            }
        }

        // Comprehensive list for 'order_items'
        const orderItemsColumns = [
            { name: 'options', type: 'JSONB' },
            { name: 'image', type: 'TEXT' }
        ];

        console.log('\n--- SYNCING ORDER_ITEMS TABLE ---');
        for (const col of orderItemsColumns) {
            try {
                await sequelize.query(`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type};`);
                console.log(`Column "${col.name}" checked/added to order_items.`);
            } catch (err) {
                console.error(`Error adding column ${col.name}:`, err.message);
            }
        }

        console.log('\n--- SCHEMA RECONCILIATION COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Critical Failure during schema fix:', err.message);
        process.exit(1);
    }
}

fixSchema();
