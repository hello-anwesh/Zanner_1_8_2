# ZENNER ECOSYSTEM - MASTER DOCUMENTATION (Part 3)
## Deployment, Communication, Migration, Security & Monetization

---

# 8. DEPLOYMENT ARCHITECTURE

## VPS Setup

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             YOUR 16GB VPS                                    │
│                        (Ubuntu 22.04 LTS)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         NGINX                                          │ │
│  │                    (Reverse Proxy)                                     │ │
│  │                                                                         │ │
│  │   admin.zenner.app    → localhost:3000 (SuperAdmin)                   │ │
│  │   api.zenner.app      → localhost:4000 (AI Gateway)                   │ │
│  │   sync.zenner.app     → localhost:5000 (Sync API) [future]            │ │
│  │                                                                         │ │
│  │   Features:                                                             │ │
│  │   - SSL/TLS (Let's Encrypt)                                            │ │
│  │   - Rate limiting (req/s per IP)                                       │ │
│  │   - Gzip compression                                                   │ │
│  │   - Security headers                                                   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │    PM2          │  │    PM2          │  │    PM2          │             │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │             │
│  │  │SuperAdmin │  │  │  │AI Gateway │  │  │  │Sync API   │  │             │
│  │  │(Next.js)  │  │  │  │(Fastify)  │  │  │  │(Future)   │  │             │
│  │  │Port: 3000 │  │  │  │Port: 4000 │  │  │  │Port: 5000 │  │             │
│  │  │Instances:1│  │  │  │Instances:4│  │  │  │Instances:2│  │             │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                       DATABASES                                        │ │
│  │                                                                         │ │
│  │   ┌────────────────────┐      ┌────────────────────┐                  │ │
│  │   │    PostgreSQL      │      │      Redis         │                  │ │
│  │   │    Port: 5432      │      │    Port: 6379      │                  │ │
│  │   │                    │      │                    │                  │ │
│  │   │  - users           │      │  - rate limits     │                  │ │
│  │   │  - subscriptions   │      │  - session cache   │                  │ │
│  │   │  - tokens          │      │  - key health      │                  │ │
│  │   │  - analytics       │      │                    │                  │ │
│  │   └────────────────────┘      └────────────────────┘                  │ │
│  │                                                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Memory Allocation:                                                          │
│  ├─ PostgreSQL: 2GB                                                         │
│  ├─ Redis: 512MB                                                            │
│  ├─ PM2 Workers: ~4GB (8 workers × 512MB)                                  │
│  ├─ System: 1GB                                                             │
│  └─ Buffer: ~8GB                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure on Server

```
/var/www/zenner/
├── superadmin/                   # Next.js dashboard
│   ├── .next/                    # Build output
│   ├── node_modules/
│   ├── prisma/
│   └── package.json
│
├── api-gateway/                  # Fastify AI proxy
│   ├── dist/                     # Compiled TypeScript
│   ├── node_modules/
│   └── package.json
│
├── sync-api/                     # Future sync service
│
├── shared/
│   ├── prisma/
│   │   └── schema.prisma         # Shared schema
│   └── types/
│
├── scripts/
│   ├── deploy.sh                 # Deployment script
│   ├── backup-db.sh              # Database backup
│   ├── restore-db.sh             # Database restore
│   └── health-check.sh           # Health monitoring
│
├── logs/
│   ├── nginx/
│   ├── pm2/
│   └── app/
│
├── backups/
│   └── postgres/
│
├── ecosystem.config.js           # PM2 configuration
├── docker-compose.yml            # Docker for DBs
└── .env                          # Environment variables
```

## PM2 Configuration

```javascript
// /var/www/zenner/ecosystem.config.js

module.exports = {
  apps: [
    // SuperAdmin Dashboard
    {
      name: 'superadmin',
      cwd: '/var/www/zenner/superadmin',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://...',
      },
      max_memory_restart: '512M',
      error_file: '/var/www/zenner/logs/pm2/superadmin-error.log',
      out_file: '/var/www/zenner/logs/pm2/superadmin-out.log',
    },
    
    // AI Gateway
    {
      name: 'api-gateway',
      cwd: '/var/www/zenner/api-gateway',
      script: 'dist/server.js',
      instances: 4,  // Use 4 CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        DATABASE_URL: 'postgresql://...',
        REDIS_URL: 'redis://localhost:6379',
        OPENAI_KEYS: 'sk-xxx,sk-yyy,sk-zzz',
        ANTHROPIC_KEYS: 'sk-ant-xxx,sk-ant-yyy',
        GEMINI_KEYS: 'xxx,yyy',
      },
      max_memory_restart: '512M',
      error_file: '/var/www/zenner/logs/pm2/gateway-error.log',
      out_file: '/var/www/zenner/logs/pm2/gateway-out.log',
    },
  ],
};
```

## NGINX Configuration

```nginx
# /etc/nginx/sites-available/zenner

# SuperAdmin Dashboard
server {
    listen 443 ssl http2;
    server_name admin.zenner.app;
    
    ssl_certificate /etc/letsencrypt/live/admin.zenner.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.zenner.app/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Rate limiting
    limit_req zone=admin burst=20 nodelay;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# AI Gateway
server {
    listen 443 ssl http2;
    server_name api.zenner.app;
    
    ssl_certificate /etc/letsencrypt/live/api.zenner.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.zenner.app/privkey.pem;
    
    # Rate limiting - stricter for API
    limit_req zone=api burst=100 nodelay;
    
    # Request size limit (for embeddings)
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        
        # Streaming support for AI responses
        proxy_buffering off;
        proxy_read_timeout 300s;
    }
}

# Rate limit zones
limit_req_zone $binary_remote_addr zone=admin:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=60r/s;
```

## Deployment Script

```bash
#!/bin/bash
# /var/www/zenner/scripts/deploy.sh

set -e

echo "🚀 Starting Zenner deployment..."

# Pull latest code
cd /var/www/zenner
git pull origin main

# Build SuperAdmin
echo "📦 Building SuperAdmin..."
cd superadmin
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build

# Build API Gateway
echo "📦 Building API Gateway..."
cd ../api-gateway
npm ci --production=false
npm run build

# Restart services
echo "🔄 Restarting services..."
pm2 reload ecosystem.config.js

# Health check
echo "🏥 Running health checks..."
sleep 5
curl -f http://localhost:3000/api/health || exit 1
curl -f http://localhost:4000/health || exit 1

echo "✅ Deployment complete!"
```

---

# 9. COMMUNICATION PROTOCOL

## Client ↔ Server Communication

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ZENNER COMMUNICATION PROTOCOL                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. ACTIVATION (One-time on install)                                        │
│  ────────────────────────────────────                                        │
│                                                                              │
│  Client                              Server                                  │
│    │                                   │                                     │
│    │──── POST /v1/licenses/activate ──►│                                    │
│    │     {license_key, device_id}      │                                    │
│    │                                   │                                     │
│    │◄─── 200 {user, limits, token} ────│                                    │
│    │                                   │                                     │
│                                                                              │
│  2. AI REQUEST (Every AI call)                                              │
│  ────────────────────────────────                                            │
│                                                                              │
│  Client                              Gateway                    AI Provider  │
│    │                                   │                            │        │
│    │──── POST /v1/chat/completions ───►│                            │        │
│    │     Authorization: Bearer {key}   │                            │        │
│    │     X-Device-Id: {device_id}      │                            │        │
│    │     {messages, model, stream}     │                            │        │
│    │                                   │                            │        │
│    │                                   │──► Validate license        │        │
│    │                                   │──► Check rate limit        │        │
│    │                                   │──► Check credits           │        │
│    │                                   │──► Select API key          │        │
│    │                                   │                            │        │
│    │                                   │──── POST /chat ───────────►│        │
│    │                                   │                            │        │
│    │                                   │◄─── SSE stream ────────────│        │
│    │                                   │                            │        │
│    │◄──── SSE stream (proxied) ────────│                            │        │
│    │                                   │                            │        │
│    │                                   │──► Deduct credits          │        │
│    │                                   │──► Log usage               │        │
│                                                                              │
│  3. HEARTBEAT (Every 24 hours)                                              │
│  ────────────────────────────────                                            │
│                                                                              │
│  Client                              Server                                  │
│    │                                   │                                     │
│    │──── POST /v1/licenses/heartbeat ─►│                                    │
│    │     {device_id, app_version}      │                                    │
│    │                                   │                                     │
│    │◄─── 200 {status, limits, flags} ──│                                    │
│    │                                   │                                     │
│                                                                              │
│  4. SYNC (Future - bidirectional)                                           │
│  ────────────────────────────────                                            │
│                                                                              │
│  Client                              Server                                  │
│    │                                   │                                     │
│    │──── POST /v1/sync/push ──────────►│                                    │
│    │     {sessions, journals, ...}     │                                    │
│    │                                   │                                     │
│    │◄─── 200 {conflicts, merged} ──────│                                    │
│    │                                   │                                     │
│    │──── GET /v1/sync/pull ───────────►│                                    │
│    │     ?since={timestamp}            │                                    │
│    │                                   │                                     │
│    │◄─── 200 {changes} ────────────────│                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## API Response Format

```typescript
// Success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable: "LICENSE_EXPIRED"
    message: string;        // Human-readable: "Your license has expired"
    details?: any;          // Additional context
  };
}

// Example success
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "plan": "pro"
    },
    "limits": {
      "aiCredits": 2000,
      "aiCreditsUsed": 150
    }
  }
}

// Example error
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "details": {
      "retryAfter": 60
    }
  }
}
```

## Error Codes

| Code | HTTP Status | Description | Client Action |
|------|-------------|-------------|---------------|
| `AUTH_REQUIRED` | 401 | No license key provided | Show activation screen |
| `LICENSE_INVALID` | 401 | License key not found | Show activation screen |
| `LICENSE_EXPIRED` | 403 | License expired | Show renewal prompt |
| `LICENSE_SUSPENDED` | 403 | License suspended by admin | Contact support |
| `DEVICE_LIMIT_REACHED` | 403 | Max devices reached | Show device management |
| `RATE_LIMITED` | 429 | Too many requests | Wait and retry |
| `CREDITS_EXHAUSTED` | 402 | No AI credits left | Show upgrade prompt |
| `PROVIDER_ERROR` | 503 | AI provider error | Retry with backoff |
| `MAINTENANCE` | 503 | System maintenance | Show maintenance banner |

---

# 10. MIGRATION & UPDATES

## App Update Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APP UPDATE SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SuperAdmin                         Client                                   │
│      │                                │                                      │
│      │                                │                                      │
│  [Set minimum_version = "1.2.0"]     │                                      │
│      │                                │                                      │
│      └──────────── feature_flags ────►│                                     │
│                    table updated      │                                      │
│                                       │                                      │
│                                       │◄─── Heartbeat response              │
│                                       │     {                               │
│                                       │       "minimum_version": "1.2.0",   │
│                                       │       "latest_version": "1.3.0",    │
│                                       │       "force_update": false         │
│                                       │     }                               │
│                                       │                                      │
│                                       │                                      │
│   If client_version < minimum_version:│                                      │
│                                       │                                      │
│                                       │──► Show update dialog               │
│                                       │    "Please update to continue"      │
│                                       │                                      │
│   If force_update = true:             │                                      │
│                                       │                                      │
│                                       │──► Block app usage                  │
│                                       │    Force update download            │
│                                       │                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Database Migration System

### Client-Side (SQLite)

```typescript
// services/db/MigrationService.ts

interface Migration {
  version: number;
  name: string;
  up: (db: Database) => Promise<void>;
  down?: (db: Database) => Promise<void>;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: async (db) => {
      await db.execute(`
        CREATE TABLE sessions (...);
        CREATE TABLE journal_entries (...);
      `);
    }
  },
  {
    version: 2,
    name: 'add_conversation_tables',
    up: async (db) => {
      await db.execute(`
        CREATE TABLE conversation_messages (...);
        CREATE TABLE conversation_summaries (...);
      `);
    }
  },
  {
    version: 3,
    name: 'add_rag_documents',
    up: async (db) => {
      await db.execute(`
        CREATE TABLE rag_documents (...);
      `);
    }
  },
  // Add new migrations here
];

class MigrationService {
  async getCurrentVersion(): Promise<number> {
    try {
      const result = await db.select(
        'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
      );
      return result[0]?.version || 0;
    } catch {
      return 0;
    }
  }
  
  async migrate(): Promise<MigrationResult> {
    const current = await this.getCurrentVersion();
    const pending = MIGRATIONS.filter(m => m.version > current);
    
    if (pending.length === 0) {
      return { success: true, migrationsRun: 0 };
    }
    
    for (const migration of pending) {
      console.log(`Running migration ${migration.version}: ${migration.name}`);
      
      await db.execute('BEGIN TRANSACTION');
      try {
        await migration.up(db);
        await db.execute(
          'INSERT INTO schema_version (version, name, applied_at) VALUES (?, ?, ?)',
          [migration.version, migration.name, Date.now()]
        );
        await db.execute('COMMIT');
      } catch (error) {
        await db.execute('ROLLBACK');
        throw error;
      }
    }
    
    return { success: true, migrationsRun: pending.length };
  }
}
```

### Server-Side (PostgreSQL)

```bash
# Using Prisma migrations

# Create new migration
npx prisma migrate dev --name add_user_preferences

# Apply migrations in production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

## Feature Flag Rollouts

```typescript
// SuperAdmin: Rolling out a new feature

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;  // 0-100
  targetUserIds: string[];    // Specific users for beta
  targetPlans: string[];      // e.g., ['pro', 'team']
}

// Example: Roll out new AI model
const newModelFlag: FeatureFlag = {
  key: 'gpt4_turbo_enabled',
  enabled: true,
  rolloutPercentage: 10,      // Start with 10% of users
  targetUserIds: ['beta-user-1', 'beta-user-2'],  // Beta testers
  targetPlans: ['pro', 'team']  // Only paid users
};

// Client checks feature flag
function isFeatureEnabled(userId: string, plan: string, flag: FeatureFlag): boolean {
  if (!flag.enabled) return false;
  
  // Check if user is in target list
  if (flag.targetUserIds.includes(userId)) return true;
  
  // Check plan restriction
  if (flag.targetPlans.length > 0 && !flag.targetPlans.includes(plan)) {
    return false;
  }
  
  // Check rollout percentage
  const hash = hashUserId(userId);
  const bucket = hash % 100;
  return bucket < flag.rolloutPercentage;
}
```

---

# 11. SECURITY MODEL

## Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Layer 1: NETWORK                                                            │
│  ─────────────────                                                           │
│  ├─ NGINX rate limiting (req/s per IP)                                      │
│  ├─ SSL/TLS encryption (Let's Encrypt)                                      │
│  ├─ IP allowlist for admin access (optional)                                │
│  └─ DDoS protection (Cloudflare recommended)                                │
│                                                                              │
│  Layer 2: API GATEWAY                                                        │
│  ───────────────────                                                         │
│  ├─ License key validation                                                  │
│  ├─ Device fingerprint verification                                         │
│  ├─ Per-user rate limiting                                                  │
│  ├─ Request size limits                                                     │
│  └─ Input validation (Zod schemas)                                          │
│                                                                              │
│  Layer 3: APPLICATION                                                        │
│  ───────────────────                                                         │
│  ├─ JWT tokens with short expiry (15 min)                                   │
│  ├─ Refresh token rotation                                                  │
│  ├─ RBAC for admin actions                                                  │
│  ├─ Password hashing (bcrypt, cost 12)                                      │
│  └─ SQL injection prevention (Prisma ORM)                                   │
│                                                                              │
│  Layer 4: DATA                                                               │
│  ─────────────                                                               │
│  ├─ Encryption at rest (PostgreSQL)                                         │
│  ├─ Client-side SQLite encryption (optional)                                │
│  ├─ API key encryption in DB                                                │
│  └─ PII handling compliance (GDPR)                                          │
│                                                                              │
│  Layer 5: AUDIT                                                              │
│  ─────────────                                                               │
│  ├─ All admin actions logged                                                │
│  ├─ Immutable audit trail                                                   │
│  ├─ Login attempt tracking                                                  │
│  └─ Alert on suspicious activity                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Admin RBAC

```typescript
enum AdminRole {
  SUPPORT = 'support',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}

const PERMISSIONS: Record<AdminRole, string[]> = {
  support: [
    'users.read',
    'users.impersonate',
    'subscriptions.read',
    'analytics.read',
    'audit.read',
  ],
  admin: [
    ...PERMISSIONS.support,
    'users.update',
    'users.suspend',
    'tokens.grant',
    'subscriptions.cancel',
    'subscriptions.refund',
    'flags.read',
  ],
  superadmin: [
    ...PERMISSIONS.admin,
    'users.delete',
    'users.ban',
    'flags.write',
    'system.maintenance',
    'system.config',
    'admins.manage',
  ],
};

function hasPermission(admin: AdminUser, permission: string): boolean {
  const rolePermissions = PERMISSIONS[admin.role];
  const customPermissions = admin.permissions || [];
  return rolePermissions.includes(permission) || customPermissions.includes(permission);
}
```

## API Key Storage

```typescript
// Store API keys encrypted in database
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY; // 32 bytes
const ALGORITHM = 'aes-256-gcm';

function encryptApiKey(plainKey: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(plainKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptApiKey(encryptedKey: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedKey.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

# 12. MONETIZATION

## Revenue Streams

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONETIZATION MODEL                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  RECURRING REVENUE (MRR)                                                     │
│  ────────────────────────                                                    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Tier        │ Monthly │ Annual  │ AI Credits │ Devices │ Features     ││
│  │──────────────┼─────────┼─────────┼────────────┼─────────┼──────────────││
│  │  Free        │ $0      │ $0      │ 100/month  │ 1       │ Basic        ││
│  │  Pro         │ $10     │ $96     │ 2,000/mo   │ 2       │ + Sync       ││
│  │  Team (5)    │ $40     │ $384    │ 10,000/mo  │ 5       │ + Analytics  ││
│  │  Enterprise  │ Custom  │ Custom  │ Unlimited  │ ∞       │ + Support    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  ONE-TIME PURCHASES                                                          │
│  ────────────────────                                                        │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Token Packs (AI Credits)                                                ││
│  │  ├─ 500 credits:  $5                                                    ││
│  │  ├─ 2,000 credits: $15 (25% bonus)                                      ││
│  │  └─ 10,000 credits: $50 (100% bonus)                                    ││
│  │                                                                          ││
│  │  Lifetime License                                                        ││
│  │  └─ $199 (equivalent to ~2 years Pro)                                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  UPSELL TRIGGERS                                                             │
│  ────────────────                                                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Trigger                          │ Offer                    │ Discount ││
│  │───────────────────────────────────┼──────────────────────────┼──────────││
│  │  80% credits used                 │ Credit pack              │ 10%      ││
│  │  Credits exhausted                │ Upgrade to Pro           │ 20%      ││
│  │  Device limit reached             │ Upgrade tier             │ -        ││
│  │  Trial ending (3 days)            │ Pro subscription         │ 30%      ││
│  │  Feature attempt (locked)         │ Upgrade to unlock        │ 15%      ││
│  │  7-day streak completed           │ Discounted annual        │ 40%      ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Stripe Integration

```typescript
// Webhook handler
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
      
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;
      
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }
  
  res.json({ received: true });
});

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  const subscriptionId = session.subscription as string;
  
  // Create/update subscription
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: session.metadata.plan,
      status: 'active',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(/* calculate from Stripe */),
    },
    update: {
      plan: session.metadata.plan,
      status: 'active',
      stripeSubscriptionId: subscriptionId,
    },
  });
  
  // Grant initial credits
  await creditService.grantCredits(userId, PLAN_CREDITS[session.metadata.plan], 'subscription');
  
  // Generate license key
  const license = await licenseService.createLicense(userId, session.metadata.plan);
  
  // Send welcome email
  await emailService.sendWelcome(userId, license.key);
}
```

---

*[Document continues in Part 4...]*
