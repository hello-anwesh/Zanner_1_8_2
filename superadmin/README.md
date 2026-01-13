# Zenner SuperAdmin System
## Complete Administrative Control Platform

---

## 1. EXECUTIVE SUMMARY

### Vision
A secure, powerful administrative dashboard that gives you complete control over Zenner's ecosystem - user management, AI token allocation, monetization, analytics, and system health. 

### Key Capabilities
- **User Management** - Full CRUD, impersonation, support tools
- **Token Economy** - AI credit allocation, usage tracking, limits
- **Monetization** - Subscription tiers, upsells, revenue analytics
- **System Control** - Feature flags, kill switches, maintenance mode
- **Analytics** - User behavior, engagement, retention, revenue
- **Support Tools** - User impersonation, issue resolution, data export

---

## 2. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                     SUPERADMIN DASHBOARD                        │
│                    (Next.js + Tailwind + shadcn/ui)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Users   │ │  Tokens  │ │ Revenue  │ │ Analytics│           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                  │
│  ┌────▼────────────▼────────────▼────────────▼────┐            │
│  │              ADMIN API LAYER                    │            │
│  │           (Express/Fastify + TypeScript)        │            │
│  └────────────────────┬───────────────────────────┘            │
│                       │                                         │
└───────────────────────┼─────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐    ┌─────▼────┐    ┌─────▼────┐
   │ Postgres │    │  Redis   │    │ S3/Blob  │
   │  (Users  │    │ (Cache,  │    │ (Backups │
   │  Tokens) │    │ Sessions)│    │  Exports)│
   └──────────┘    └──────────┘    └──────────┘
```

---

## 3. CORE MODULES

### 3.1 USER MANAGEMENT

```typescript
interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  
  // Account Status
  status: 'active' | 'suspended' | 'pending' | 'banned';
  role: 'free' | 'pro' | 'team' | 'enterprise';
  
  // Timestamps
  createdAt: Date;
  lastActiveAt: Date;
  trialEndsAt?: Date;
  
  // Usage Stats
  totalSessions: number;
  totalFocusMinutes: number;
  aiMessagesUsed: number;
  
  // Billing
  subscriptionId?: string;
  lifetimeValue: number;
  
  // Flags
  flags: {
    betaUser: boolean;
    verified: boolean;
    needsReview: boolean;
  };
}
```

**Features:**
- [ ] User list with advanced filtering (status, plan, activity, revenue)
- [ ] User detail view with full history
- [ ] Bulk actions (suspend, upgrade, email)
- [ ] Impersonation mode (see app as user)
- [ ] Account merge tool (duplicate accounts)
- [ ] Export user data (GDPR compliance)
- [ ] Delete user with cascade (data purge)

---

### 3.2 TOKEN ECONOMY

```typescript
interface TokenAccount {
  userId: string;
  
  // Balances
  aiCredits: number;           // For AI chat/coach
  embeddingCredits: number;    // For RAG/training
  voiceCredits: number;        // For TTS/STT
  
  // Limits
  dailyLimit: number;
  monthlyLimit: number;
  
  // Usage
  usedToday: number;
  usedThisMonth: number;
  
  // History
  transactions: TokenTransaction[];
}

interface TokenTransaction {
  id: string;
  type: 'grant' | 'consume' | 'purchase' | 'refund' | 'expire';
  amount: number;
  balance: number;
  source: string;  // 'subscription', 'purchase', 'admin_grant', 'referral'
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

**Features:**
- [ ] Real-time token dashboard (global usage)
- [ ] Grant/revoke tokens to users
- [ ] Set custom limits per user
- [ ] Token packages configuration
- [ ] Usage alerts and thresholds
- [ ] Cost analysis (AI spend vs revenue)

---

### 3.3 MONETIZATION & BILLING

```typescript
interface Subscription {
  id: string;
  userId: string;
  
  // Plan Details
  plan: 'free' | 'pro_monthly' | 'pro_annual' | 'team' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'paused';
  
  // Billing
  priceId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  
  // Dates
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  
  // Stripe/Paddle IDs
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  
  // Pricing
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  
  // Limits
  aiCreditsPerMonth: number;
  maxDevices: number;
  features: string[];
  
  // Marketing
  highlighted: boolean;
  badge?: string;  // "Popular", "Best Value"
}
```

**Features:**
- [ ] Revenue dashboard (MRR, ARR, churn, LTV)
- [ ] Subscription management (pause, cancel, refund)
- [ ] Plan configuration (pricing, limits, features)
- [ ] Coupon/discount code management
- [ ] Upsell configuration (triggers, offers)
- [ ] Invoice history and export
- [ ] Stripe/Paddle webhook handling

---

### 3.4 ANALYTICS ENGINE

```typescript
interface AnalyticsDashboard {
  // User Metrics
  totalUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  newUsersToday: number;
  churnRate: number;
  
  // Engagement
  avgSessionsPerUser: number;
  avgFocusMinutes: number;
  aiAdoptionRate: number;  // % using AI coach
  
  // Revenue
  mrr: number;
  arr: number;
  avgRevenuePerUser: number;
  conversionRate: number;  // free -> paid
  
  // AI Usage
  totalAiMessages: number;
  avgMessagesPerUser: number;
  topPromptCategories: { category: string; count: number }[];
  
  // Technical
  errorRate: number;
  p95Latency: number;
  activeConnections: number;
}
```

**Features:**
- [ ] Real-time dashboard with key metrics
- [ ] Cohort analysis (retention over time)
- [ ] Funnel visualization (signup → trial → paid)
- [ ] A/B test results and management
- [ ] User journey mapping
- [ ] Export to CSV/PDF for reporting
- [ ] Scheduled reports via email

---

### 3.5 SYSTEM CONTROL

```typescript
interface FeatureFlags {
  // Global Toggles
  maintenanceMode: boolean;
  signupsEnabled: boolean;
  paymentsEnabled: boolean;
  
  // Feature Rollouts
  features: {
    [featureKey: string]: {
      enabled: boolean;
      rolloutPercentage: number;  // 0-100
      targetUserIds?: string[];   // Specific users
      targetPlans?: string[];     // e.g., ['pro', 'enterprise']
    };
  };
  
  // Kill Switches
  killSwitches: {
    aiChat: boolean;
    voiceCommands: boolean;
    spotify: boolean;
    sync: boolean;
  };
  
  // Announcements
  banner?: {
    message: string;
    type: 'info' | 'warning' | 'error';
    dismissable: boolean;
    expiresAt?: Date;
  };
}
```

**Features:**
- [ ] Feature flag management UI
- [ ] Gradual rollout controls
- [ ] Maintenance mode toggle
- [ ] Emergency kill switches
- [ ] In-app announcement system
- [ ] Version management (force update)
- [ ] API rate limiting configuration

---

### 3.6 SUPPORT TOOLS

**Features:**
- [ ] User search (email, ID, name)
- [ ] Impersonation mode (view app as user)
- [ ] Activity timeline (user actions)
- [ ] Support ticket integration
- [ ] Data export (GDPR compliance)
- [ ] Account recovery tools
- [ ] Bug report viewer with context

---

## 4. TECH STACK

### Frontend (Admin Dashboard)
```
├── Framework:      Next.js 14 (App Router)
├── UI Components:  shadcn/ui + Radix
├── Styling:        Tailwind CSS
├── Charts:         Recharts / Tremor
├── Tables:         TanStack Table
├── Forms:          React Hook Form + Zod
├── State:          Zustand / React Query
├── Auth:           NextAuth.js
```

### Backend (Admin API)
```
├── Runtime:        Node.js 20+
├── Framework:      Fastify (or Express)
├── ORM:            Prisma
├── Validation:     Zod
├── Auth:           JWT + RBAC
├── Queue:          BullMQ (for jobs)
├── Cache:          Redis
```

### Database
```
├── Primary:        PostgreSQL (Supabase/Neon)
├── Cache:          Redis (Upstash)
├── Files:          S3/Cloudflare R2
├── Analytics:      PostHog / Mixpanel
├── Payments:       Stripe
```

### Infrastructure
```
├── Hosting:        Vercel (frontend) + Railway/Fly.io (backend)
├── CDN:            Cloudflare
├── Monitoring:     Sentry + Axiom
├── CI/CD:          GitHub Actions
```

---

## 5. DATABASE SCHEMA

### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  password_hash VARCHAR(255),
  
  status VARCHAR(20) DEFAULT 'pending',
  role VARCHAR(20) DEFAULT 'free',
  
  email_verified_at TIMESTAMP,
  last_active_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}'
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  plan VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  canceled_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Token Accounts
CREATE TABLE token_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  ai_credits INTEGER DEFAULT 100,
  embedding_credits INTEGER DEFAULT 50,
  voice_credits INTEGER DEFAULT 25,
  
  daily_limit INTEGER DEFAULT 50,
  monthly_limit INTEGER DEFAULT 1000,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Token Transactions
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(20) NOT NULL,  -- grant, consume, purchase, refund
  amount INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  source VARCHAR(50),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions (aggregated from client)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  mode VARCHAR(20) NOT NULL,
  duration_seconds INTEGER,
  status VARCHAR(20),
  
  device_id VARCHAR(255),
  app_version VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  
  role VARCHAR(20) DEFAULT 'support',  -- support, admin, superadmin
  permissions JSONB DEFAULT '[]',
  
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log
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

-- Feature Flags
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
```

---

## 6. API ENDPOINTS

### Authentication
```
POST   /api/auth/login          - Admin login
POST   /api/auth/logout         - Logout
POST   /api/auth/refresh        - Refresh token
GET    /api/auth/me             - Current admin info
```

### Users
```
GET    /api/users               - List users (paginated, filtered)
GET    /api/users/:id           - Get user details
PATCH  /api/users/:id           - Update user
DELETE /api/users/:id           - Delete user
POST   /api/users/:id/suspend   - Suspend user
POST   /api/users/:id/unsuspend - Unsuspend user
POST   /api/users/:id/impersonate - Get impersonation token
GET    /api/users/:id/sessions  - Get user sessions
GET    /api/users/:id/transactions - Get token transactions
POST   /api/users/:id/tokens/grant - Grant tokens
```

### Subscriptions
```
GET    /api/subscriptions       - List all subscriptions
GET    /api/subscriptions/:id   - Get subscription details
POST   /api/subscriptions/:id/cancel - Cancel subscription
POST   /api/subscriptions/:id/refund - Issue refund
POST   /api/subscriptions/:id/extend - Extend subscription
```

### Tokens
```
GET    /api/tokens/overview     - Global token stats
GET    /api/tokens/usage        - Usage over time
POST   /api/tokens/packages     - Configure token packages
```

### Analytics
```
GET    /api/analytics/overview  - Dashboard metrics
GET    /api/analytics/users     - User analytics
GET    /api/analytics/revenue   - Revenue analytics
GET    /api/analytics/ai-usage  - AI usage analytics
GET    /api/analytics/cohorts   - Cohort analysis
GET    /api/analytics/funnels   - Conversion funnels
```

### System
```
GET    /api/system/health       - Health check
GET    /api/system/flags        - Get feature flags
PATCH  /api/system/flags/:key   - Update feature flag
POST   /api/system/maintenance  - Toggle maintenance mode
POST   /api/system/announcement - Set announcement banner
```

---

## 7. ADMIN DASHBOARD PAGES

```
/                           → Dashboard (overview)
/users                      → User list
/users/[id]                 → User detail
/users/[id]/impersonate     → Impersonation mode
/subscriptions              → Subscription management
/tokens                     → Token economy
/tokens/packages            → Configure packages
/analytics                  → Analytics hub
/analytics/revenue          → Revenue deep dive
/analytics/engagement       → Engagement metrics
/analytics/ai               → AI usage analytics
/system                     → System control
/system/flags               → Feature flags
/system/announcements       → Announcements
/support                    → Support tools
/audit                      → Audit log
/settings                   → Admin settings
```

---

## 8. SECURITY

### Authentication
- [ ] JWT with short expiry (15min) + refresh tokens
- [ ] Role-based access control (RBAC)
- [ ] 2FA mandatory for superadmins
- [ ] IP allowlist for admin access
- [ ] Session management (revoke all sessions)

### Audit
- [ ] All admin actions logged
- [ ] Immutable audit log
- [ ] Alert on sensitive actions
- [ ] Export audit logs

### Data Protection
- [ ] All data encrypted at rest
- [ ] TLS everywhere
- [ ] PII handling compliance
- [ ] Data retention policies
- [ ] GDPR export/delete tools

---

## 9. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema setup
- [ ] Admin auth system
- [ ] Basic API structure
- [ ] Dashboard layout + navigation

### Phase 2: User Management (Week 3-4)
- [ ] User CRUD
- [ ] User search + filtering
- [ ] Bulk actions
- [ ] User detail view

### Phase 3: Token Economy (Week 5-6)
- [ ] Token accounts
- [ ] Grant/revoke UI
- [ ] Transaction history
- [ ] Usage analytics

### Phase 4: Billing (Week 7-8)
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Revenue dashboard
- [ ] Refund handling

### Phase 5: Analytics (Week 9-10)
- [ ] Metrics collection
- [ ] Dashboard widgets
- [ ] Cohort analysis
- [ ] Export functionality

### Phase 6: System Control (Week 11-12)
- [ ] Feature flags UI
- [ ] Kill switches
- [ ] Announcements
- [ ] Audit log viewer

---

## 10. FOLDER STRUCTURE

```
superadmin/
├── README.md                 # This file
├── IMPLEMENTATION_PLAN.md    # Detailed implementation steps
├── apps/
│   ├── dashboard/            # Next.js admin dashboard
│   │   ├── src/
│   │   │   ├── app/          # App router pages
│   │   │   ├── components/   # UI components
│   │   │   ├── lib/          # Utilities
│   │   │   └── hooks/        # React hooks
│   │   ├── package.json
│   │   └── tailwind.config.js
│   │
│   └── api/                  # Backend API
│       ├── src/
│       │   ├── routes/       # API routes
│       │   ├── services/     # Business logic
│       │   ├── middleware/   # Auth, logging
│       │   └── db/           # Prisma + migrations
│       ├── package.json
│       └── prisma/
│           └── schema.prisma
│
├── packages/
│   ├── shared/               # Shared types, utils
│   └── ui/                   # Shared UI components
│
├── docker-compose.yml        # Local dev environment
├── .env.example              # Environment template
└── turbo.json                # Monorepo config
```

---

## 11. GETTING STARTED

```bash
# Clone and setup
cd superadmin
npm install

# Start development
npm run dev

# This starts:
# - Dashboard at http://localhost:3000
# - API at http://localhost:4000
# - PostgreSQL at localhost:5432
# - Redis at localhost:6379
```

---

## 12. NEXT STEPS

1. **Review this plan** - Confirm scope and priorities
2. **Setup infrastructure** - Database, hosting, domains
3. **Bootstrap projects** - Initialize Next.js + API
4. **Implement auth** - Admin login, roles, 2FA
5. **Build incrementally** - Phase by phase

---

*Created: 2024-01-14*
*Author: Zenner Team*
*Version: 1.0*
