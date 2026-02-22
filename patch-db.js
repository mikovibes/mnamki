const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.pjojkypcuifdgdelygqm.supabase.co:5432/postgres`
    });

    try {
        console.log("Connecting to Postgres to patch schema...");
        await client.connect();

        await client.query("ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS time integer;");
        await client.query("NOTIFY pgrst, 'reload schema';");

        console.log("Schema patched and cache reloaded successfully!");
    } catch (err) {
        console.error("Error patching schema:", err.message);
    } finally {
        await client.end();
    }
}

run();
