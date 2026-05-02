require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'collections'
    `);
    
    if (res.rowCount === 0) {
      console.log('TABLE MISSING: collections');
      process.exit(1);
    }
    
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'collections'
    `);
    console.log('COLUMNS:', columns.rows);
    
    const constraints = await pool.query(`
      SELECT conname, contype 
      FROM pg_constraint 
      JOIN pg_class ON pg_class.oid = conrelid 
      WHERE relname = 'collections'
    `);
    console.log('CONSTRAINTS:', constraints.rows);
    
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await pool.end();
  }
}

check();
