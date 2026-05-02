require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false,
  }
);

async function sync() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.query('ALTER TABLE "Menus" ADD COLUMN IF NOT EXISTS "hideMegaMenu" BOOLEAN DEFAULT false;');
        console.log('Column "hideMegaMenu" added successfully.');
    } catch (e) {
        console.error('Migration failed:', e);
    }
    process.exit(0);
}

sync();
