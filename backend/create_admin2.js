const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const Admin = require('./src/models/Admin');

async function createNew() {
    await sequelize.authenticate();
    const hp = await bcrypt.hash('admin123', 10);
    
    // Create or update admin2
    const [user, created] = await Admin.findOrCreate({
        where: { username: 'admin2' },
        defaults: {
            password: hp,
            role: 'superadmin',
            email: 'admin2@example.com'
        }
    });

    if (!created) {
        await user.update({ password: hp });
    }

    console.log('User admin2 created/updated with password admin123');
    process.exit(0);
}
createNew();
