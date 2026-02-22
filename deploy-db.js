const { Client } = require('pg');
const fs = require('fs');

async function run() {
    const client = new Client({
        connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.pjojkypcuifdgdelygqm.supabase.co:5432/postgres`
    });

    try {
        console.log("Connecting to Postgres...");
        await client.connect();

        console.log("Reading schema file...");
        const sql = fs.readFileSync('supabase/migrations/00000_schema.sql', 'utf8');

        console.log("Executing schema...");
        await client.query(sql);

        console.log("Database schema successfully deployed!");
    } catch (err) {
        console.error("Error executing schema:", err);
    } finally {
        await client.end();
    }
}

run();
