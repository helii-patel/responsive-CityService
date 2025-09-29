// apply-supabase-schema.js - Apply the Supabase profiles schema
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function applySupabaseSchema() {
    try {
        console.log('🔧 Applying Supabase profiles schema...');
        
        // Read and execute the schema file
        const schemaContent = await fs.readFile(path.join(__dirname, 'supabase_profiles.sql'), 'utf8');
        console.log('📄 Schema content loaded');
        
        await pool.query(schemaContent);
        console.log('✅ Supabase profiles schema applied successfully!');
        
        // Verify the table was created
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'supabase_user_profiles'
            ORDER BY ordinal_position;
        `);
        
        console.log('📋 Supabase user profiles table columns:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
        
        console.log('🎉 Supabase profiles table is ready!');
        
    } catch (error) {
        console.error('❌ Schema application error:', error);
    } finally {
        await pool.end();
    }
}

applySupabaseSchema();