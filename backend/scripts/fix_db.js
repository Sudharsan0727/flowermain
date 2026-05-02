require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function fix() {
  try {
    console.log('Adding UNIQUE constraint to slug...');
    await pool.query('ALTER TABLE collections ADD CONSTRAINT collections_slug_unique UNIQUE (slug)');
    console.log('Constraint added successfully.');
  } catch (err) {
    if (err.code === '42710') {
      console.log('Constraint already exists.');
    } else {
      console.error('ERROR:', err);
    }
  } finally {
    await pool.end();
  }
}

fix();
