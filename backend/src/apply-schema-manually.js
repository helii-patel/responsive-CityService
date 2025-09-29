// apply-schema-manually.js - Manually apply the schema
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

async function applySchema() {
    try {
        console.log('🔧 Manually applying database schema...');
        
        // Read and execute the schema file
        const schemaContent = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
        console.log('📄 Schema content loaded');
        
        await pool.query(schemaContent);
        console.log('✅ Schema applied successfully!');
        
        // Verify the columns now exist
        const result = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name IN ('phone', 'city', 'profession', 'company', 'updated_at')
            ORDER BY column_name;
        `);
        
        console.log('📋 Profile columns after schema application:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
        
        if (result.rows.length === 5) {
            console.log('🎉 All required profile columns exist!');
        } else {
            console.log(`⚠️ Only ${result.rows.length}/5 profile columns found`);
        }
        
    } catch (error) {
        console.error('❌ Schema application error:', error);
    } finally {
        await pool.end();
    }
}

applySchema();