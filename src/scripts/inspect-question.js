
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY)

async function inspectQuestion() {
    const { data, error } = await supabase.from('questions').select('*').limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Sample Question Data:", JSON.stringify(data[0], null, 2));
    }
}

inspectQuestion();
