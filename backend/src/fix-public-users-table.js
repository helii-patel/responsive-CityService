// fix-public-users-table.js - Add missing columns to public.users table
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

async function fixPublicUsersTable() {
    try {
        console.log('🔧 Fixing public.users table by adding missing columns...');
        
        // Add phone column
        try {
            await pool.query('ALTER TABLE public.users ADD COLUMN phone VARCHAR(20)');
            console.log('✅ Added phone column');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ Phone column already exists');
            } else {
                console.error('❌ Error adding phone column:', error.message);
            }
        }
        
        // Add updated_at column
        try {
            await pool.query('ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
            console.log('✅ Added updated_at column');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ Updated_at column already exists');
            } else {
                console.error('❌ Error adding updated_at column:', error.message);
            }
        }
        
        // Add trigger for updated_at
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        
        await pool.query('DROP TRIGGER IF EXISTS update_users_updated_at ON public.users');
        await pool.query(`
            CREATE TRIGGER update_users_updated_at 
                BEFORE UPDATE ON public.users 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column()
        `);
        console.log('✅ Added updated_at trigger');
        
        // Verify the final structure
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' 
            ORDER BY ordinal_position;
        `);
        
        console.log('\n📋 Final public.users table structure:');
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
        
        console.log('\n🎉 public.users table is now ready for profile updates!');
        
    } catch (error) {
        console.error('❌ Error fixing table:', error);
    } finally {
        await pool.end();
    }
}

fixPublicUsersTable();