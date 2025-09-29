// test-profile-retrieval.js - Test profile retrieval for Supabase users
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testProfileRetrieval() {
    try {
        console.log('🔍 Testing profile retrieval for Supabase users...');
        
        const userId = '2551775c-aab0-4e56-bbc9-883411845637'; // Your Supabase user ID
        
        // Check if profile exists in supabase_user_profiles table
        const result = await pool.query(
            'SELECT * FROM supabase_user_profiles WHERE id = $1', 
            [userId]
        );
        
        console.log('📋 Profile data found:', result.rows.length > 0 ? 'Yes' : 'No');
        
        if (result.rows.length > 0) {
            console.log('✅ Profile data:');
            console.log(result.rows[0]);
        } else {
            console.log('❌ No profile found for user:', userId);
            
            // Let's see what's in the table
            const allProfiles = await pool.query('SELECT * FROM supabase_user_profiles LIMIT 5');
            console.log('📋 All profiles in table:', allProfiles.rows.length);
            allProfiles.rows.forEach(profile => {
                console.log(`  - ID: ${profile.id}, Name: ${profile.name}, Email: ${profile.email}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Profile retrieval test error:', error);
    } finally {
        await pool.end();
    }
}

testProfileRetrieval();