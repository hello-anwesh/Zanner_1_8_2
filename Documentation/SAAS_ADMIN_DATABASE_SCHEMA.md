# Zenner SaaS Admin - Complete Database Schema

**Document Version:** 1.0  
**Created:** January 2026  
**Purpose:** Complete database schema for SaaS backend

---

## 🗄️ Database Overview

### Technology Recommendation
**PostgreSQL 15+** (for production) or **MongoDB** (if preferring NoSQL)

**Why PostgreSQL?**
- ACID compliance
- Complex queries for analytics
- JSON support for flexible fields
- Mature ecosystem
- Excellent for time-series data (sessions, analytics)

---

## 📊 Complete Schema

### Core Tables

#### 1. **users** - User accounts
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    
    -- Subscription
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK(subscription_tier IN ('free', 'premium', 'pro')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK(subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
    subscription_started_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    settings JSONB DEFAULT '{}',  -- User preferences
    metadata JSONB DEFAULT '{}'   -- Additional data (device info, etc.)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_last_login ON users(last_login_at DESC);
```

#### 2. **sessions** - Pomodoro session records
```sql
CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session details
    mode VARCHAR(20) NOT NULL CHECK(mode IN ('focus', 'shortBreak', 'longBreak')),
    duration_minutes INTEGER NOT NULL,
   actual_duration_seconds INTEGER,
    status VARCHAR(20) NOT NULL CHECK(status IN ('COMPLETED', 'ABANDONED', 'IN_PROGRESS')),
    
    -- Timing
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    
    -- Content
    notes TEXT,
    tags JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ,  -- When synced from desktop app
    
    -- Device info
    device_id VARCHAR(255),  -- Desktop app installation ID
    app_version VARCHAR(50)
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_start_time ON sessions(start_time DESC);
CREATE INDEX idx_sessions_mode ON sessions(mode);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_synced ON sessions(synced_at);
```

#### 3. **conversations** - AI chat conversations
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Conversation details
    title VARCHAR(500),
    mode VARCHAR(20) DEFAULT 'productivity' CHECK(mode IN ('productivity', 'venting', 'strategy', 'general')),
    
    -- Stats
    message_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_mode ON conversations(mode);
```

#### 4. **messages** - Chat messages
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Message content
    role VARCHAR(20) NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- AI metadata
    model VARCHAR(100),  -- e.g., "gemini-pro", "gpt-4"
    tokens_used INTEGER,
    response_time_ms INTEGER,
    
    -- Timestamps
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX idx_messages_role ON messages(role);
```

#### 5. **memory_items** - AI memory (facts, preferences, goals)
```sql
CREATE TABLE memory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Memory content
    category VARCHAR(50) NOT NULL CHECK(category IN ('fact', 'preference', 'goal', 'constraint')),
    content TEXT NOT NULL,
    
    -- Vector embedding for similarity search
    embedding VECTOR(1536),  -- pgvector extension
    
    -- Source tracking
    source_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    source_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    
    -- Usage tracking
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);

CREATE INDEX idx_memory_user ON memory_items(user_id);
CREATE INDEX idx_memory_category ON memory_items(category);
CREATE INDEX idx_memory_embedding ON memory_items USING ivfflat (embedding vector_cosine_ops);
```

#### 6. **experiences** - User experiences/learnings
```sql
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Experience content
    summary TEXT NOT NULL,
    sentiment VARCHAR(20) CHECK(sentiment IN ('positive', 'neutral', 'negative')),
    key_learnings JSONB DEFAULT '[]',  -- Array of learning strings
    
    -- Context
    related_session_id BIGINT REFERENCES sessions(id) ON DELETE SET NULL,
    tags JSONB DEFAULT '[]',
    
    -- Timestamps
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);

CREATE INDEX idx_experiences_user ON experiences(user_id);
CREATE INDEX idx_experiences_timestamp ON experiences(timestamp DESC);
CREATE INDEX idx_experiences_sentiment ON experiences(sentiment);
```

#### 7. **rules** - User-defined AI behavior rules
```sql
CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Rule content
    rule TEXT NOT NULL,
    trigger_context VARCHAR(100) DEFAULT 'general',
    priority INTEGER DEFAULT 0,  -- Higher = more important
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Usage tracking
    times_triggered INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ
);

CREATE INDEX idx_rules_user_active ON rules(user_id, is_active);
CREATE INDEX idx_rules_priority ON rules(priority DESC);
```

#### 8. **journal_entries** - Daily journal entries
```sql
CREATE TABLE journal_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Entry content
    date DATE NOT NULL,
    content TEXT NOT NULL,
    mood VARCHAR(50),
    tags JSONB DEFAULT '[]',
    
    -- Word count for analytics
    word_count INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ,
    
    UNIQUE(user_id, date)
);

CREATE INDEX idx_journal_user_date ON journal_entries(user_id, date DESC);
CREATE INDEX idx_journal_mood ON journal_entries(mood);
```

---

### Analytics Tables

#### 9. **daily_stats** - Pre-aggregated daily statistics
```sql
CREATE TABLE daily_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Session stats
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    abandoned_sessions INTEGER DEFAULT 0,
    total_focus_minutes INTEGER DEFAULT 0,
    
    -- AI stats
    conversations_started INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    
    -- Memory stats
    memory_items_added INTEGER DEFAULT 0,
    retrieval_count INTEGER DEFAULT 0,
    
    -- Journal stats
    journal_entry_created BOOLEAN DEFAULT FALSE,
    journal_word_count INTEGER DEFAULT 0,
    
    -- Computed at end of day
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date DESC);
CREATE INDEX idx_daily_stats_date ON daily_stats(date DESC);
```

#### 10. **weekly_stats** - Pre-aggregated weekly statistics
```sql
CREATE TABLE weekly_stats (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,  -- Monday of the week
    
    -- Aggregates from daily_stats
    total_sessions INTEGER DEFAULT 0,
    total_focus_minutes INTEGER DEFAULT 0,
    avg_completion_rate DECIMAL(5,2),
    streak_days INTEGER DEFAULT 0,
    
    -- Growth metrics
    sessions_vs_prev_week INTEGER,  -- +/- change
    focus_time_vs_prev_week INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, week_start)
);

CREATE INDEX idx_weekly_stats_user_week ON weekly_stats(user_id, week_start DESC);
```

---

### System Tables

#### 11. **admin_users** - Admin dashboard users
```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    
    -- Admin role
    role VARCHAR(50) NOT NULL CHECK(role IN ('super_admin', 'support', 'analyst')),
    
    -- MFA
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
```

#### 12. **audit_logs** - Admin action audit trail
```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES admin_users(id),
    
    -- Action details
    action VARCHAR(100) NOT NULL,  -- e.g., "user_suspended", "data_exported"
    resource_type VARCHAR(50),     -- e.g., "user", "session"
    resource_id VARCHAR(255),
    
    -- Details
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_admin ON audit_logs(admin_user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

#### 13. **system_health** - System health metrics
```sql
CREATE TABLE system_health (
    id BIGSERIAL PRIMARY KEY,
    
    -- Metrics
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_unit VARCHAR(50),
    
    -- Context
    component VARCHAR(100),  -- e.g., "api", "database", "ai_service"
    tags JSONB DEFAULT '{}',
    
    -- Timestamp
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_metric ON system_health(metric_name);
CREATE INDEX idx_health_component ON system_health(component);
CREATE INDEX idx_health_timestamp ON system_health(timestamp DESC);
```

#### 14. **api_keys** - User API keys (OpenAI, Spotify, etc.)
```sql
CREATE TABLE api_keys (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- API key details
    service VARCHAR(50) NOT NULL,  -- 'openai', 'spotify', 'youtube'
    key_encrypted TEXT NOT NULL,  -- Encrypted at rest
    
    -- Status
    is_valid BOOLEAN DEFAULT TRUE,
    last_validated_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, service)
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_service ON api_keys(service);
```

---

## 🔄 Data Sync Strategy

### From Desktop App to SaaS Backend

**Sync Endpoint:** `POST /api/v1/sync`

**Request Payload:**
```json
{
  "user_id": "uuid",
  "device_id": "mac-123abc",
  "last_sync_at": "2026-01-18T00:00:00Z",
  "data": {
    "sessions": [...],
    "conversations": [...],
    "messages": [...],
    "memory_items": [...],
    "experiences": [...],
    "rules": [...],
    "journal_entries": [...]
  }
}
```

**Sync Logic:**
1. Upsert records based on ID and `synced_at` timestamp
2. Conflict resolution: Server wins (most recent `updated_at`)
3. Return synced data back to desktop app

---

## 📊 Key Queries for Admin Dashboard

### User Analytics
```sql
-- Total users by tier
SELECT subscription_tier, COUNT(*) 
FROM users 
WHERE deleted_at IS NULL 
GROUP BY subscription_tier;

-- Active users (last 30 days)
SELECT COUNT(*) 
FROM users 
WHERE last_login_at > NOW() - INTERVAL '30 days' 
  AND deleted_at IS NULL;

-- User growth (signups per day - last 30 days)
SELECT DATE(created_at) as date, COUNT(*) as signups
FROM users
WHERE created_at > NOW() - INTERVAL '30 days'
  AND deleted_at IS NULL
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Session Analytics
```sql
-- Total sessions across all users
SELECT COUNT(*) FROM sessions;

-- Sessions by status
SELECT status, COUNT(*) 
FROM sessions 
GROUP BY status;

-- Avg focus time per user (last 7 days)
SELECT 
    user_id,
    SUM(actual_duration_seconds) / 60 as total_minutes
FROM sessions
WHERE start_time > NOW() - INTERVAL '7 days'
  AND status = 'COMPLETED'
  AND mode = 'focus'
GROUP BY user_id
ORDER BY total_minutes DESC;
```

### AI Usage
```sql
-- Total tokens used (all users, all time)
SELECT SUM(total_tokens) FROM conversations;

-- Tokens used per user (last 30 days)
SELECT 
    c.user_id,
    SUM(m.tokens_used) as total_tokens
FROM messages m
JOIN conversations c ON c.id = m.conversation_id
WHERE m.timestamp > NOW() - INTERVAL '30 days'
GROUP BY c.user_id
ORDER BY total_tokens DESC;
```

---

## 🔐 Data Privacy & Compliance

### GDPR Requirements

**Right to Access:**
```sql
-- Export all user data
SELECT * FROM users WHERE email = 'user@example.com';
-- + all related sessions, conversations, messages, etc.
```

**Right to Deletion:**
```sql
-- Soft delete user
UPDATE users 
SET deleted_at = NOW(), 
    email = CONCAT('deleted_', id, '@deleted.com'),
    is_active = FALSE
WHERE id = 'user-uuid';

-- Hard delete (after retention period)
DELETE FROM users WHERE id = 'user-uuid';
-- Cascades to all related tables
```

**Data Encryption:**
- API keys encrypted at rest (AES-256)
- Passwords hashed (bcrypt)
- Sensitive fields encrypted in JSONB

---

## 📈 Database Performance

### Recommended Indexes (Already in schema above)
- All foreign keys indexed
- Timestamps indexed (DESC for recent-first queries)
- Email unique indexes
- Composite indexes for common query patterns

### Partitioning Strategy (for scale)
```sql
-- Partition sessions by month (after hitting 10M+ records)
CREATE TABLE sessions_2026_01 PARTITION OF sessions
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

---

## 🚀 Migrations

Use a migration tool like **Prisma**, **TypeORM**, or **Alembic**.

### Initial Migration
```bash
# Create all tables
npm run migrate:up initial_schema

# Seed admin user
npm run seed:admin
```

---

**Next Document:** `SAAS_ADMIN_API_SPECIFICATION.md` - All API endpoints you need to build.
