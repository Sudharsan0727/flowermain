const sequelize = require('./src/config/database');
const { QueryTypes } = require('sequelize');

async function definitiveCheck() {
    try {
        await sequelize.authenticate();
        console.log('--- DEFINITIVE DATA RECONCILIATION ---');

        const tables = [
            'Admins', 'admins',
            'Faqs', 'faqs',
            'Testimonials', 'testimonials',
            'Products', 'products',
            'Categories', 'categories', 'categorys',
            'Benefits', 'benefits'
        ];

        for (const t of tables) {
            try {
                const r = await sequelize.query(`SELECT COUNT(*) FROM "${t}"`, { type: QueryTypes.SELECT });
                console.log(`Table: "${t.padEnd(15)}" | Count: ${r[0].count}`);
            } catch (err) {
                console.log(`Table: "${t.padEnd(15)}" | MISSING`);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
definitiveCheck();
