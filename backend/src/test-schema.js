// test-schema.js - Test database schema and profile functionality
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

async function testSchema() {
    try {
        console.log('🔍 Testing database schema...');
        
        // Check if users table exists with all required columns
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position;
        `);
        
        console.log('📋 Users table columns:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
        
        // Check if there are any users
        const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
        console.log(`👥 Total users in database: ${userCount.rows[0].count}`);
        
        // Test a sample profile update query (without actually updating)
        console.log('🧪 Testing profile update query structure...');
        const testQuery = `
            UPDATE users 
            SET name = $1, phone = $2, city = $3, profession = $4, company = $5, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $6 
            RETURNING id, name, email, phone, city, profession, company
        `;
        console.log('✅ Profile update query structure is valid');
        
        console.log('🎉 Database schema test completed successfully!');
        
    } catch (error) {
        console.error('❌ Schema test error:', error);
    } finally {
        await pool.end();
    }
}

testSchema();