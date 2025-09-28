// test-profile-save.js - Test actual profile save functionality
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testProfileSave() {
    try {
        console.log('🔍 Testing profile save functionality...');
        
        // First, let's see what users exist
        const usersResult = await pool.query('SELECT id, name, email, phone, city, profession, company FROM users LIMIT 5');
        console.log('👥 Existing users:');
        usersResult.rows.forEach(user => {
            console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
            console.log(`    Phone: ${user.phone}, City: ${user.city}, Profession: ${user.profession}, Company: ${user.company}`);
        });
        
        if (usersResult.rows.length > 0) {
            const testUser = usersResult.rows[0];
            console.log(`\n🧪 Testing profile update for user ID: ${testUser.id}`);
            
            // Test the exact same query that the server uses
            const updateResult = await pool.query(
                'UPDATE users SET name = $1, phone = $2, city = $3, profession = $4, company = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING id, name, email, phone, city, profession, company',
                ['Test Name Updated', '123-456-7890', 'Ahmedabad', 'Software Engineer', 'Test Company', testUser.id]
            );
            
            console.log('✅ Profile update successful!');
            console.log('Updated user data:', updateResult.rows[0]);
            
            // Restore original data
            await pool.query(
                'UPDATE users SET name = $1, phone = $2, city = $3, profession = $4, company = $5 WHERE id = $6',
                [testUser.name, testUser.phone, testUser.city, testUser.profession, testUser.company, testUser.id]
            );
            console.log('🔄 Restored original user data');
        }
        
    } catch (error) {
        console.error('❌ Profile save test error:', error);
        console.error('Error details:', error.message);
    } finally {
        await pool.end();
    }
}

testProfileSave();