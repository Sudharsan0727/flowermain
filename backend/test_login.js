const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const Admin = require('./src/models/Admin');

async function test() {
    await sequelize.authenticate();
    const admin = await Admin.findOne({ where: { username: 'admin' } });
    if (!admin) {
        console.log('Admin user NOT FOUND');
        return;
    }
    const isMatch = await bcrypt.compare('admin123', admin.password);
    console.log('Login Test for admin / admin123:', isMatch ? 'SUCCESS' : 'FAILED');
    process.exit(0);
}
test();
