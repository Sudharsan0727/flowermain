const sequelize = require('./src/config/database');
async function check() {
    try {
        const r1 = await sequelize.query('SELECT count(*) FROM customers');
        console.log('customers (lowercase):', r1[0][0].count);
        const r2 = await sequelize.query('SELECT count(*) FROM "Customers"');
        console.log('Customers (Uppercase):', r2[0][0].count);
    } catch (e) {
        console.log('One of the tables might not exist or error:', e.message);
    }
}
check();
