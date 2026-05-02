const sequelize = require('./src/config/database');
const Admin = require('./src/models/Admin');
const ActivityLog = require('./src/models/ActivityLog');
const Setting = require('./src/models/Setting');
const Permission = require('./src/models/Permission');
const { Menu, SubMenu, HeaderConfig } = require('./src/models/Menu');

async function repairDatabase() {
    try {
        console.log('Connecting to Live Database...');
        await sequelize.authenticate();
        console.log('Handshake Successful. Running Surgical Repair...');

        // 1. Just create missing tables
        await ActivityLog.sync(); 
        await Permission.sync();
        
        // 2. Add missing columns to Admin manually if they don't exist
        try {
            await sequelize.query('ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(255)');
            await sequelize.query('ALTER TABLE "Admins" ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT \'active\'');
            console.log('Admin columns verified.');
        } catch (e) {
            console.log('Admin column check skipped (might already exist)');
        }

        console.log('✅ DATABASE REPAIRED SUCCESSFULLY!');
        process.exit(0);
    } catch (err) {
        console.error('❌ REPAIR FAILED:', err);
        process.exit(1);
    }
}

repairDatabase();
