const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const client = new Client({
        connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.pjojkypcuifdgdelygqm.supabase.co:5432/postgres`
    });

    try {
        console.log("Connecting to Postgres...");
        await client.connect();

        console.log("Creating recipe-photos bucket...");
        await client.query(`
            insert into storage.buckets (id, name, public) 
            values ('recipe-photos', 'recipe-photos', true)
            on conflict (id) do nothing;
        `);

        console.log("Setting up policies for recipe-photos...");
        await client.query(`
            create policy "Public Access" on storage.objects for select using ( bucket_id = 'recipe-photos' );
            create policy "Auth Insert" on storage.objects for insert with check ( bucket_id = 'recipe-photos' AND auth.role() = 'authenticated' );
        `);

        console.log("Bucket created successfully!");
    } catch (err) {
        // May fail if policies exist, ignore for now
        console.error("Error (Note: if policies exist this is fine):", err.message);
    } finally {
        await client.end();
    }
}

run();
