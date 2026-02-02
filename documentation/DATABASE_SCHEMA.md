# PatriotChat Database Schema

**Database:** PostgreSQL 16+  
**Last Updated:** February 2, 2026

---

## Overview

All services share a single PostgreSQL database. Schema design emphasizes:
- **Auditability:** Immutable append-only audit logs
- **Data Provenance:** Track who changed what, when, and why
- **Privacy:** Scrubbed data for user visibility
- **Performance:** Proper indexing for query optimization

---

## Core Tables

### 1. Users Table

```sql
CREATE TABLE users (
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
    updated_at TIMESTAMP DEFAULT now(),
    
    -- Indexes
    INDEX idx_users_tier (tier),
    INDEX idx_users_status (status),
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (created_at DESC)
);

-- Audit trigger for users table changes
CREATE TRIGGER users_audit AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('users');
```

### 2. Audit Logs Table (Immutable)

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What was changed
    entity_type VARCHAR(50) NOT NULL,          -- users, policies, funding, etc.
    entity_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL,            -- CREATE, READ, UPDATE, DELETE
    
    -- Who made the change
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    service VARCHAR(50) NOT NULL,              -- auth, funding, policy, llm, etc.
    
    -- What changed (full details)
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
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    
    -- Immutability constraints
    CONSTRAINT audit_logs_immutable CHECK (true),
    
    -- Indexes
    INDEX idx_audit_entity (entity_type, entity_id, created_at DESC),
    INDEX idx_audit_user (user_id, created_at DESC),
    INDEX idx_audit_service (service, created_at DESC),
    INDEX idx_audit_operation (operation, created_at DESC),
    INDEX idx_audit_created (created_at DESC)
);

-- Prevent updates/deletes on audit_logs
CREATE RULE audit_logs_no_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_logs_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- Function to audit changes
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
        changes,
        correlation_id
    ) VALUES (
        TG_TABLE_NAME,
        CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
        TG_OP,
        current_setting('app.user_id')::UUID,
        current_setting('app.service'),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('CREATE', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        CASE WHEN TG_OP = 'UPDATE' THEN jsonb_diff(row_to_json(OLD), row_to_json(NEW)) ELSE NULL END,
        current_setting('app.correlation_id')::UUID
    );
    
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql;
```

### 3. User Activity Table

```sql
CREATE TABLE user_activity (
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
    duration_ms INTEGER,                       -- How long did it take
    
    -- Metadata
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    
    -- Indexes
    INDEX idx_activity_user (user_id, created_at DESC),
    INDEX idx_activity_action (action, created_at DESC),
    INDEX idx_activity_status (status, created_at DESC)
);
```

### 4. Policies Table

```sql
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),                      -- spending, voting, etc.
    data JSONB,                                -- Flexible policy data
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES policies(id),
    
    -- Lifecycle
    status VARCHAR(20) DEFAULT 'active',       -- active, archived, deleted
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now(),
    
    -- Indexes
    INDEX idx_policies_category (category),
    INDEX idx_policies_status (status),
    INDEX idx_policies_version (version)
);

-- Audit trigger
CREATE TRIGGER policies_audit AFTER INSERT OR UPDATE OR DELETE ON policies
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('policies');
```

### 5. Funding Data Table

```sql
CREATE TABLE funding_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source
    source VARCHAR(50) NOT NULL,               -- fec, propublica, opensecrets, etc.
    external_id VARCHAR(255) UNIQUE,           -- ID from external source
    
    -- Data
    data JSONB NOT NULL,                       -- Flexible structure
    entity_name VARCHAR(255),
    entity_type VARCHAR(50),                   -- person, organization, candidate
    
    -- Metadata
    last_fetched TIMESTAMP DEFAULT now(),
    last_updated TIMESTAMP DEFAULT now(),
    created_at TIMESTAMP DEFAULT now(),
    
    -- Indexes
    INDEX idx_funding_source (source),
    INDEX idx_funding_entity (entity_name),
    INDEX idx_funding_type (entity_type),
    INDEX idx_funding_created (created_at DESC),
    INDEX idx_funding_external (external_id)
);

-- Audit trigger
CREATE TRIGGER funding_audit AFTER INSERT OR UPDATE OR DELETE ON funding_data
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('funding_data');
```

### 6. LLM Queries Table

```sql
CREATE TABLE llm_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Query details
    query TEXT NOT NULL,
    model VARCHAR(50) DEFAULT 'mistral',       -- mistral, mistral-variant-2, etc.
    parameters JSONB,                          -- Temperature, top_p, etc.
    
    -- Response
    response TEXT,
    tokens_used INTEGER,
    latency_ms INTEGER,
    
    -- Context
    context_type VARCHAR(50),                  -- funding, policy, etc.
    context_data JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT now(),
    
    -- Indexes
    INDEX idx_llm_user (user_id, created_at DESC),
    INDEX idx_llm_model (model),
    INDEX idx_llm_created (created_at DESC)
);

-- Audit trigger
CREATE TRIGGER llm_queries_audit AFTER INSERT OR UPDATE OR DELETE ON llm_queries
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func('llm_queries');
```

### 7. Analytics Events Table

```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Event details
    event_type VARCHAR(100) NOT NULL,          -- page_view, search, query, etc.
    event_data JSONB,
    
    -- Performance
    page_load_ms INTEGER,
    interaction_time_ms INTEGER,
    
    -- Session
    session_id UUID,
    correlation_id UUID,
    
    -- Device/Browser
    ip_address INET,
    user_agent VARCHAR(500),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT now(),
    
    -- Indexes
    INDEX idx_analytics_type (event_type, created_at DESC),
    INDEX idx_analytics_user (user_id, created_at DESC),
    INDEX idx_analytics_session (session_id),
    INDEX idx_analytics_created (created_at DESC)
);
```

---

## Data Scrubbing Strategy

### What Gets Scrubbed for User Visibility

**Removed (Never shown to users):**
- Personal identifiable information (email, phone, address)
- Internal system fields (password hashes, internal IDs)
- Other users' data
- Admin/system operations

**Kept (Safe to show):**
- Timestamps (when things happened)
- Operation types (created, updated, deleted)
- Non-sensitive fields (status, category, title)
- Aggregated data
- User's own activity only

### Scrubbing Function Example

```sql
CREATE OR REPLACE FUNCTION scrub_for_user(raw_data JSONB) 
RETURNS JSONB AS $$
DECLARE
    scrubbed JSONB;
BEGIN
    -- Remove sensitive fields
    scrubbed := raw_data 
        - 'password_hash'
        - 'email'
        - 'phone'
        - 'address'
        - 'ssn'
        - 'internal_id';
    
    RETURN scrubbed;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## Query Patterns

### Get User's Own Audit Trail (Scrubbed)

```sql
SELECT 
    id,
    operation,
    entity_type,
    entity_id,
    scrubbed_changes as changes,
    created_at
FROM audit_logs
WHERE user_id = $1
  AND created_at > NOW() - INTERVAL '90 days'
ORDER BY created_at DESC
LIMIT 100;
```

### Track What Changed for an Entity

```sql
SELECT 
    id,
    user_id,
    operation,
    old_values,
    new_values,
    created_at
FROM audit_logs
WHERE entity_type = $1
  AND entity_id = $2
ORDER BY created_at ASC;
```

### System Admin: Full Audit Trail (All Sensitive Data)

```sql
SELECT 
    id,
    user_id,
    entity_type,
    entity_id,
    operation,
    changes,
    ip_address,
    created_at
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

---

## Performance Considerations

### Indexes Strategy
- **Fast Lookups:** Index by user, entity, timestamp
- **Sort Operations:** Descending timestamp indexes for "recent first"
- **Joins:** Index foreign keys (user_id, entity_id)
- **Audit Queries:** Composite indexes on (entity_type, created_at)

### Partitioning (Future)
When audit_logs exceeds 1M rows:
```sql
-- Partition by month
CREATE TABLE audit_logs_2026_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

### Archival Strategy
- Keep hot data (< 90 days) in main tables
- Archive older audit logs monthly to cold storage
- Delete user_activity older than 1 year
- Retain audit_logs indefinitely (immutable)

---

## Migration Notes

### Initial Setup

```bash
# Run SQL scripts in order:
1. create_users.sql
2. create_audit_infrastructure.sql
3. create_audit_logs.sql
4. create_user_activity.sql
5. create_domain_tables.sql  # policies, funding, llm, analytics
6. create_indexes.sql
7. create_triggers.sql
```

### Application Setup

```typescript
// Set context before each query
await db.query('SET app.user_id = $1', [userId]);
await db.query('SET app.service = $1', [serviceName]);
await db.query('SET app.correlation_id = $1', [correlationId]);

// Now any INSERT/UPDATE/DELETE will be automatically audited
```

---

## Privacy & Compliance

- **GDPR:** User can request their data (include audit trail)
- **Right to be Forgotten:** Archive user records, keep anonymized audit trail
- **Data Retention:** Define per table (audit forever, activity 1 year, etc.)
- **Access Control:** Only admins can see full audit logs
- **Encryption:** PII encrypted at rest (PostgreSQL pgcrypto)

---

## References

- [PostgreSQL JSON Support](https://www.postgresql.org/docs/current/datatype-json.html)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/plpgsql-trigger.html)
- [GDPR Compliance](https://gdpr.eu/)
- [Data Retention Best Practices](https://www.ibm.com/cloud/learn/data-retention)
