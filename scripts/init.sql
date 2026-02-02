-- Initialize database schema for PatriotChat

-- Drop existing tables (development only)
-- DROP TABLE IF EXISTS audit_logs CASCADE;
-- DROP TABLE IF EXISTS user_activity CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tier VARCHAR(20) NOT NULL DEFAULT 'free',  -- free, power, premium
    status VARCHAR(20) DEFAULT 'active',       -- active, suspended, deleted
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Audit logs table (immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What was changed
    entity_type VARCHAR(50) NOT NULL,          -- users, policies, funding, etc.
    entity_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL,            -- CREATE, READ, UPDATE, DELETE
    
    -- Who made the change
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    service VARCHAR(50) NOT NULL,              -- auth, funding, policy, llm, etc.
    
    -- What changed
    old_values JSONB,                          -- Previous state (NULL for CREATE)
    new_values JSONB,                          -- New state (NULL for DELETE)
    changes JSONB,                             -- Diff only: {field: {old, new}}
    
    -- User-visible version (PII scrubbed)
    scrubbed_changes JSONB,                    -- Safe to show to end user
    
    -- Request context
    correlation_id UUID,                       -- For tracing request path
    ip_address INET,
    user_agent VARCHAR(500),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Prevent updates/deletes on audit_logs
CREATE RULE audit_logs_no_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_logs_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_service ON audit_logs(service, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_operation ON audit_logs(operation, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- User activity table
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- What they did
    action VARCHAR(100) NOT NULL,              -- login, query, search, download
    resource_type VARCHAR(50),                 -- funding, policy, llm, etc.
    resource_id UUID,
    
    -- Context
    status VARCHAR(20),                        -- success, failed, error
    ip_address INET,
    user_agent VARCHAR(500),
    correlation_id UUID,
    
    -- Performance
    duration_ms INTEGER,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Indexes for user_activity
CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_action ON user_activity(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_status ON user_activity(status, created_at DESC);

-- Trigger function for audit logging (placeholder)
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        entity_type,
        entity_id,
        operation,
        user_id,
        service,
        old_values,
        new_values,
        created_at
    ) VALUES (
        TG_TABLE_NAME,
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
        TG_OP,
        current_setting('app.user_id')::UUID,
        current_setting('app.service', true),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('CREATE', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        NOW()
    );
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors (development)
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;

-- Audit triggers on users table
DROP TRIGGER IF EXISTS users_audit ON users;
CREATE TRIGGER users_audit
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Test data (development only)
INSERT INTO users (id, username, email, password_hash, tier, status, email_verified, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'testuser',
    'test@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm',  -- bcrypt("test123")
    'free',
    'active',
    true,
    NOW()
) ON CONFLICT DO NOTHING;

-- Grants for application user (optional)
-- CREATE USER patriotchat WITH PASSWORD 'secure_password';
-- GRANT CONNECT ON DATABASE patriotchat TO patriotchat;
-- GRANT USAGE ON SCHEMA public TO patriotchat;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO patriotchat;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO patriotchat;
