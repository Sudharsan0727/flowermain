const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function fixAdmins() {
    await sequelize.authenticate();
    const hp = await bcrypt.hash('admin123', 10);
    
    console.log('Resetting passwords for ALL users in "Admins" table...');
    const result = await sequelize.query(`UPDATE "Admins" SET password = :hp`, {
        replacements: { hp },
        type: QueryTypes.UPDATE
    });
    
    console.log('Done.');
    process.exit(0);
}
fixAdmins();
