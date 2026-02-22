const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const client = new Client({
        connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.pjojkypcuifdgdelygqm.supabase.co:5432/postgres`
    });

    try {
        console.log("Connecting to Postgres...");
        await client.connect();

        console.log("Creating trigger for new users...");
        await client.query(`
            -- Create a function to handle new user signups
            create or replace function public.handle_new_user()
            returns trigger
            language plpgsql
            security definer set search_path = public
            as $$
            begin
            insert into public.profiles (id, name, role)
            values (new.id, split_part(new.email, '@', 1), 'user');
            return new;
            end;
            $$;

            -- Trigger the function every time a user is created
            drop trigger if exists on_auth_user_created on auth.users;
            create trigger on_auth_user_created
            after insert on auth.users
            for each row execute procedure public.handle_new_user();
        `);

        console.log("Trigger created successfully!");
    } catch (err) {
        console.error("Error creating trigger:", err.message);
    } finally {
        await client.end();
    }
}

run();
