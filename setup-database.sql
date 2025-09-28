-- POSTGRESQL SETUP SCRIPT
-- Run these commands after connecting to PostgreSQL with: psql -U postgres

-- 1. Create the database for our application
CREATE DATABASE nancysgp;

-- 2. Connect to the new database
\c nancysgp;

-- 3. Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Check if tables were created successfully
\dt

-- 6. Exit
\q