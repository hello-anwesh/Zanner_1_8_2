# ZENNER ECOSYSTEM - MASTER DOCUMENTATION (Part 2)
## API Gateway, Database Schema, Authentication & Licensing

---

# 5. API GATEWAY (AI PROXY)

## Purpose

The AI Gateway serves as a proxy between Zenner clients and AI providers:
- **Centralized API Keys** - Users don't need their own keys
- **Rate Limiting** - Per-user/global limits
- **Cost Control** - Track and limit spending
- **Key Rotation** - Round-robin across multiple keys
- **Fallback** - Automatic failover to backup providers

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AI GATEWAY                                      │
│                           (Fastify + PM2)                                   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        Request Flow                                     │ │
│  │                                                                          │ │
│  │   Client Request                                                         │ │
│  │        │                                                                 │ │
│  │        ▼                                                                 │ │
│  │   ┌─────────────┐                                                        │ │
│  │   │ Auth Check  │ ← Validate license key / user token                   │ │
│  │   └──────┬──────┘                                                        │ │
│  │          │                                                               │ │
│  │          ▼                                                               │ │
│  │   ┌─────────────┐                                                        │ │
│  │   │ Rate Limit  │ ← Check user/global limits (Bottleneck + Redis)      │ │
│  │   └──────┬──────┘                                                        │ │
│  │          │                                                               │ │
│  │          ▼                                                               │ │
│  │   ┌─────────────┐                                                        │ │
│  │   │Credit Check │ ← Verify user has enough AI credits                  │ │
│  │   └──────┬──────┘                                                        │ │
│  │          │                                                               │ │
│  │          ▼                                                               │ │
│  │   ┌─────────────┐                                                        │ │
│  │   │ Key Select  │ ← Round-robin across API keys                         │ │
│  │   └──────┬──────┘                                                        │ │
│  │          │                                                               │ │
│  │          ▼                                                               │ │
│  │   ┌─────────────┐                                                        │ │
│  │   │ Forward     │ → OpenAI / Claude / Gemini                            │ │
│  │   └──────┬──────┘                                                        │ │
│  │          │                                                               │ │
│  │          ▼                                                               │ │
│  │   ┌─────────────┐                                                        │ │
│  │   │ Track Usage │ ← Deduct credits, log transaction                     │ │
│  │   └──────┬──────┘                                                        │ │
│  │          │                                                               │ │
│  │          ▼                                                               │ │
│  │   Return Response (streaming supported)                                  │ │
│  │                                                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
api-gateway/
├── src/
│   ├── server.ts                 # Fastify server setup
│   ├── routes/
│   │   ├── v1/
│   │   │   ├── chat.ts           # POST /v1/chat/completions
│   │   │   ├── embeddings.ts     # POST /v1/embeddings
│   │   │   └── models.ts         # GET /v1/models
│   │   └── health.ts             # GET /health
│   │
│   ├── services/
│   │   ├── key-manager.ts        # API key rotation
│   │   ├── rate-limiter.ts       # Rate limiting logic
│   │   ├── credit-service.ts     # Credit management
│   │   └── usage-tracker.ts      # Usage logging
│   │
│   ├── middleware/
│   │   ├── auth.ts               # License/token validation
│   │   └── error-handler.ts      # Error handling
│   │
│   ├── providers/
│   │   ├── openai.ts             # OpenAI adapter
│   │   ├── anthropic.ts          # Claude adapter
│   │   └── gemini.ts             # Gemini adapter
│   │
│   ├── lib/
│   │   ├── prisma.ts             # Database client
│   │   ├── redis.ts              # Redis client (optional)
│   │   └── logger.ts             # Logging
│   │
│   └── types/
│       └── index.ts              # Type definitions
│
├── prisma/
│   └── schema.prisma             # Shared with SuperAdmin
│
├── ecosystem.config.js           # PM2 config
├── package.json
└── tsconfig.json
```

## Key Components

### key-manager.ts

```typescript
/**
 * Manages multiple API keys per provider with:
 * - Round-robin selection
 * - Per-key rate tracking
 * - Automatic backoff on errors
 */

interface APIKey {
  id: string;
  provider: 'openai' | 'anthropic' | 'gemini';
  key: string;
  requestsThisMinute: number;
  requestsToday: number;
  lastUsed: Date;
  isHealthy: boolean;
  cooldownUntil?: Date;
}

class KeyManager {
  private keys: Map<string, APIKey[]> = new Map();
  
  /**
   * Get next available key for provider
   * Uses round-robin with health checks
   */
  getNextKey(provider: string): APIKey | null {
    const providerKeys = this.keys.get(provider) || [];
    const healthy = providerKeys.filter(k => 
      k.isHealthy && 
      (!k.cooldownUntil || k.cooldownUntil < new Date())
    );
    
    if (healthy.length === 0) return null;
    
    // Round-robin: pick least recently used
    healthy.sort((a, b) => a.lastUsed.getTime() - b.lastUsed.getTime());
    return healthy[0];
  }
  
  /**
   * Mark key as used
   */
  markUsed(keyId: string): void {
    // Update lastUsed, increment counters
  }
  
  /**
   * Mark key as errored (rate limited)
   */
  markError(keyId: string, retryAfterMs: number): void {
    // Set cooldownUntil
  }
}
```

### rate-limiter.ts

```typescript
/**
 * Rate limiting using Bottleneck
 * Supports per-user and global limits
 */

import Bottleneck from 'bottleneck';

interface RateLimitConfig {
  maxConcurrent: number;       // Max simultaneous requests
  minTime: number;             // Min ms between requests
  reservoir: number;           // Requests per interval
  reservoirRefreshInterval: number;
}

const userLimiters = new Map<string, Bottleneck>();

function getUserLimiter(userId: string, tier: 'free' | 'pro' | 'team'): Bottleneck {
  const key = `${userId}:${tier}`;
  
  if (!userLimiters.has(key)) {
    const config = TIER_LIMITS[tier];
    userLimiters.set(key, new Bottleneck({
      maxConcurrent: config.maxConcurrent,
      minTime: config.minTime,
      reservoir: config.requestsPerMinute,
      reservoirRefreshAmount: config.requestsPerMinute,
      reservoirRefreshInterval: 60 * 1000
    }));
  }
  
  return userLimiters.get(key)!;
}

const TIER_LIMITS = {
  free: {
    maxConcurrent: 1,
    minTime: 1000,            // 1 request per second
    requestsPerMinute: 10
  },
  pro: {
    maxConcurrent: 3,
    minTime: 200,
    requestsPerMinute: 60
  },
  team: {
    maxConcurrent: 5,
    minTime: 100,
    requestsPerMinute: 120
  }
};
```

### credit-service.ts

```typescript
/**
 * Manages token credits for users
 */

class CreditService {
  /**
   * Check if user has enough credits
   */
  async hasCredits(userId: string, estimatedTokens: number): Promise<boolean> {
    const account = await prisma.tokenAccount.findUnique({
      where: { userId }
    });
    
    if (!account) return false;
    return account.aiCredits >= estimatedTokens;
  }
  
  /**
   * Deduct credits after successful request
   */
  async deductCredits(userId: string, tokensUsed: number): Promise<void> {
    await prisma.$transaction([
      prisma.tokenAccount.update({
        where: { userId },
        data: { aiCredits: { decrement: tokensUsed } }
      }),
      prisma.tokenTransaction.create({
        data: {
          userId,
          type: 'CONSUME',
          amount: -tokensUsed,
          balance: 0,  // Will be updated
          source: 'ai_chat'
        }
      })
    ]);
  }
  
  /**
   * Grant credits (from subscription, purchase, admin)
   */
  async grantCredits(
    userId: string, 
    amount: number, 
    source: string
  ): Promise<void> {
    // ...
  }
}
```

## API Endpoints

### POST /v1/chat/completions

**Purpose:** Proxy to OpenAI-compatible chat API

**Request:**
```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": true
}
```

**Headers:**
```
Authorization: Bearer <license_key>
X-User-Id: <user_id>
```

**Response:** OpenAI-compatible streaming response

### POST /v1/embeddings

**Purpose:** Generate embeddings for RAG

**Request:**
```json
{
  "model": "text-embedding-3-small",
  "input": "Hello world"
}
```

### GET /v1/models

**Purpose:** List available models

**Response:**
```json
{
  "data": [
    {"id": "gpt-4", "provider": "openai"},
    {"id": "claude-3-sonnet", "provider": "anthropic"},
    {"id": "gemini-pro", "provider": "gemini"}
  ]
}
```

---

# 6. DATABASE ARCHITECTURE

## Two Databases

| Database | Location | Purpose |
|----------|----------|---------|
| **SQLite** | User's device | Local app data |
| **PostgreSQL** | Your VPS | Central user/billing/analytics |

## SQLite Schema (Client)

```sql
-- ═══════════════════════════════════════════════════════════════════
-- TIMER & PRODUCTIVITY
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time TEXT NOT NULL,           -- ISO timestamp
    end_time TEXT,                       -- NULL if in progress
    mode TEXT NOT NULL,                  -- 'focus', 'short_break', 'long_break'
    duration_minutes INTEGER NOT NULL,
    actual_duration_seconds INTEGER,
    status TEXT NOT NULL,                -- 'COMPLETED', 'ABANDONED', 'IN_PROGRESS'
    notes TEXT
);

-- ═══════════════════════════════════════════════════════════════════
-- JOURNAL
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,           -- YYYY-MM-DD
    content TEXT NOT NULL,
    mood TEXT,
    tags TEXT,                           -- JSON array
    created_at INTEGER NOT NULL,         -- Epoch ms
    updated_at INTEGER NOT NULL
);

-- ═══════════════════════════════════════════════════════════════════
-- AI TRAINING
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE training_profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    profile_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

-- ═══════════════════════════════════════════════════════════════════
-- CONVERSATIONS (Zeni Chat)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE conversation_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,                  -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL
);

CREATE TABLE conversation_summaries (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    title TEXT,
    summary TEXT,
    message_count INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
);

-- ═══════════════════════════════════════════════════════════════════
-- RAG DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE rag_documents (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    embedding TEXT,                      -- JSON array of floats
    metadata TEXT,
    created_at INTEGER NOT NULL
);

-- ═══════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════

CREATE INDEX idx_sessions_date ON sessions(start_time);
CREATE INDEX idx_journal_date ON journal_entries(date);
CREATE INDEX idx_messages_session ON conversation_messages(session_id);
```

## PostgreSQL Schema (Server)

```sql
-- ═══════════════════════════════════════════════════════════════════
-- USERS & AUTH
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    password_hash VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- pending, active, suspended, banned
    email_verified_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP,
    
    -- Settings
    metadata JSONB DEFAULT '{}'
);

-- ═══════════════════════════════════════════════════════════════════
-- LICENSES & DEVICES
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    license_key VARCHAR(64) UNIQUE NOT NULL,  -- ZENNER-XXXX-XXXX-XXXX
    
    -- Limits
    max_devices INTEGER DEFAULT 2,
    current_devices INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active',  -- active, suspended, expired
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE device_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
    
    device_id VARCHAR(255) NOT NULL,       -- Hardware fingerprint
    device_name VARCHAR(255),              -- "MacBook Pro"
    os VARCHAR(50),                        -- "macos", "windows", "linux"
    app_version VARCHAR(20),
    
    last_seen_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(license_id, device_id)
);

-- ═══════════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS & BILLING
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Plan info
    plan VARCHAR(50) NOT NULL,             -- free, pro_monthly, pro_annual, team
    status VARCHAR(20) NOT NULL,           -- active, past_due, canceled, paused
    
    -- Stripe
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    
    -- Billing cycle
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    canceled_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    
    stripe_invoice_id VARCHAR(255),
    amount INTEGER NOT NULL,               -- Cents
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(20),                    -- paid, open, void
    
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- TOKEN ECONOMY
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE token_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Balances
    ai_credits INTEGER DEFAULT 100,
    embedding_credits INTEGER DEFAULT 50,
    voice_credits INTEGER DEFAULT 25,
    
    -- Limits
    daily_limit INTEGER DEFAULT 50,
    monthly_limit INTEGER DEFAULT 1000,
    
    -- Usage tracking (reset daily/monthly)
    used_today INTEGER DEFAULT 0,
    used_this_month INTEGER DEFAULT 0,
    last_reset_daily DATE,
    last_reset_monthly DATE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(20) NOT NULL,             -- grant, consume, purchase, refund, expire
    amount INTEGER NOT NULL,
    balance INTEGER NOT NULL,              -- Balance after transaction
    source VARCHAR(50),                    -- subscription, purchase, admin_grant, ai_chat
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- ANALYTICS (AGGREGATED)
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE user_stats_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Session stats
    sessions_completed INTEGER DEFAULT 0,
    focus_minutes INTEGER DEFAULT 0,
    
    -- AI usage
    ai_messages INTEGER DEFAULT 0,
    ai_tokens_used INTEGER DEFAULT 0,
    
    -- Engagement
    app_opens INTEGER DEFAULT 0,
    
    UNIQUE(user_id, date)
);

CREATE TABLE global_stats_daily (
    date DATE PRIMARY KEY,
    
    -- User counts
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    
    -- Revenue
    mrr INTEGER DEFAULT 0,
    new_subscriptions INTEGER DEFAULT 0,
    churned_subscriptions INTEGER DEFAULT 0,
    
    -- Usage
    total_sessions INTEGER DEFAULT 0,
    total_ai_requests INTEGER DEFAULT 0,
    total_ai_tokens INTEGER DEFAULT 0
);

-- ═══════════════════════════════════════════════════════════════════
-- ADMIN & SYSTEM
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    
    role VARCHAR(20) DEFAULT 'support',    -- support, admin, superadmin
    permissions JSONB DEFAULT '[]',
    
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id),
    
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    
    old_value JSONB,
    new_value JSONB,
    
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    
    enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0,
    
    target_user_ids UUID[] DEFAULT '{}',
    target_plans VARCHAR(50)[] DEFAULT '{}',
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_licenses_key ON licenses(license_key);
CREATE INDEX idx_licenses_user ON licenses(user_id);
CREATE INDEX idx_device_license ON device_activations(license_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_tokens_user ON token_accounts(user_id);
CREATE INDEX idx_transactions_user ON token_transactions(user_id);
CREATE INDEX idx_transactions_date ON token_transactions(created_at);
CREATE INDEX idx_stats_user_date ON user_stats_daily(user_id, date);
CREATE INDEX idx_audit_date ON audit_log(created_at);
```

---

# 7. AUTHENTICATION & LICENSING

## Licensing Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LICENSING FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. USER PURCHASES                                                          │
│      │                                                                       │
│      ▼                                                                       │
│   Stripe Checkout → Webhook → Create License                                │
│                                    │                                         │
│                                    ▼                                         │
│                         ┌─────────────────────┐                             │
│                         │  License Record     │                             │
│                         │  ZENNER-XXXX-XXXX   │                             │
│                         │  max_devices: 2     │                             │
│                         │  status: active     │                             │
│                         └─────────────────────┘                             │
│                                    │                                         │
│   2. USER ACTIVATES                │                                         │
│      │                             │                                         │
│      ▼                             ▼                                         │
│   Enter license key → Validate → Create Device Activation                   │
│                                    │                                         │
│                                    ▼                                         │
│                         ┌─────────────────────┐                             │
│                         │ Device Activation   │                             │
│                         │ device_id: abc123   │                             │
│                         │ device_name: MBP    │                             │
│                         └─────────────────────┘                             │
│                                    │                                         │
│   3. USER USES APP                 │                                         │
│      │                             │                                         │
│      ▼                             ▼                                         │
│   AI Request → Include license_key + device_id                              │
│      │                                                                       │
│      ▼                                                                       │
│   Gateway validates → Rate limit → Forward → Track usage                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## License Key Format

```
ZENNER-XXXX-XXXX-XXXX-XXXX

Example: ZENNER-7K3M-9P2Q-5N8R-1J4T

Format: [PREFIX]-[4 alphanumeric]-[4]-[4]-[4]
Total: 28 characters
```

## License Tiers

| Tier | Devices | AI Credits/Month | Cloud Sync | Price |
|------|---------|------------------|------------|-------|
| **Free** | 1 | 100 | ❌ | $0 |
| **Pro** | 2 | 2,000 | ✅ | $10/mo |
| **Team** | 5 | 10,000 | ✅ | $40/mo |
| **Enterprise** | Unlimited | Unlimited | ✅ | Custom |

## Device Fingerprinting

```typescript
/**
 * Generate unique device fingerprint
 * Combines hardware identifiers
 */
async function generateDeviceId(): Promise<string> {
  const info = await invoke('get_system_info');
  
  const components = [
    info.os,
    info.osVersion,
    info.hostname,
    info.machineId,  // From OS
  ];
  
  // Hash for privacy
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(components.join('|'))
  );
  
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}
```

## Activation Flow

```typescript
// Client-side activation
async function activateLicense(licenseKey: string): Promise<ActivationResult> {
  const deviceId = await generateDeviceId();
  const deviceName = await invoke('get_device_name');
  
  const response = await fetch(`${API_URL}/v1/licenses/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      license_key: licenseKey,
      device_id: deviceId,
      device_name: deviceName,
      os: 'macos',  // From Tauri
      app_version: '1.0.0'
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new ActivationError(error.message, error.code);
  }
  
  const result = await response.json();
  
  // Store locally
  localStorage.setItem('zenner_license_key', licenseKey);
  localStorage.setItem('zenner_device_id', deviceId);
  localStorage.setItem('zenner_activation', JSON.stringify(result));
  
  return result;
}
```

## Heartbeat System

```typescript
/**
 * Periodic check-in to validate license
 * Runs every 24 hours or on app start
 */
async function heartbeat(): Promise<void> {
  const licenseKey = localStorage.getItem('zenner_license_key');
  const deviceId = localStorage.getItem('zenner_device_id');
  
  if (!licenseKey || !deviceId) return;
  
  try {
    const response = await fetch(`${API_URL}/v1/licenses/heartbeat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${licenseKey}`
      },
      body: JSON.stringify({
        device_id: deviceId,
        app_version: '1.0.0'
      })
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // License revoked or expired
        handleLicenseInvalid();
      }
    }
    
    const result = await response.json();
    
    // Update local state
    updateLicenseStatus(result);
    
  } catch (error) {
    // Offline - use cached status
    console.warn('Heartbeat failed, using cached license status');
  }
}
```

---

*[Document continues in Part 3...]*
