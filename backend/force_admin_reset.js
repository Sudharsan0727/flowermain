const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const Admin = require('./src/models/Admin');

async function fix() {
    await sequelize.authenticate();
    const hp = await bcrypt.hash('admin123', 10);
    // Find ALL accounts with username 'admin' or ID 1 and reset them
    const admins = await Admin.findAll({ where: { username: 'admin' } });
    console.log(`Found ${admins.length} accounts with username 'admin'`);
    for (const a of admins) {
        await a.update({ password: hp });
        console.log(`Reset password for [${a.username}] ID: ${a.id} to admin123`);
    }
    process.exit(0);
}
fix();
