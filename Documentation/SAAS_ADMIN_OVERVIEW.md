# Zenner SaaS Admin Dashboard - Project Overview

**Document Version:** 1.0  
**Created:** January 2026  
**Purpose:** Complete specification for building a web-based SaaS admin dashboard for Zenner

---

## 🎯 Executive Summary

**What is Zenner?**
Zenner is a premium desktop Pomodoro timer application (macOS) with advanced AI coaching, memory system, and productivity tracking features.

**What needs to be built?**
A comprehensive web-based SaaS admin dashboard to manage users, monitor system health, analyze usage, and provide customer support.

**Why this is needed?**
Currently, Zenner is a desktop app with local SQLite storage. To scale as a SaaS product, we need:
- User management system
- Subscription/billing management
- Usage analytics across all users
- System health monitoring
- Customer support tools
- Data export/backup capabilities

---

## 📊 Current Zenner Architecture

### Desktop App (Current State)
- **Platform:** macOS (Tauri + React + TypeScript)
- **Database:** Local SQLite (`~/Library/Application Support/com.zenner/`)
- **AI:** Integrated Gemini/OpenAI/Claude/Anthropic
- **Storage:** All data stored locally on user's machine
- **User Model:** Single user per installation (no cloud sync yet)

### Key Features
1. **Pomodoro Timer**
   - Focus sessions (25 min default)
   - Short breaks (5 min)
   - Long breaks (15 min)
   - Custom presets
   - Session tracking

2. **AI Coach**
   - Conversational productivity coaching
   - Context-aware suggestions
   - Memory of user preferences/goals
   - Multiple AI providers (Gemini, OpenAI, Claude)

3. **Memory/Brain System**
   - RAG (Retrieval Augmented Generation)
   - User facts, preferences, goals
   - Learning from conversations
   - Experience tracking
   - Rules engine

4. **Analytics**
   - Session completion tracking
   - Productivity trends
   - Focus time analysis
   - Weekly/monthly reports
   - Streak tracking

5. **Integrations**
   - Spotify (music control)
   - Voice announcements (TTS)
   - System notifications

---

## 🎯 SaaS Admin Dashboard Requirements

### Primary Goals
1. **User Management** - View, manage, support all Zenner users
2. **Analytics** - Aggregate usage data across all users
3. **System Health** - Monitor performance, errors, API usage
4. **Support Tools** - Help users, debug issues, export data
5. **Business Intelligence** - Revenue, retention, growth metrics

### Target Users
- **Super Admin** - Full access, system configuration
- **Support Team** - User support, data export, issue resolution
- **Analytics Team** - Read-only access to dashboards

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│              ZENNER DESKTOP APPS (macOS)                │
│           (Distributed to customers' machines)          │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ REST API / WebSocket
                     │ (when cloud sync enabled)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   SAAS BACKEND API                      │
│   (Node.js/Python + PostgreSQL/MongoDB + Redis)        │
│                                                         │
│  • User authentication & management                     │
│  • Data sync endpoints                                  │
│  • Analytics aggregation                                │
│  • Billing/subscription management                      │
│  • System health monitoring                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ GraphQL/REST
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            SAAS ADMIN DASHBOARD (WEB)                   │
│          (React + TypeScript + Tailwind)                │
│                                                         │
│  • User management UI                                   │
│  • Analytics dashboards                                 │
│  • Support tools                                        │
│  • System monitoring                                    │
│  • Business intelligence                                │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 What You're Building

You will build **TWO components**:

### 1. **SaaS Backend API**
- User authentication & authorization
- Data sync from desktop apps
- Aggregate analytics
- Subscription/billing integration
- Webhooks for events
- Admin API endpoints

### 2. **Admin Dashboard Web App**
- React-based single-page application
- Responsive design (desktop-first)
- Real-time updates (WebSocket)
- Data visualization (charts/graphs)
- User management interface
- Support tooling

---

## 🗄️ Data You Need to Manage

### User Data (from Desktop App)
```
Users
├── Profile data
├── Subscription tier (free/premium/pro)
├── Settings/preferences
├── API keys (OpenAI, Spotify, etc.)
└── Device info (macOS version, app version)

Session Data
├── Pomodoro sessions (completed/abandoned)
├── Focus time (minutes per day)
├── Productivity metrics
└── Session notes

AI/Memory Data
├── Conversations (chat history)
├── Memory items (facts, preferences, goals)
├── Experiences (learnings)
├── Rules (user-defined behaviors)
└── Training profile

Analytics
├── Daily/weekly/monthly aggregates
├── Streak data
├── Completion rates
└── Usage patterns
```

---

## 🎨 Admin Dashboard Features

### Must-Have Features (MVP)
1. ✅ **Dashboard Home**
   - Total users (free/premium/pro)
   - Active users (last 7/30 days)
   - Revenue (MRR/ARR)
   - System health status

2. ✅ **User Management**
   - Search users (by email, ID)
   - View user profile
   - View user's sessions
   - View user's AI conversations
   - Impersonate user (for support)
   - Suspend/activate accounts

3. ✅ **Analytics**
   - User growth (signups per day/week)
   - Session analytics (total sessions, avg focus time)
   - AI usage (conversations, tokens used)
   - Feature adoption (which features are used)
   - Retention cohorts

4. ✅ **System Health**
   - API health (response times, error rates)
   - Database performance
   - AI provider status (Gemini, OpenAI, Claude)
   - Background job queue status

5. ✅ **Support Tools**
   - Export user data (GDPR compliance)
   - Reset user password
   - View user's error logs
   - Send notifications to users

### Nice-to-Have Features (Future)
- A/B testing dashboard
- Feature flags management
- Email campaign management
- Billing dispute resolution
- Custom reports builder

---

## 🔐 Security Requirements

1. **Admin Authentication**
   - Multi-factor authentication (MFA) required
   - Role-based access control (RBAC)
   - Audit logs for all actions

2. **Data Protection**
   - Encrypted data at rest
   - Encrypted data in transit (HTTPS)
   - PII anonymization in logs

3. **Compliance**
   - GDPR-compliant data export
   - User data deletion on request
   - Privacy policy enforcement

---

## 📈 Success Metrics

Your admin dashboard should enable:
- ✅ Resolve 90% of support tickets within 24h
- ✅ Identify and fix system issues within 1h
- ✅ Generate business reports in <5 minutes
- ✅ Onboard new admin users in <1 hour

---

## 📚 Related Documents

This overview provides the **big picture**. For detailed specifications, see:

1. **SAAS_ADMIN_REQUIREMENTS.md** - Detailed feature requirements
2. **SAAS_ADMIN_DATABASE_SCHEMA.md** - Complete database schema
3. **SAAS_ADMIN_API_SPECIFICATION.md** - All API endpoints
4. **SAAS_ADMIN_TECH_STACK.md** - Technology recommendations
5. **SAAS_ADMIN_UI_MOCKUPS.md** - UI/UX specifications
6. **SAAS_ADMIN_USER_FLOWS.md** - User journeys
7. **SAAS_ADMIN_DEPLOYMENT.md** - Deployment architecture

---

## 🚀 Getting Started

1. Read this overview first (you are here)
2. Review **SAAS_ADMIN_REQUIREMENTS.md** for detailed features
3. Study **SAAS_ADMIN_DATABASE_SCHEMA.md** to understand data models
4. Check **SAAS_ADMIN_TECH_STACK.md** for technology choices
5. Review **SAAS_ADMIN_API_SPECIFICATION.md** before coding
6. Use **SAAS_ADMIN_UI_MOCKUPS.md** for design reference
7. Follow **SAAS_ADMIN_DEPLOYMENT.md** for deployment

---

**Next Step:** Read `SAAS_ADMIN_REQUIREMENTS.md` for detailed feature specifications.
