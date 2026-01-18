# Zenner SaaS Admin - Detailed Requirements

**Document Version:** 1.0  
**Created:** January 2026  
**Purpose:** Comprehensive feature requirements for SaaS admin dashboard

---

## 🎯 Product Goal

Build a comprehensive web-based admin dashboard to manage Zenner's SaaS operations, including user management, analytics, system health monitoring, and customer support tools.

---

## 👥 User Roles & Permissions

### Super Admin
**Access:** Full access to everything
**Can:**
- Manage users (suspend, delete, modify subscriptions)
- View all analytics
- Configure system settings
- Manage other admins
- Access audit logs
- Export/delete user data

### Support Team
**Access:** User support focused
**Can:**
- View user details
- Export user data (for GDPR requests)
- View user logs
- Send notifications
- **Cannot:**
- Modify subscriptions
- Delete users
- Configure system settings

### Analyst
**Access:** Read-only analytics
**Can:**
- View all dashboards
- Export reports
- **Cannot:**
- Modify any data
- Access user PII (personally identifiable information)

---

## 📊 Feature Requirements

### 1. **Dashboard Home (MVP)**

**Purpose:** At-a-glance overview of key metrics

**Metrics to Display:**

#### User Metrics
```
- Total Users (with trend vs prev period)
- Active Users (last 30 days)
- User Distribution by Tier (free/premium/pro) - pie chart
- New Signups (last 7/30 days) - line chart
```

#### Revenue Metrics
```
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn Rate (%)
- Avg Revenue Per User (ARPU)
```

#### Engagement Metrics
```
- Total Sessions Completed (all time)
- Avg Sessions Per User (last 30 days)
- Avg Focus Time Per User (minutes/day)
- Streak Leaders (top 10 users by streak)
```

#### System Health
```
- API Response Time (ms)
- Error Rate (%)
- Database Health
- AI Providers Status (Gemini, OpenAI, Claude)
```

**UI Components:**
- 4x stat cards (total users, MRR, active users, sessions)
- 2x line charts (user growth, revenue trend)
- 1x pie chart (subscription tier distribution)
- 1x health status panel (green/yellow/red indicators)
- 1x activity feed (recent important events)

**Refresh Rate:** Auto-refresh every 30 seconds

---

### 2. **User Management (MVP)**

**Purpose:** Search, view, and manage all Zenner users

#### 2.1 User List View

**Features:**
- Table with columns:
  - Email
  - Subscription Tier (badge)
  - Status (active/suspended)
  - Created At
  - Last Login
  - Total Sessions
  - Actions (view/suspend/export)

**Filters:**
```
- Subscription Tier (free/premium/pro)
- Status (active/suspended)
- Date Range (created, last active)
- Has AI Conversations (yes/no)
- Has Spotify Connected (yes/no)
```

**Search:**
```
- By email
- By user ID
- By device ID
```

**Sorting:**
- Created At (newest/oldest)
- Last Login (recent/old)
- Total Sessions (high/low)
- Total Focus Time (high/low)

**Pagination:** 50 users per page

**Actions:**
- View Details (modal or new page)
- Suspend Account
- Export User Data
- Impersonate (for debugging)

#### 2.2 User Detail View

**Purpose:** Deep dive into a single user

**Sections:**

**Profile Tab:**
```
- Email, User ID, Device ID
- Subscription:
  - Tier (free/premium/pro)
  - Status (active/canceled/past_due)
  - Started At, Ends At
  - Stripe Customer ID (link to Stripe dashboard)
- Account Status:
  - Is Active, Is Email Verified
  - Created At, Last Login
- Settings JSON viewer (collapsible)
```

**Sessions Tab:**
```
- Total sessions: 150
- Completed: 135 (90%)
- Abandoned: 15 (10%)
- Total focus time: 3,750 minutes

- Recent Sessions Table:
  | Date       | Mode  | Duration | Status    | Notes    |
  |------------|-------|----------|-----------|----------|
  | 2026-01-18 | Focus | 25 min   | Completed | Work task|
  | 2026-01-18 | Break | 5 min    | Completed | -        |

- Charts:
  - Sessions per day (last 30 days)
  - Focus time trend
  - Best productivity times (heatmap)
```

**AI Usage Tab:**
```
- Total conversations: 45
- Total messages: 890
- Total tokens used: 125,000
- Avg tokens per conversation: 2,778

- Recent Conversations:
  | Date       | Title            | Messages | Tokens |
  |------------|------------------|----------|--------|
  | 2026-01-18 | Weekly planning  | 24       | 3,500  |

- Memory System:
  - Facts: 150 items
  - Preferences: 45 items
  - Goals: 12 items
  - Rules: 8 items
  
- View conversation (full chat history)
```

**Journal Tab:**
```
- Total entries: 60
- Avg word count: 250
- Recent Entries:
  | Date       | Mood    | Word Count |
  |------------|---------|------------|
  | 2026-01-18 | Focused | 350        |
```

**Activity Log Tab:**
```
- Recent actions:
  | Timestamp      | Event                  | Details      |
  |----------------|------------------------|--------------|
  | 2026-01-18 10:00 | Session completed    | 25 min focus |
  | 2026-01-18 09:30 | Conversation started | AI coaching  |
```

**Actions:**
```
- Suspend Account (requires confirmation)
- Delete Account (requires double confirmation + reason)
- Export All Data (GDPR)
- Reset Password (sends email)
- Send Notification
```

---

### 3. **Analytics Dashboard (MVP)**

**Purpose:** Aggregate metrics across all users

#### 3.1 User Analytics

**Metrics:**
```
- User Growth:
  - Signups per day (last 30/90 days) - line chart
  - Cumulative users over time
  - Growth rate (% per week/month)
  
- Retention:
  - Cohort analysis (month-over-month retention)
  - Churn rate by tier
  - Avg user lifetime (days)
```

**Filters:**
```
- Date range
- Subscription tier
```

#### 3.2 Session Analytics

**Metrics:**
```
- Total sessions (all time, this week, this month)
- Sessions by status:
  - Completed: 90%
  - Abandoned: 10%
- Avg session completion rate by user tier
- Total focus time (all users combined)
- Avg focus time per user per day
- Peak productivity hours (heatmap)
```

**Charts:**
```
- Sessions over time (line chart)
- Completion rate trend
- Focus time distribution (histogram)
```

#### 3.3 AI Usage Analytics

**Metrics:**
```
- Total conversations started
- Total messages sent (user + assistant)
- Total tokens consumed
- Avg tokens per conversation
- Token cost estimation ($)
- Most active AI users (top 10)
```

**AI Provider Breakdown:**
```
- Gemini: 45% of requests
- OpenAI: 35%
- Claude: 20%
```

**Memory System Stats:**
```
- Total memory items created
- Avg memory items per user
- Top categories (facts, preferences, goals)
```

#### 3.4 Feature Adoption

**Metrics:**
```
- % of users who have used AI coach
- % of users who have connected Spotify
- % of users who have written journal entries
- % of users who have customized presets
```

**Chart:** Feature adoption funnel

---

### 4. **System Health Monitoring (MVP)**

**Purpose:** Monitor system performance and catch issues early

#### 4.1 Health Dashboard

**Components:**

**Overall Status:**
```
✅ Healthy
⚠️ Degraded
❌ Down
```

**Service Health:**
```
- API:
  - Status: ✅
  - Response time: 45ms (avg last 5 min)
  - Error rate: 0.02%
  - Requests/sec: 125

- Database:
  - Status: ✅
  - Connection pool: 5/20
  - Query time: 12ms (avg)
  - Slow queries: 0

- Redis:
  - Status: ✅
  - Memory usage: 234MB / 1GB
  - Hit rate: 95%

- AI Providers:
  - Gemini: ✅
  - OpenAI: ✅
  - Claude: ⚠️ (high latency)
```

**Metrics Charts:**
```
- API response time (last hour) - line chart
- Error rate (last hour) - line chart
- Requests per minute - line chart
- Database query time - line chart
```

#### 4.2 Alerts

**Alert Types:**
```
- API error rate > 1%
- Database connection pool > 80%
- AI provider down
- Response time > 500ms
```

**Alert Delivery:**
- In-dashboard notification
- Email to admins
- Slack webhook (optional)

---

### 5. **Support Tools (MVP)**

**Purpose:** Help resolve customer issues quickly

#### 5.1 Search

**Search Features:**
```
Input: "john@example.com"
Results:
- User profile
- Recent sessions
- Recent AI conversations
- Recent errors/logs
```

**Search By:**
- Email
- User ID
- Device ID
- Session ID
- Conversation ID

#### 5.2 User Data Export

**Purpose:** GDPR compliance

**Process:**
1. Admin selects user
2. Clicks "Export Data"
3. System generates ZIP file containing:
   - User profile (JSON)
   - All sessions (CSV)
   - All AI conversations (JSON)
   - All journal entries (Markdown)
   - All memory items (JSON)
4. Download link (expires in 24h)

**Format:** ZIP file with structured data

#### 5.3 User Logs Viewer

**Purpose:** Debug user-reported issues

**Features:**
```
- View last 100 log entries for user
- Filter by:
  - Log level (error, warn, info, debug)
  - Date range
  - Component (timer, AI, sync, etc.)
- Search in logs
```

**Log Entry:**
```json
{
  "timestamp": "2026-01-18T10:30:00Z",
  "level": "error",
  "component": "sync",
  "message": "Failed to sync session",
  "details": {
    "sessionId": "abc123",
    "error": "Network timeout"
  }
}
```

#### 5.4 Impersonate User

**Purpose:** Debug issues as if you were the user

**Flow:**
1. Admin clicks "Impersonate" on user profile
2. Opens new tab with desktop app URL
3. Auto-logged in as that user
4. Admin can test features, see what user sees
5. Clear indicator that you're impersonating

**Security:** Logged in audit_logs

---

### 6. **Audit Logs (MVP)**

**Purpose:** Track all admin actions for security/compliance

**What's Logged:**
```
- User suspended/deleted
- Subscription modified
- Data exported
- User impersonated
- Settings changed
```

**Log Entry:**
```
{
  "timestamp": "2026-01-18T10:45:00Z",
  "adminUserId": "admin-uuid",
  "adminEmail": "admin@zenner.app",
  "action": "user_suspended",
  "resourceType": "user",
  "resourceId": "user-uuid",
  "details": {
    "reason": "Terms of service violation"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

**UI:**
```
Table with columns:
- Timestamp
- Admin
- Action
- Resource
- Details
- IP Address

Filters:
- Admin
- Action type
- Date range
```

---

## 🎨 UI/UX Requirements

### Design System

**Colors:**
```
- Primary: #6366F1 (Indigo)
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Background: #0F172A (Dark blue)
- Surface: #1E293B (Lighter dark)
- Text: #F1F5F9 (Light gray)
```

**Typography:**
```
- Font: Inter (Google Fonts)
- Sizes: 12px, 14px, 16px, 20px, 24px, 32px
```

**Components:**
```
- Cards: Rounded corners (12px), subtle border
- Buttons: Rounded (8px), hover states
- Tables: Zebra striping, hover rows
- Charts: Consistent color palette
- Modals: Blur backdrop, centered
```

### Responsive Design

**Breakpoints:**
```
- Desktop: 1440px+ (primary)
- Laptop: 1024px
- Tablet: 768px (limited support)
- Mobile: Not required (admin dashboard is desktop-only)
```

---

## 🔐 Security Requirements

### Authentication
- Email + password
- 2FA/MFA required for super_admin
- Session timeout: 8 hours
- Force logout on password change

### Authorization
- Role-based access control (RBAC)
- Route-level permissions
- API endpoint permissions
- Audit all actions

### Data Protection
- HTTPS only
- API keys encrypted at rest
- Password hashing (bcrypt)
- GDPR compliance (data export/delete)

---

## 📈 Performance Requirements

### Response Times
- Dashboard load: < 2 seconds
- User search: < 500ms
- Analytics query: < 3 seconds
- Data export: < 30 seconds (background job)

### Scalability
- Support 100,000+ users
- Handle 1,000+ concurrent admin sessions
- Process 10,000+ API requests/minute

---

## 🧪 Testing Requirements

### Unit Tests
- 80%+ code coverage
- Test all business logic

### Integration Tests
- Test all API endpoints
- Test database operations

### E2E Tests
- Test critical user flows:
  - Admin login
  - User search
  - Data export
  - Suspend user

---

## 📦 Deliverables

### Phase 1 (MVP) - 4-6 weeks
✅ Dashboard home
✅ User management (list, detail, suspend)
✅ Basic analytics (users, sessions)
✅ System health monitoring
✅ User data export (GDPR)
✅ Audit logs

### Phase 2 (Enhanced) - 2-3 weeks
✅ Advanced analytics (retention cohorts, feature adoption)
✅ Support tools (impersonate, logs viewer)
✅ Real-time updates (WebSocket)
✅ Email notifications
✅ Custom reports builder

### Phase 3 (Future)
- A/B testing dashboard
- Feature flags management
- Billing dispute resolution
- Automated onboarding flows

---

**Next Document:** `SAAS_ADMIN_UI_MOCKUPS.md` - Visual UI specifications
