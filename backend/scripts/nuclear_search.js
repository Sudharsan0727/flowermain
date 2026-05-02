const sequelize = require('../src/config/database');

async function nuclearSearch() {
    try {
        await sequelize.authenticate();
        console.log('--- SYSTEM WIDE DISCOVERY ---');
        console.log('Active DB:', sequelize.config.database);

        // 1. List ALL tables in ALL schemas
        const [allTables] = await sequelize.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema != 'information_schema' AND table_schema != 'pg_catalog';
        `);

        console.log('\n--- FINDING DATA ACROSS ALL SCHEMAS ---');
        for (const t of allTables) {
            if (t.table_name.toLowerCase().includes('order')) {
                try {
                    const [[res]] = await sequelize.query(`SELECT COUNT(*) as cnt FROM "${t.table_schema}"."${t.table_name}"`);
                    if (parseInt(res.cnt) > 0) {
                        console.log(`FOUND DATA! [Schema: ${t.table_schema}] [Table: ${t.table_name}]: ${res.cnt} records`);
                    } else {
                        console.log(`Table [${t.table_schema}.${t.table_name}]: 0 records`);
                    }
                } catch (e) {}
            }
        }

        // 2. Read the REAL details from the Activity Logs
        const [logs] = await sequelize.query('SELECT * FROM "activity_logs" ORDER BY "created_at" DESC LIMIT 10');
        console.log('\n--- REAL-TIME SERVER ACTIVITY ---');
        logs.forEach(l => {
            const d = l.details || {};
            console.log(`${l.created_at}: ${d.method || '??'} ${d.url || '??'} -> Status: ${d.responseStatus || '??'}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Search Failed:', err.message);
        process.exit(1);
    }
}
nuclearSearch();
