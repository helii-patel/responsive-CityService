import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables!');
    console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyWishlistSchema() {
    try {
        console.log('Testing if wishlist table already exists...');
        
        // First, test if the table exists
        const { data: testData, error: testError } = await supabase
            .from('wishlists')
            .select('*')
            .limit(1);
            
        if (!testError) {
            console.log('✅ Wishlist table already exists and is accessible!');
            return;
        }
        
        console.log('Wishlist table not found or not accessible. This is expected for first-time setup.');
        console.log('Error details:', testError.message);
        
        console.log('\n🔧 Please manually apply the wishlist schema:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Execute the SQL from supabase_wishlist_schema.sql');
        console.log('\n📝 Schema content:');
        
        const schemaPath = path.join(__dirname, '..', 'supabase_wishlist_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        console.log(schema);
        
    } catch (error) {
        console.error('Failed to test wishlist schema:', error);
    }
}

applyWishlistSchema();