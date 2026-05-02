const sequelize = require('../src/config/database');

async function fixSequences() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Get all tables that might have an id sequence
        const [tables] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE';
        `);

        console.log('--- REPAIRING SEQUENCES ---');
        for (const { table_name } of tables) {
            try {
                // Try to find if there is an id column and a sequence for it
                const [seqInfo] = await sequelize.query(`
                    SELECT pg_get_serial_sequence('"${table_name}"', 'id') as seq;
                `);

                const seqName = seqInfo[0]?.seq;
                if (seqName) {
                    console.log(`Fixing sequence for ${table_name} (${seqName})...`);
                    await sequelize.query(`
                        SELECT setval('${seqName}', coalesce(max(id), 0) + 1, false) FROM "${table_name}";
                    `);
                }
            } catch (err) {
                // Skip if table doesn't have 'id' column or sequence
                // console.log(`Skipping ${table_name}: ${err.message}`);
            }
        }

        console.log('\n--- SEQUENCE STABILIZATION COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Critical Failure:', err.message);
        process.exit(1);
    }
}

fixSequences();
