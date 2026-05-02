const Order = require('./src/models/Order');
const Customer = require('./src/models/Customer');
const sequelize = require('./src/config/database');

async function check() {
  try {
    await sequelize.authenticate();
    const orders = await Order.findAll();
    console.log(`\n--- HISTORICAL REGISTRY AUDIT ---\n`);
    console.log(`Total Archival Records Verified: ${orders.length}\n`);
    orders.forEach(o => console.log(`  > Order ID: ${o.id.substring(0,8)}... | Owner Identity: #${o.customer_id} | Status: ${o.status}`));
    
    const customers = await Customer.findAll();
    console.log(`\nTotal Identity Records Found: ${customers.length}\n`);
    customers.forEach(c => console.log(`  > Identity: #${c.id} | Label: ${c.first_name} ${c.last_name} | Key: ${c.email}`));
    
    process.exit(0);
  } catch (e) {
    console.error(`[AUDIT_FAILURE] ${e.message}`);
    process.exit(1);
  }
}

check();
