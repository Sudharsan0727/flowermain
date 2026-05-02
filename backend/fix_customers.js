const sequelize = require('./src/config/database');
async function fix() {
    try {
        await sequelize.query('ALTER TABLE "Customers" ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false');
        await sequelize.query('ALTER TABLE "Customers" ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)');
        console.log('Columns added successfully');
    } catch (e) {
        console.error('Error adding columns:', e);
    }
}
fix();
