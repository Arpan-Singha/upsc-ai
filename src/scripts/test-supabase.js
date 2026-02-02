
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Start of Selection
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

console.log('Testing Connection to:', supabaseUrl)

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    // Try to fetch a public data or just checking health
    // We'll try to get auth settings or just a simple query
    try {
        const { data, error } = await supabase.from('test_connection').select('*').limit(1).maybeSingle();
        // Even if table doesn't exist, we get a specific error that confirms connection
        if (error && error.code !== '42P01') { // 42P01 is undefined table, which means we CONNECTED but table missing
            console.error('Connection Failed:', error.message)
        } else {
            console.log('✅ Connection Successful! (Supabase is reachable)')
        }
    } catch (e) {
        console.error('Unexpected Error:', e)
    }
}

testConnection()
