const { Client } = require('pg');

async function scanAllDatabases() {
    // Connect to the master postgres database to list all others
    const masterClient = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        port: 5432,
    });

    try {
        await masterClient.connect();
        const res = await masterClient.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
        const dbNames = res.rows.map(r => r.datname);

        console.log('--- SCANNING ALL DATABASES ON SERVER ---');
        for (const dbName of dbNames) {
            const client = new Client({ user: 'postgres', host: 'localhost', database: dbName, port: 5432 });
            try {
                await client.connect();
                const tableRes = await client.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'orders'");
                if (parseInt(tableRes.rows[0].count) > 0) {
                    const orderRes = await client.query('SELECT COUNT(*) FROM "orders"');
                    console.log(`[!] FOUND ORDERS in Database: "${dbName}" -> Total Orders: ${orderRes.rows[0].count}`);
                }
                await client.end();
            } catch (err) {
                // Skip databases we can't access
            }
        }
        console.log('--- SCAN COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Scan Failed:', err.message);
        process.exit(1);
    }
}
scanAllDatabases();
