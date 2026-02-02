
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY)

async function listTables() {
    // We can't list tables easily with client, so we'll try to select from common names
    const candidates = ['questions', 'mcqs', 'question_bank', 'tests', 'quiz'];

    for (const table of candidates) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (!error) {
            console.log(`FOUND TABLE: ${table} (Rows: ${count})`);
            return;
        }
    }
    console.log("Could not guess table name.");
}

listTables();
