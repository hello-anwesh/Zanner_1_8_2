# ZENNER ECOSYSTEM - MASTER DOCUMENTATION
## The Complete Blueprint for Zenner Client + SuperAdmin System

---

> **Document Version:** 2.0  
> **Created:** 2026-01-14  
> **Author:** Zenner Team  
> **Purpose:** Complete reference for any developer to understand, build, and extend the entire Zenner ecosystem

---

## TABLE OF CONTENTS

1. [Vision & Philosophy](#1-vision--philosophy)
2. [System Overview](#2-system-overview)
3. [Client App (Zenner Desktop)](#3-client-app-zenner-desktop)
4. [SuperAdmin System](#4-superadmin-system)
5. [API Gateway (AI Proxy)](#5-api-gateway-ai-proxy)
6. [Database Architecture](#6-database-architecture)
7. [Authentication & Licensing](#7-authentication--licensing)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Communication Protocol](#9-communication-protocol)
10. [Migration & Updates](#10-migration--updates)
11. [Security Model](#11-security-model)
12. [Monetization](#12-monetization)
13. [File-by-File Reference](#13-file-by-file-reference)
14. [Development Workflow](#14-development-workflow)
15. [Future Roadmap](#15-future-roadmap)

---

# 1. VISION & PHILOSOPHY

## What is Zenner?

Zenner is an **AI-powered productivity companion** that helps users focus, reflect, and grow. Unlike generic timer apps:

- **Zeni** - An AI coach with memory who knows you
- **Journal** - AI-enhanced daily reflection
- **Focus Sessions** - Intelligent Pomodoro with binaural beats
- **Analytics** - Deep insights into work patterns

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Local-First** | All user data stored locally in SQLite |
| **Privacy-Centric** | AI runs through user's own API keys OR our proxy |
| **Premium Feel** | Dark theme, glass effects, micro-animations |
| **Intelligent** | AI learns user patterns over time |
| **Cross-Platform** | macOS, Windows, Linux via Tauri |

## Business Model

```
FREE TIER:
- 10 AI messages/day
- Basic timer features
- Local storage only

PRO TIER ($10/month):
- Unlimited AI messages
- Cloud sync
- Advanced analytics
- Priority support

TEAM TIER ($8/user/month):
- Team dashboards
- Shared accountability
- Admin controls
```

---

# 2. SYSTEM OVERVIEW

## Complete Architecture Diagram

```
                              ┌─────────────────────────────────────┐
                              │           USER'S DEVICE             │
                              │  ┌───────────────────────────────┐  │
                              │  │      ZENNER DESKTOP APP       │  │
                              │  │         (Tauri + React)        │  │
                              │  │                                 │  │
                              │  │  ┌─────────┐ ┌─────────────┐   │  │
                              │  │  │ SQLite  │ │ localStorage │   │  │
                              │  │  │   DB    │ │  (settings)  │   │  │
                              │  │  └─────────┘ └─────────────┘   │  │
                              │  └────────────────┬────────────────┘  │
                              └───────────────────┼───────────────────┘
                                                  │
                                    HTTPS (Encrypted)
                                                  │
                    ┌─────────────────────────────▼─────────────────────────────┐
                    │                        YOUR VPS                            │
                    │                       (16GB RAM)                           │
                    │  ┌─────────────────────────────────────────────────────┐  │
                    │  │                     NGINX                            │  │
                    │  │           (SSL Termination, Rate Limiting)          │  │
                    │  └───────────────────────┬─────────────────────────────┘  │
                    │                          │                                 │
                    │         ┌────────────────┼────────────────┐               │
                    │         │                │                │               │
                    │         ▼                ▼                ▼               │
                    │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │
                    │  │ SuperAdmin │  │ AI Gateway │  │ Sync API           │  │
                    │  │  Dashboard │  │  (Proxy)   │  │ (Future)           │  │
                    │  │ :3000      │  │   :4000    │  │ :5000              │  │
                    │  └─────┬──────┘  └─────┬──────┘  └────────────────────┘  │
                    │        │               │                                  │
                    │        └───────┬───────┘                                  │
                    │                │                                          │
                    │         ┌──────▼──────┐                                   │
                    │         │  PostgreSQL │                                   │
                    │         │   :5432     │                                   │
                    │         └─────────────┘                                   │
                    │                                                           │
                    │         ┌─────────────┐                                   │
                    │         │    Redis    │ (Optional - for queuing)         │
                    │         │   :6379     │                                   │
                    │         └─────────────┘                                   │
                    └───────────────────────────────────────────────────────────┘
                                                  │
                                                  │
               ┌──────────────────────────────────┼──────────────────────────────────┐
               │                                  │                                   │
               ▼                                  ▼                                   ▼
        ┌────────────┐                    ┌────────────┐                      ┌────────────┐
        │   OpenAI   │                    │  Anthropic │                      │   Google   │
        │    API     │                    │   Claude   │                      │   Gemini   │
        └────────────┘                    └────────────┘                      └────────────┘
```

## Components Summary

| Component | Purpose | Technology | Location |
|-----------|---------|------------|----------|
| **Zenner Client** | User-facing desktop app | Tauri + React + TypeScript | User's computer |
| **SuperAdmin** | Admin dashboard | Next.js + PostgreSQL | Your VPS |
| **AI Gateway** | Proxies AI requests | Fastify + PM2 | Your VPS |
| **Sync API** | Cloud sync (future) | Fastify + PostgreSQL | Your VPS |

---

# 3. CLIENT APP (ZENNER DESKTOP)

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Tauri 2.0 | Desktop app wrapper |
| **Frontend** | React 18 + TypeScript | UI framework |
| **Styling** | Tailwind CSS + Framer Motion | Design system |
| **State** | React hooks + localStorage | State management |
| **Database** | SQLite (tauri-plugin-sql) | Local data storage |
| **Backend** | Rust (Tauri core) | Native integrations |

## Directory Structure

```
pomodoro/
├── src/                          # Frontend source code
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Main application component (router)
│   ├── index.css                 # Global styles
│   ├── App.css                   # App-specific styles
│   │
│   ├── components/               # React components (62 files)
│   │   ├── ZennerCoach.tsx       # AI chat interface
│   │   ├── JournalView.tsx       # Journal main view
│   │   ├── FloatingPlayer.tsx    # Sound library player
│   │   ├── AnalyticsDashboard.tsx# Focus analytics
│   │   ├── SettingsHub.tsx       # Settings navigation
│   │   ├── CircularTimer.tsx     # Main timer display
│   │   ├── frequency/            # Binaural beat generator
│   │   ├── settings/             # Settings sub-views
│   │   ├── training/             # AI training views
│   │   └── ...                   # Other components
│   │
│   ├── hooks/                    # React hooks (7 files)
│   │   ├── useTimer.ts           # Timer state management
│   │   ├── useAnalytics.ts       # Analytics data hook
│   │   ├── useSessionLogger.ts   # Session logging to DB
│   │   ├── useVoice.ts           # Voice/TTS hook
│   │   └── ...
│   │
│   ├── services/                 # Business logic (50+ files)
│   │   ├── ai/                   # AI services
│   │   │   ├── AIService.ts      # LLM router
│   │   │   ├── CoachService.ts   # Zeni personality
│   │   │   ├── RAGService.ts     # Knowledge retrieval
│   │   │   ├── MemoryOrchestrator.ts
│   │   │   ├── ConversationManager.ts
│   │   │   └── providers/        # AI providers
│   │   │       ├── OpenAIProvider.ts
│   │   │       ├── GeminiProvider.ts
│   │   │       ├── ClaudeProvider.ts
│   │   │       └── OllamaProvider.ts
│   │   │
│   │   ├── db/                   # Database services
│   │   │   ├── DatabaseService.ts # SQLite operations
│   │   │   ├── BackupService.ts  # Export/import
│   │   │   ├── MigrationService.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── training/             # AI training
│   │   │   ├── TrainingService.ts # User memory
│   │   │   └── types.ts
│   │   │
│   │   ├── journal/              # Journal services
│   │   │   ├── JournalService.ts # CRUD operations
│   │   │   ├── JournalAIService.ts
│   │   │   └── JournalPromptService.ts
│   │   │
│   │   ├── voice/                # TTS services
│   │   │   ├── VoiceService.ts
│   │   │   └── providers/
│   │   │
│   │   ├── spotify/              # Spotify integration
│   │   ├── youtube/              # YouTube integration
│   │   ├── music/                # Audio playback
│   │   ├── config/               # App configuration
│   │   ├── events/               # Event bus
│   │   └── sync/                 # Cloud sync (future)
│   │
│   ├── contexts/                 # React contexts
│   │   └── ThemeContext.tsx
│   │
│   ├── config/                   # Configuration files
│   │   └── soundLibrary.ts       # Sound definitions
│   │
│   └── lib/                      # Utilities
│       └── utils.ts
│
├── src-tauri/                    # Tauri backend (Rust)
│   ├── Cargo.toml                # Rust dependencies
│   ├── tauri.conf.json           # Tauri configuration
│   └── src/
│       ├── main.rs               # Entry point
│       └── lib.rs                # Commands (Spotify, Dock)
│
├── public/                       # Static assets
│   └── icons/
│
├── superadmin/                   # SuperAdmin documentation
│   ├── README.md
│   └── IMPLEMENTATION_PLAN.md
│
├── Project_Documentation/        # All documentation
│
└── package.json                  # NPM dependencies
```

## Key Components Explained

### App.tsx (Main Router)
- **Lines:** ~1500
- **Purpose:** Central hub - manages views, state, themes
- **Key State:**
  - `view` - Current screen
  - `sessions` - Session count
  - `isRunning` - Timer state
  - `timeLeft` - Remaining seconds

### ZennerCoach.tsx (AI Chat)
- **Purpose:** Chat interface with Zeni AI
- **Uses:** CoachService, TrainingService, AIService
- **Storage:** localStorage (should be SQLite)
- **Features:**
  - Conversation history
  - Session-based context
  - Mood-aware responses

### JournalView.tsx (Journal)
- **Purpose:** Daily journaling with AI insights
- **Uses:** JournalService, JournalAIService
- **Storage:** SQLite ✅
- **Features:**
  - Rich text editor
  - AI reflections
  - Analytics

### FloatingPlayer.tsx (Sound Library)
- **Purpose:** Ambient sounds, binaural beats
- **Uses:** MusicController, FrequencyEngine
- **Features:**
  - Multiple sound layers
  - AI-generated music descriptions
  - Frequency presets

---

# 4. SUPERADMIN SYSTEM

## Purpose

Complete control panel for:
- User management (CRUD, suspend, impersonate)
- Token economy (credits, limits, grants)
- Revenue analytics (MRR, churn, LTV)
- System control (feature flags, kill switches)
- Support tools (data export, issue resolution)

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Dashboard** | Next.js 14 | Admin UI |
| **UI Library** | shadcn/ui + Tailwind | Components |
| **API** | Next.js API Routes | Backend |
| **Database** | PostgreSQL | Central data store |
| **ORM** | Prisma | Database access |
| **Auth** | NextAuth.js | Admin authentication |
| **Deploy** | PM2 + Nginx | Process management |

## Directory Structure

```
superadmin/
├── apps/
│   └── dashboard/                # Next.js application
│       ├── src/
│       │   ├── app/              # App Router pages
│       │   │   ├── layout.tsx    # Root layout
│       │   │   ├── page.tsx      # Dashboard home
│       │   │   ├── users/
│       │   │   │   ├── page.tsx  # User list
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx # User detail
│       │   │   ├── analytics/
│       │   │   │   └── page.tsx  # Analytics dashboard
│       │   │   ├── tokens/
│       │   │   │   └── page.tsx  # Token management
│       │   │   ├── subscriptions/
│       │   │   │   └── page.tsx  # Billing management
│       │   │   ├── system/
│       │   │   │   ├── page.tsx  # System control
│       │   │   │   └── flags/
│       │   │   │       └── page.tsx # Feature flags
│       │   │   ├── support/
│       │   │   │   └── page.tsx  # Support tools
│       │   │   └── api/          # API routes
│       │   │       ├── auth/
│       │   │       ├── users/
│       │   │       ├── tokens/
│       │   │       ├── analytics/
│       │   │       └── system/
│       │   │
│       │   ├── components/       # UI components
│       │   │   ├── layout/
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── Header.tsx
│       │   │   │   └── PageWrapper.tsx
│       │   │   ├── users/
│       │   │   │   ├── UserTable.tsx
│       │   │   │   ├── UserDetail.tsx
│       │   │   │   └── UserActions.tsx
│       │   │   ├── analytics/
│       │   │   │   ├── MetricCard.tsx
│       │   │   │   └── Charts.tsx
│       │   │   └── ui/           # shadcn components
│       │   │
│       │   ├── lib/              # Utilities
│       │   │   ├── api.ts        # API client
│       │   │   ├── prisma.ts     # Prisma client
│       │   │   └── auth.ts       # Auth config
│       │   │
│       │   └── hooks/            # React hooks
│       │       ├── useUsers.ts
│       │       └── useAnalytics.ts
│       │
│       ├── prisma/
│       │   ├── schema.prisma     # Database schema
│       │   └── migrations/       # Schema migrations
│       │
│       ├── package.json
│       ├── tailwind.config.js
│       └── next.config.js
│
├── docs/                         # This documentation
│   ├── 00_MASTER_DOCUMENTATION.md
│   ├── 01_ZENNER_CLIENT_STRUCTURE.md
│   ├── 02_SUPERADMIN_STRUCTURE.md
│   ├── 03_API_GATEWAY.md
│   ├── 04_DATABASE_SCHEMA.md
│   ├── 05_AUTHENTICATION.md
│   └── ...
│
├── scripts/
│   ├── deploy.sh                 # Deployment script
│   ├── backup-db.sh              # Database backup
│   └── seed.ts                   # Seed data
│
├── docker-compose.yml            # Local development
├── ecosystem.config.js           # PM2 configuration
└── README.md
```

## Feature Modules

### 4.1 User Management

**Purpose:** Complete control over user accounts

**Capabilities:**
- List all users with filters (status, plan, activity)
- View user detail (profile, sessions, transactions)
- Suspend/unsuspend accounts
- Ban users (permanent)
- Impersonate (view app as user)
- Export user data (GDPR)
- Delete with cascade
- Bulk operations (email, upgrade, suspend)

**API Endpoints:**
```
GET    /api/users                 # List users (paginated)
GET    /api/users/:id             # Get user detail
PATCH  /api/users/:id             # Update user
DELETE /api/users/:id             # Delete user
POST   /api/users/:id/suspend     # Suspend
POST   /api/users/:id/unsuspend   # Unsuspend
POST   /api/users/:id/impersonate # Get impersonation token
GET    /api/users/:id/export      # GDPR export
```

### 4.2 Token Economy

**Purpose:** Manage AI credit system

**Capabilities:**
- View global token usage
- Grant tokens to users
- Revoke tokens
- Set custom limits
- View transaction history
- Configure token packages
- Cost analysis (spend vs revenue)

**API Endpoints:**
```
GET    /api/tokens/overview       # Global stats
GET    /api/tokens/usage          # Usage over time
POST   /api/users/:id/tokens/grant  # Grant tokens
POST   /api/users/:id/tokens/revoke # Revoke tokens
GET    /api/users/:id/transactions  # Transaction history
PUT    /api/tokens/packages       # Configure packages
```

### 4.3 Analytics

**Purpose:** Business intelligence

**Capabilities:**
- Real-time metrics (DAU, WAU, MAU)
- Revenue metrics (MRR, ARR, churn, LTV)
- Conversion funnels (free → trial → paid)
- Cohort analysis (retention over time)
- AI usage analytics
- User segmentation
- Custom reports
- Export to CSV/PDF

**API Endpoints:**
```
GET    /api/analytics/overview    # Dashboard metrics
GET    /api/analytics/users       # User analytics
GET    /api/analytics/revenue     # Revenue analytics
GET    /api/analytics/retention   # Retention cohorts
GET    /api/analytics/ai          # AI usage
GET    /api/analytics/export      # Export data
```

### 4.4 System Control

**Purpose:** Operational control

**Capabilities:**
- Feature flags (enable/disable features)
- Gradual rollouts (% of users)
- Kill switches (emergency disable)
- Maintenance mode
- In-app announcements
- Force app update
- Rate limiting config
- API key management

**API Endpoints:**
```
GET    /api/system/health         # Health check
GET    /api/system/flags          # Get feature flags
PATCH  /api/system/flags/:key     # Update flag
POST   /api/system/maintenance    # Toggle maintenance
POST   /api/system/announcement   # Set announcement
GET    /api/system/audit          # Audit log
```

### 4.5 Billing

**Purpose:** Subscription management

**Capabilities:**
- View all subscriptions
- Cancel subscriptions
- Issue refunds
- Extend trials
- Apply coupons
- View invoices
- Revenue reports
- Stripe webhook handling

**API Endpoints:**
```
GET    /api/billing/subscriptions # List subscriptions
GET    /api/billing/subscriptions/:id
POST   /api/billing/subscriptions/:id/cancel
POST   /api/billing/subscriptions/:id/refund
POST   /api/billing/coupons       # Create coupon
POST   /api/webhooks/stripe       # Stripe webhooks
```

---

*[Document continues in Part 2...]*
