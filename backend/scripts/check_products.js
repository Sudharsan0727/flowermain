const { Client } = require('pg');
require('dotenv').config({ path: './.env' });

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkProductSchema() {
  await client.connect();
  const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND table_schema = 'public'");
  console.log("Schema of 'products' table:");
  res.rows.forEach(row => console.log(`- ${row.column_name}: ${row.data_type}`));
  await client.end();
}

checkProductSchema().catch(console.error);
