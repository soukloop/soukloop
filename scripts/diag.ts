
import { Client } from 'pg';
import fs from 'fs';

async function main() {
    console.log("=== Database Diagnostic ===");

    const postgresUrl = 'postgresql://postgres:password@localhost:5435/soukloop_db';
    const pgClient = new Client({ connectionString: postgresUrl });
    try {
        await pgClient.connect();
        const tables = await pgClient.query("SELECT schemaname, relname FROM pg_stat_user_tables WHERE schemaname = 'public'");
        console.log("\nPostgres (5435) Tables with data:");

        let foundAny = false;
        for (const row of tables.rows) {
            const countRes = await pgClient.query('SELECT count(*) FROM "' + row.schemaname + '"."' + row.relname + '"');
            const count = parseInt(countRes.rows[0].count);
            if (count > 0) {
                console.log("  - " + row.relname + ": " + count + " rows");
                foundAny = true;
            }
        }
        if (!foundAny) console.log("  (All public tables are empty)");
    } catch (e) {
        console.log("Postgres (5435) check failed: " + e.message);
    } finally {
        await pgClient.end();
    }

    if (fs.existsSync('./prisma/dev.db')) {
        const stats = fs.statSync('./prisma/dev.db');
        console.log("\nSQLite dev.db exists. Size: " + (stats.size / 1024).toFixed(2) + " KB");
    } else {
        console.log("\nSQLite dev.db does not exist.");
    }
}

main();
