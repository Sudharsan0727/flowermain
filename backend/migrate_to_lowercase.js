const sequelize = require('./src/config/database');

async function migrate() {
    try {
        console.log('Starting refined migration...');

        // 1. Drop the existing constraint
        await sequelize.query('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey');
        
        // 2. Clear customer_id in orders temporarily to avoid constraint issues
        await sequelize.query('UPDATE orders SET customer_id = NULL');
        console.log('Nulled out existing order customer links.');

        // 3. Migrate data from "Customers" to "customers"
        const [ups] = await sequelize.query('SELECT * FROM "Customers"');
        for (const row of ups) {
            await sequelize.query(
                'INSERT INTO customers (email, password, first_name, last_name, phone, is_verified, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (email) DO NOTHING',
                { bind: [row.email, row.password, row.first_name, row.last_name, row.phone, row.is_verified, row.createdAt, row.updatedAt] }
            );
        }
        console.log(`Migrated ${ups.length} potential records.`);

        // 4. Try to re-link orders by email
        await sequelize.query(`
            UPDATE orders 
            SET customer_id = c.id 
            FROM customers c 
            WHERE orders.customer_email = c.email
        `);
        console.log('Re-linked orders to customers by email.');

        // 5. Add the new constraint
        await sequelize.query('ALTER TABLE orders ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL');
        console.log('Added new constraint to lowercase customers.');

        // 6. Drop the uppercase table
        await sequelize.query('DROP TABLE IF EXISTS "Customers" CASCADE');
        console.log('Dropped uppercase Customers table.');

        console.log('MIGRATION SUCCESSFUL');
    } catch (e) {
        console.error('MIGRATION FAILED:', e);
    }
}

migrate();
