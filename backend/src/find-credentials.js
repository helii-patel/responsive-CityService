import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;

// Common PostgreSQL credential combinations to test
const credentialOptions = [
    'postgresql://postgres:postgres@localhost:5432/postgres',
    'postgresql://postgres:admin@localhost:5432/postgres', 
    'postgresql://postgres:password@localhost:5432/postgres',
    'postgresql://postgres:123456@localhost:5432/postgres',
    'postgresql://postgres:@localhost:5432/postgres', // No password
    'postgresql://postgres:isha@123@localhost:5432/postgres', // Your current one
];

async function testCredentials() {
    console.log('🔍 Testing common PostgreSQL credentials...\n');
    
    for (let i = 0; i < credentialOptions.length; i++) {
        const connString = credentialOptions[i];
        console.log(`${i + 1}. Testing: ${connString}`);
        
        const pool = new Pool({ connectionString: connString });
        
        try {
            const client = await pool.connect();
            console.log('   ✅ SUCCESS! This credential works!');
            
            // Test creating database if it doesn't exist
            try {
                await client.query('CREATE DATABASE nancysgp');
                console.log('   ✅ Created database "nancysgp"');
            } catch (err) {
                if (err.code === '42P04') {
                    console.log('   ℹ️ Database "nancysgp" already exists');
                } else {
                    console.log('   ⚠️ Could not create database:', err.message);
                }
            }
            
            client.release();
            await pool.end();
            
            console.log(`\n🎉 Use this in your .env file:`);
            console.log(`DATABASE_URL=${connString.replace('/postgres', '/nancysgp')}`);
            return;
            
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
        }
        
        await pool.end();
        console.log('');
    }
    
    console.log('❌ None of the common credentials worked.');
    console.log('\n📝 You may need to:');
    console.log('1. Reset PostgreSQL password');
    console.log('2. Check PostgreSQL service is running');
    console.log('3. Use PostgreSQL admin tools to set password');
}

testCredentials();