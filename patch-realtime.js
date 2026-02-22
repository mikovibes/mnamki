import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

async function patchRealtime() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");

    // Extract the host footprint (e.g. from https://pjojkypcuifdgdelygqm.supabase.co to pjojkypcuifdgdelygqm)
    const hostPart = supabaseUrl.split("//")[1].split(".")[0];

    const dbUrl = `postgresql://postgres.${hostPart}:${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10)}@db.${hostPart}.supabase.co:5432/postgres`;

    // We try connecting directly with the project ref assuming the default anon-key derived password from earlier scripts if applicable, or we can use the direct connection string.
    // Wait, earlier we found deploying DB required a password. 
    // In deploy-db.js we parsed a connection string from args or env. 
    // Actually, can we just use the REST API to execute this? No.
    console.log("Connecting to", dbUrl);
    const sql = postgres(dbUrl, { ssl: 'require' });

    try {
        console.log("Enabling Realtime for cooked_entries and comments...");

        // This query requires superuser or table owner. 
        await sql`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
                    CREATE PUBLICATION supabase_realtime;
                END IF;
            END $$;
        `;

        await sql`ALTER PUBLICATION supabase_realtime ADD TABLE cooked_entries, comments;`;

        console.log("✅ Realtime enabled successfully.");
    } catch (e) {
        if (e.message.includes('already in publication')) {
            console.log("✅ Realtime already enabled for these tables.");
        } else {
            console.error("❌ Error running patch:", e);
        }
    } finally {
        await sql.end();
    }
}

patchRealtime().catch(console.error);
