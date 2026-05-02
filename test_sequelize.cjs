const sequelize = require('./backend/src/config/database');

async function testConnection() {
  try {
    console.log('Testing Sequelize connection...');
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
}

testConnection();
