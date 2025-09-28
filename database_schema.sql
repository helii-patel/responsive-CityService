-- PostgreSQL Database Schema for CityService Authentication System
-- This schema provides comprehensive user management, authentication, and security features

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('citizen', 'admin', 'moderator', 'service_provider');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
CREATE TYPE auth_provider AS ENUM ('local', 'google', 'facebook', 'apple');
CREATE TYPE session_status AS ENUM ('active', 'expired', 'revoked');

-- Users table - Core user information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255), -- NULL for social auth users
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    role user_role DEFAULT 'citizen',
    status user_status DEFAULT 'pending_verification',
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    address JSONB, -- Flexible address structure
    preferences JSONB DEFAULT '{}', -- User preferences and settings
    metadata JSONB DEFAULT '{}', -- Additional user metadata
    
    -- Verification fields
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified BOOLEAN DEFAULT FALSE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Security fields
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    backup_codes TEXT[], -- Array of backup codes for 2FA
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Social auth providers table
CREATE TABLE user_social_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider auth_provider NOT NULL,
    provider_id VARCHAR(255) NOT NULL, -- Provider's user ID
    provider_email VARCHAR(255),
    provider_data JSONB DEFAULT '{}', -- Store provider-specific data
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider, provider_id)
);

-- User sessions table - Track active sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE, -- Hashed session token
    status session_status DEFAULT 'active',
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    location JSONB DEFAULT '{}', -- Geo location data
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User login history
CREATE TABLE login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login_type VARCHAR(50) NOT NULL, -- 'email', 'social', '2fa', etc.
    success BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    location JSONB DEFAULT '{}',
    failure_reason TEXT, -- If login failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, setting_key)
);

-- User notifications preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    service_updates BOOLEAN DEFAULT TRUE,
    security_alerts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for user actions
CREATE TABLE user_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_activity ON users(last_activity_at);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX idx_social_auth_user_id ON user_social_auth(user_id);
CREATE INDEX idx_social_auth_provider ON user_social_auth(provider, provider_id);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_sessions_status ON user_sessions(status);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX idx_email_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_expires ON email_verification_tokens(expires_at);

CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);

CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_created_at ON login_history(created_at);
CREATE INDEX idx_login_history_success ON login_history(success);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_settings_key ON user_settings(setting_key);

CREATE INDEX idx_notification_prefs_user_id ON notification_preferences(user_id);

CREATE INDEX idx_audit_log_user_id ON user_audit_log(user_id);
CREATE INDEX idx_audit_log_action ON user_audit_log(action);
CREATE INDEX idx_audit_log_created_at ON user_audit_log(created_at);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_auth_updated_at BEFORE UPDATE ON user_social_auth
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_prefs_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Clean up expired email verification tokens
    DELETE FROM email_verification_tokens WHERE expires_at < NOW();
    
    -- Clean up expired password reset tokens
    DELETE FROM password_reset_tokens WHERE expires_at < NOW();
    
    -- Clean up expired sessions
    UPDATE user_sessions SET status = 'expired' WHERE expires_at < NOW() AND status = 'active';
    
    -- Clean up old login history (keep last 6 months)
    DELETE FROM login_history WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Function to hash passwords using bcrypt
CREATE OR REPLACE FUNCTION hash_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(plain_password, gen_salt('bf', 12));
END;
$$ LANGUAGE plpgsql;

-- Function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(plain_password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN password_hash = crypt(plain_password, password_hash);
END;
$$ LANGUAGE plpgsql;

-- Function to generate secure random tokens
CREATE OR REPLACE FUNCTION generate_secure_token(length INTEGER DEFAULT 32)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(length), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create views for common queries
CREATE VIEW active_users AS
SELECT 
    id, email, phone, first_name, last_name, full_name, role, 
    email_verified, phone_verified, created_at, last_login_at, last_activity_at
FROM users 
WHERE status = 'active' AND deleted_at IS NULL;

CREATE VIEW user_sessions_active AS
SELECT 
    s.id, s.user_id, s.ip_address, s.user_agent, s.device_info, 
    s.location, s.expires_at, s.created_at, s.last_used_at,
    u.email, u.first_name, u.last_name
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active' AND s.expires_at > NOW();

-- Create RLS (Row Level Security) policies for multi-tenant security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Sample RLS policies (adjust based on your application needs)
CREATE POLICY users_own_data ON users FOR ALL USING (id = current_setting('app.current_user_id')::uuid);
CREATE POLICY sessions_own_data ON user_sessions FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY settings_own_data ON user_settings FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY notification_prefs_own_data ON notification_preferences FOR ALL USING (user_id = current_setting('app.current_user_id')::uuid);

-- Insert default admin user (remember to change the password in production)
INSERT INTO users (
    email, password_hash, first_name, last_name, role, status, 
    email_verified, email_verified_at
) VALUES (
    'admin@cityservice.com',
    hash_password('AdminPassword123!'),
    'System',
    'Administrator',
    'admin',
    'active',
    true,
    NOW()
);

-- Create a scheduled job to clean up expired tokens (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-tokens', '0 2 * * *', 'SELECT cleanup_expired_tokens();');

COMMENT ON TABLE users IS 'Core user accounts and profile information';
COMMENT ON TABLE user_social_auth IS 'Social authentication provider connections';
COMMENT ON TABLE user_sessions IS 'Active user sessions and authentication tokens';
COMMENT ON TABLE email_verification_tokens IS 'Tokens for email verification process';
COMMENT ON TABLE password_reset_tokens IS 'Tokens for password reset process';
COMMENT ON TABLE login_history IS 'Audit trail of all login attempts';
COMMENT ON TABLE user_settings IS 'User-specific application settings';
COMMENT ON TABLE notification_preferences IS 'User notification preferences';
COMMENT ON TABLE user_audit_log IS 'Comprehensive audit log of user actions';

-- Grant appropriate permissions (adjust based on your application user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;