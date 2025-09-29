import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve('../.env') });

const { Pool } = pkg;

// Test database connection
async function testConnection() {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const client = await pool.connect();
        console.log('✅ Successfully connected to PostgreSQL database!');
        
        // Test a simple query
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Query test successful. Current time:', result.rows[0].current_time);
        
        client.release();
        await pool.end();
        
        console.log('\n🎉 Database connection is working properly!');
        console.log('You can now start the backend server with: npm start');
        
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('Error:', error.message);
        
        console.log('\n🔧 Please check the following:');
        console.log('1. PostgreSQL server is running');
        console.log('2. Database "nancysgp" exists');
        console.log('3. Username "postgres" exists');
        console.log('4. Password is correct');
        console.log('5. Host and port are correct (localhost:5432)');
        
        console.log('\n📝 Current DATABASE_URL:', process.env.DATABASE_URL);
        console.log('You can update the DATABASE_URL in the .env file if needed.');
        
        process.exit(1);
    }
}

testConnection();