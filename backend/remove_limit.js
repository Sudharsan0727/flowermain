const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('flowershop_v2', 'postgres', 'postgres', { 
    host: 'localhost', 
    dialect: 'postgres' 
});

async function run() {
    try {
        await sequelize.query("UPDATE \"settings\" SET value = '9999' WHERE key = 'daily_order_limit'");
        console.log("Daily order limit successfully updated to 9999.");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
