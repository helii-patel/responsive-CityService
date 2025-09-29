// debug-table-structure.js - Debug what table we're actually using
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

async function debugTableStructure() {
    try {
        console.log('🔍 Debugging table structure...');
        
        // Check all tables
        const tablesResult = await pool.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_name LIKE '%user%'
            ORDER BY table_schema, table_name;
        `);
        
        console.log('📋 Tables with "user" in name:');
        tablesResult.rows.forEach(table => {
            console.log(`  - ${table.table_schema}.${table.table_name}`);
        });
        
        // Check specifically for our users table
        const publicUsersResult = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' 
            ORDER BY ordinal_position;
        `);
        
        console.log('\n📋 public.users table columns:');
        publicUsersResult.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
        });
        
        // Check auth schema users table
        const authUsersResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'auth' AND table_name = 'users' 
            ORDER BY ordinal_position;
        `);
        
        if (authUsersResult.rows.length > 0) {
            console.log('\n📋 auth.users table columns:');
            authUsersResult.rows.forEach(row => {
                console.log(`  - ${row.column_name}: ${row.data_type}`);
            });
        }
        
        // Test which table we can actually insert/select from
        try {
            const testResult = await pool.query('SELECT COUNT(*) as count FROM public.users');
            console.log(`\n✅ public.users is accessible, has ${testResult.rows[0].count} rows`);
        } catch (error) {
            console.log('\n❌ public.users not accessible:', error.message);
        }
        
        try {
            const testResult = await pool.query('SELECT COUNT(*) as count FROM users');
            console.log(`✅ users (default schema) is accessible, has ${testResult.rows[0].count} rows`);
        } catch (error) {
            console.log('❌ users (default schema) not accessible:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        await pool.end();
    }
}

debugTableStructure();