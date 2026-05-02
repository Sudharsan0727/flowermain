const sequelize = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    console.log('Starting migration...');
    const sql = fs.readFileSync(path.join(__dirname, 'create_discount_tables.sql'), 'utf8');
    
    // Execute raw SQL
    await sequelize.query(sql);
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
