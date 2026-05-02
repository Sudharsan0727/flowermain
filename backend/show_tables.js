const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function showTables() {
  console.log('\n📦 Database:', process.env.DB_NAME);
  console.log('='.repeat(55));

  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);

  for (const row of tables.rows) {
    const name = row.table_name;
    const count = await pool.query(`SELECT COUNT(*) FROM "${name}"`).catch(() => ({ rows: [{ count: '?' }] }));
    const cols = await pool.query(`SELECT COUNT(*) FROM information_schema.columns WHERE table_name='${name}' AND table_schema='public'`);
    console.log(`  📋 ${name.padEnd(35)} | ${count.rows[0].count.toString().padStart(5)} rows | ${cols.rows[0].count} cols`);
  }

  console.log('='.repeat(55));
  pool.end();
}

showTables().catch(err => { console.error(err.message); pool.end(); });
