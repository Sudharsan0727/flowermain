
const sequelize = require('../src/config/database');
const HomeSection = require('../src/models/HomeSection');
const HomeSectionItem = require('../src/models/HomeSectionItem');

async function testSync() {
  try {
    await sequelize.authenticate();
    console.log('Auth OK');
    await sequelize.sync({ alter: true, logging: console.log });
    console.log('Sync OK');
  } catch (err) {
    console.error('SYNC ERROR:', err);
  } finally {
    await sequelize.close();
  }
}

testSync();
