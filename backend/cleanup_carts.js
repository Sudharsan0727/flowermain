const sequelize = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function cleanCarts() {
    await sequelize.authenticate();
    console.log('Cleaning invalid cart data...');
    try {
        // Delete cart items first due to FK
        await sequelize.query('DELETE FROM cart_items', { type: QueryTypes.DELETE });
        console.log('Cart items cleared.');
        // Delete carts second
        await sequelize.query('DELETE FROM carts', { type: QueryTypes.DELETE });
        console.log('Carts cleared.');
    } catch (e) {
        console.error('Error during cleanup:', e);
    }
    process.exit(0);
}
cleanCarts();
