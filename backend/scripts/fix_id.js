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
    console.log('Enabling SERIAL behavior for id column...');
    
    // 1. Create a sequence
    await pool.query("CREATE SEQUENCE IF NOT EXISTS collections_id_seq");
    
    // 2. Set max id to the sequence
    const maxIdRes = await pool.query("SELECT MAX(id) FROM collections");
    const nextId = (parseInt(maxIdRes.rows[0].max) || 0) + 1;
    await pool.query(`SELECT setval('collections_id_seq', ${nextId}, false)`);
    
    // 3. Set the default for the column to the sequence nextval
    await pool.query("ALTER TABLE collections ALTER COLUMN id SET DEFAULT nextval('collections_id_seq')");
    
    // 4. Also add NOT NULL if missing
    await pool.query("ALTER TABLE collections ALTER COLUMN id SET NOT NULL");
    
    console.log('Database fix Applied successfully. ID column is now auto-incrementing.');
  } catch (err) {
    if (err.message.includes('already exists')) {
        console.log('Sequence already exists or already set up.');
    } else {
        console.error('ERROR:', err);
    }
  } finally {
    await pool.end();
  }
}

fix();
