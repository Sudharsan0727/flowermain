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
      SELECT column_name, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'collections'
      AND column_name = 'id'
    `);
    console.log('ID COLUMN DEFAULT:', res.rows[0]);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await pool.end();
  }
}

check();
