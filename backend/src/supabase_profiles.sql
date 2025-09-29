-- supabase_profiles.sql
-- Table for storing profile data for Supabase OAuth users

CREATE TABLE IF NOT EXISTS supabase_user_profiles (
    id VARCHAR(255) PRIMARY KEY, -- Supabase user UUID
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    city VARCHAR(100),
    profession VARCHAR(100),
    company VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_supabase_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS update_supabase_profiles_updated_at ON supabase_user_profiles;
CREATE TRIGGER update_supabase_profiles_updated_at 
    BEFORE UPDATE ON supabase_user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_supabase_profiles_updated_at();