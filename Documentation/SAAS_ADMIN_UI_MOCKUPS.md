# Zenner SaaS Admin - UI Mockups & Design Specifications

**Document Version:** 1.0  
**Created:** January 2026  
**Purpose:** Visual UI specifications with ASCII mockups

---

## 🎨 Design System

### Color Palette
```
Primary:   #6366F1 (Indigo)
Success:   #10B981 (Green)
Warning:   #F59E0B (Amber)
Error:     #EF4444 (Red)
Info:      #3B82F6 (Blue)

Background: #0F172A (Dark Navy)
Surface:    #1E293B (Lighter Navy)
Border:     #334155 (Slate)
Text:       #F1F5F9 (Light)
Muted:      #94A3B8 (Gray)
```

### Typography
```
Font Family: 'Inter', sans-serif
Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

Sizes:
- Display: 32px / 2rem
- H1: 24px / 1.5rem
- H2: 20px / 1.25rem
- H3: 16px / 1rem
- Body: 14px / 0.875rem
- Small: 12px / 0.75rem
```

---

## 📱 Layout Structure

### Application Shell
```
┌─────────────────────────────────────────────────────────────────┐
│  Zenner Admin    [Dashboard] [Users] [Analytics] [Health]  👤  │← Header
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         MAIN CONTENT                            │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 1. Dashboard Home

```
┌─────────────────────────────────────────────────────────────────┐
│  Zenner Admin     [Dashboard✓] [Users] [Analytics] [Health] 👤 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ 5,234    │  │ $12,450  │  │ 3,890    │  │ 15,678   │      │
│  │ Total    │  │ MRR      │  │ Active   │  │ Sessions │      │
│  │ Users    │  │          │  │ Users    │  │          │      │
│  │ +12% →   │  │ +8% →    │  │ +5% →    │  │ +15% →   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│  ┌────────────────────────────────┬───────────────────────────┐│
│  │  User Growth (Last 30 Days)    │  Subscription Tiers       ││
│  │                                │                           ││
│  │     ╱╲                         │       ┌────────┐          ││
│  │   ╱    ╲  ╱╲                   │       │ Free   │  80%    ││
│  │ ╱        ╲    ╲                │       │ Premium│  15%    ││
│  │                ╲               │       │ Pro    │   5%    ││
│  │                                │       └────────┘          ││
│  │   Mon ··· Fri ··· Wed          │                           ││
│  └────────────────────────────────┴───────────────────────────┘│
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Recent Activity                     🔄 Auto-refresh      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  10:30 AM  New user signup: john@example.com             │  │
│  │  10:25 AM  Session completed: user-123 (25 min)          │  │
│  │  10:20 AM  AI conversation started: user-456             │  │
│  │  10:15 AM  Subscription upgraded: user-789 → Premium     │  │
│  │  10:10 AM  Data export requested: user-321               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Elements:**
- 4 stat cards with trend indicators
- 2 charts (line + pie/doughnut)
- Activity feed (real-time updates)
- Auto-refresh toggle

---

## 👥 2. User Management - List View

```
┌─────────────────────────────────────────────────────────────────┐
│  Zenner Admin     [Dashboard] [Users✓] [Analytics] [Health] 👤 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Users (5,234)                                                  │
│                                                                 │
│  ┌──────────────────────────────┐  ┌─────────┬─────────┬─────┐│
│  │ 🔍 Search by email or ID...  │  │ All ▾   │ Date ▾  │ ⚙   ││
│  └──────────────────────────────┘  └─────────┴─────────┴─────┘│
│                                                                 │
│  Filters:  [All Tiers]  [Active]  [Has AI]  [Last 30d]  × Clear│
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Email              Tier    Status    Sessions  LastLogin │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ john@example.com   🟡 Pro  ✅ Active    234     2h ago   │  │
│  │ jane@test.com      🔵 Prem ✅ Active    156     5h ago   │  │
│  │ user@demo.com      ⚪ Free ⚠️  Susp      89     2d ago   │  │
│  │ ...                                                      │  │
│  │ ...                                                      │  │
│  │ ...                                                      │  │
│  │ ...                                                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ ← | 1 2 3 ... 105 | →                       50 per page │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click row → Open user detail
- Hover row → Show quick actions (suspend, export)
- Click tier badge → Filter by tier
- Search is debounced (300ms)

---

## 👤 3. User Detail View

```
┌─────────────────────────────────────────────────────────────────┐
│  Zenner Admin     [Dashboard] [Users✓] [Analytics] [Health] 👤 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ← Back to Users        john@example.com                        │
│                                                                 │
│  ┌────────────────────┐  ┌────────────┐  ┌──────────┐         │
│  │ 234                │  │ 5,850      │  │ 45       │         │
│  │ Total Sessions     │  │ Focus Mins │  │ AI Chats │         │
│  └────────────────────┘  └────────────┘  └──────────┘         │
│                                                                 │
│  [Profile] [Sessions] [AI Usage] [Journal] [Activity]          │
│  ───────── ──────────  ────────────────────────────────        │
│                                                                 │
│  Profile Info                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Email:  john@example.com                                │  │
│  │  User ID: uuid-abc-123-def                               │  │
│  │  Created: 2026-01-01 10:00 AM                            │  │
│  │  Last Login: 2026-01-18 08:00 AM                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Subscription                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tier:  🟡 Pro                                            │  │
│  │  Status: ✅ Active                                        │  │
│  │  Started: 2026-01-15                                     │  │
│  │  Renews: 2026-02-15                                      │  │
│  │  Stripe: cus_abc123  ↗                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Actions                                                        │
│  [Suspend Account] [Export Data] [Reset Password] [Send Email] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Tabs:**
- **Profile** - User info, subscription
- **Sessions** - Session history, charts
- **AI Usage** - Conversations, memory items
- **Journal** - Journal entries
- **Activity** - Audit log for this user

---

## 📈 4. Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  Zenner Admin     [Dashboard] [Users] [Analytics✓] [Health] 👤 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Analytics                                                      │
│                                                                 │
│  [User Growth] [Sessions] [AI Usage] [Feature Adoption]        │
│  ──────────── ──────────────────────────────────────────        │
│                                                                 │
│  Date Range:  [Last 30 Days ▾]     Tier:  [All Tiers ▾]        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Signups Over Time                                       │  │
│  │                                                          │  │
│  │       ╱╲                                                 │  │
│  │     ╱    ╲      ╱╲                                       │  │
│  │   ╱        ╲  ╱    ╲                                     │  │
│  │ ╱              ╲      ╲                                  │  │
│  │                                                          │  │
│  │   Jan 1  ···  Jan 15  ···  Jan 30                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌────────────────────────────┬───────────────────────────┐    │
│  │  Retention Cohorts         │  Growth Rate              │    │
│  │                            │                           │    │
│  │  ■■■■■ ■■■■  ■■■          │  Week over Week:  +12%   │    │
│  │  ■■■■■ ■■                 │  Month over Month: +8%   │    │
│  │  ■■■■■                     │                           │    │
│  └────────────────────────────┴───────────────────────────┘    │
│                                                                 │
│  [Export Report] [Schedule Email]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Tab navigation for different analytics views
- Date range picker
- Tier filter
- Export to CSV/PDF
- Schedule automated reports

---

## 🏥 5. System Health Monitor

```
┌─────────────────────────────────────────────────────────────────┐
│  Zenner Admin     [Dashboard] [Users] [Analytics] [Health✓] 👤 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  System Health    Status: ✅ Healthy    Last Check: 10s ago     │
│                                                                 │
│  ┌────────────────────────┬────────────────────────────────┐   │
│  │  API                   │  ✅ Healthy                     │   │
│  │  Response Time: 45ms   │  Error Rate: 0.02%             │   │
│  │  Requests/sec: 125     │  Uptime: 99.99%                │   │
│  └────────────────────────┴────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────┬────────────────────────────────┐   │
│  │  Database              │  ✅ Healthy                     │   │
│  │  Connections: 5/20     │  Query Time: 12ms              │   │
│  │  CPU: 12%              │  Memory: 2.4GB / 8GB           │   │
│  └────────────────────────┴────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────┬────────────────────────────────┐   │
│  │  AI Providers          │                                │   │
│  │  Gemini     ✅         │  OpenAI     ✅                  │   │
│  │  Claude     ⚠️ Slow    │  Anthropic  ✅                  │   │
│  └────────────────────────┴────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Response Time (Last Hour)                           │  │
│  │                                                          │  │
│  │    ─                                                     │  │
│  │      ─ ─                                                 │  │
│  │          ─ ─ ─ ─                                         │  │
│  │                  ─ ─ ─ ─ ─                               │  │
│  │                              ─                           │  │
│  │  10:00  ···  10:30  ···  11:00                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Status Indicators:**
- ✅ Green = Healthy
- ⚠️ Yellow = Degraded
- ❌ Red = Down

---

## 🔍 6. Support Tools - Search

```
┌─────────────────────────────────────────────────────────────────┐
│  Zenner Admin     [Dashboard] [Users] [Analytics] [Health] 👤  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Support Search                                                 │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔍 Search by email, user ID, device ID, session ID...   │  │
│  └──────────────────────────────────────────────────────────┘  │
│         ↓ Results for: "john@example.com"                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 👤 User Profile                                           │  │
│  │ ───────────────────────────────────────────────────────  │  │
│  │ john@example.com                                         │  │
│  │ Pro Tier | Active | 234 Sessions                         │  │
│  │ [View Full Profile →]                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📊 Recent Sessions (5)                                    │  │
│  │ ───────────────────────────────────────────────────────  │  │
│  │ 2026-01-18 09:00  Focus  25min  Completed                │  │
│  │ 2026-01-18 08:30  Focus  25min  Completed                │  │
│  │ [View All Sessions →]                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🤖 Recent AI Conversations (3)                            │  │
│  │ ───────────────────────────────────────────────────────  │  │
│  │ 2026-01-18  Weekly planning (24 messages)                │  │
│  │ [View All Conversations →]                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ⚠️  Recent Errors (2)                                     │  │
│  │ ───────────────────────────────────────────────────────  │  │
│  │ 2026-01-18 10:30  Sync failed: Network timeout           │  │
│  │ [View All Logs →]                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Quick Actions** from search results:
- View user profile
- Export data
- View logs
- Impersonate

---

## 🎯 Component Specifications

### Stat Card
```
┌──────────────┐
│ 5,234        │  ← Large number (24px)
│ Total Users  │  ← Label (14px, muted)
│ +12% →       │  ← Trend (12px, green if positive)
└──────────────┘
Width: 250px
Height: 120px
Border Radius: 12px
Background: #1E293B (surface)
Border: 1px solid #334155
```

### Button
```
Primary:   [Button Text]   Background: #6366F1, Hover: #4F46E5
Secondary: [Button Text]   Background: transparent, Border: #6366F1
Danger:    [Button Text]   Background: #EF4444, Hover: #DC2626
```

### Badge
```
Free:    [Free]    Gray background
Premium: [Premium] Blue background
Pro:     [Pro]     Indigo/Purple background
Active:  [Active]  Green background
Suspended: [Suspended] Red background
```

### Table
```
Header: #1E293B background, bold text
Rows: Alternating #0F172A and #1E293B (zebra striping)
Hover: #334155 background
Border: 1px solid #334155
```

---

## 📱 Responsive Behavior

**Desktop (1440px+):**
- Full layout as shown
- Sidebar + main content

**Laptop (1024px):**
- Stat cards: 2 per row
- Tables: Horizontal scroll if needed

**Tablet (768px):**
- Stat cards: 1 per row
- Simplified navigation

---

**Next Document:** `SAAS_ADMIN_DEPLOYMENT.md` - Deployment architecture
