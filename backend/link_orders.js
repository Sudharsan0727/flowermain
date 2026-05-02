const Order = require('./src/models/Order');
const Customer = require('./src/models/Customer');
const sequelize = require('./src/config/database');

async function link() {
  try {
    await sequelize.authenticate();
    const [orders] = await sequelize.query("UPDATE orders SET customer_id = 1 WHERE customer_id IS NULL");
    console.log(`Success! Linked orphaned acquisitions to Identity #1 (Shalini).`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

link();
