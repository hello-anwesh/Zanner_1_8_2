# Zenner SaaS Admin - API Specification

**Document Version:** 1.0  
**Created:** January 2026

---

## 🌐 API Overview

**Base URL:** `https://admin-api.zenner.app/api/v1`  
**Authentication:** Bearer JWT tokens  
**Format:** JSON

---

## 🔐 Authentication

### Admin Login
```
POST /admin/auth/login
Content-Type: application/json

Request:
{
  "email": "admin@zenner.app",
  "password": "secure_password",
  "mfa_code": "123456"  // Optional if MFA enabled
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "dGhpc2lzYXJlZnJlc2h0b2tlbg...",
  "user": {
    "id": "uuid",
    "email": "admin@zenner.app",
    "role": "super_admin"
  }
}
```

---

## 👥 User Management

### Get All Users
```
GET /users?page=1&limit=50&tier=premium&search=john@example.com
Authorization: Bearer {token}

Response:
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "subscriptionTier": "premium",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "lastLoginAt": "2026-01-18T00:00:00Z",
      "stats": {
        "totalSessions": 150,
        "totalFocusMinutes": 3750
      }
    }
  ],
  "total": 1234,
  "page": 1,
  "limit": 50
}
```

### Get User Details
```
GET /users/:userId
Authorization: Bearer {token}

Response:
{
  "user": {...},
  "sessions": {
    "total": 150,
    "completed": 135,
    "abandoned": 15,
    "recentSessions": [...]
  },
  "aiUsage": {
    "conversationsCount": 45,
    "totalTokens": 125000,
    "avgTokensPerConversation": 2778
  },
  "subscription": {
    "tier": "premium",
    "status": "active",
    "startedAt": "2026-01-01T00:00:00Z"
  }
}
```

### Suspend User
```
POST /users/:userId/suspend
Authorization: Bearer {token}

Request:
{
  "reason": "Terms of service violation"
}

Response:
{
  "success": true,
  "user": {
    "id": "uuid",
    "isActive": false
  }
}
```

### Export User Data
```
POST /users/:userId/export
Authorization: Bearer {token}

Response:
{
  "downloadUrl": "https://cdn.zenner.app/exports/user-uuid-2026-01-18.zip",
  "expiresAt": "2026-01-19T00:00:00Z"
}
```

---

## 📊 Analytics

### Dashboard Overview
```
GET /analytics/overview
Authorization: Bearer {token}

Response:
{
  "users": {
    "total": 5000,
    "active30d": 3500,
    "free": 4000,
    "premium": 800,
    "pro": 200
  },
  "sessions": {
    "total": 125000,
    "last30d": 45000,
    "avgPerUser": 25
  },
  "revenue": {
    "mrr": 8000,  // Monthly Recurring Revenue
    "arr": 96000,  // Annual Recurring Revenue
    "churnRate": 2.5
  },
  "aiUsage": {
    "totalTokens": 12500000,
    "avgTokensPerUser": 2500
  }
}
```

### User Growth
```
GET /analytics/growth?period=30d
Authorization: Bearer {token}

Response:
{
  "period": "30d",
  "data": [
    {
      "date": "2026-01-01",
      "signups": 45,
      "totalUsers": 4725
    },
    ...
  ]
}
```

### Session Analytics
```
GET /analytics/sessions?userId=uuid&period=7d
Authorization: Bearer {token}

Response:
{
  "period": "7d",
  "data": [
    {
      "date": "2026-01-18",
      "totalSessions": 4500,
      "completedSessions": 4050,
      "avgFocusTime": 22.5  // minutes
    },
    ...
  ]
}
```

---

## 🔧 System Health

### Health Check
```
GET /system/health
Authorization: Bearer {token}

Response:
{
  "status": "healthy",
  "components": {
    "database": {
      "status": "healthy",
      "responseTime": 12  // ms
    },
    "redis": {
      "status": "healthy",
      "responseTime": 3
    },
    "aiProviders": {
      "gemini": "healthy",
      "openai": "healthy",
      "claude": "degraded"
    }
  },
  "metrics": {
    "apiResponseTime": 45,  // ms
    "errorRate": 0.02,  // %
    "requestsPerSecond": 125
  }
}
```

---

## 🎫 Support Tools

### Search Users
```
POST /support/search
Authorization: Bearer {token}

Request:
{
  "query": "john@example.com",
  "searchBy": ["email", "userId", "deviceId"]
}

Response:
{
  "results": [...]
}
```

### View User Logs
```
GET /support/users/:userId/logs?limit=100
Authorization: Bearer {token}

Response:
{
  "logs": [
    {
      "timestamp": "2026-01-18T10:30:00Z",
      "level": "error",
      "message": "Failed to sync session",
      "details": {...}
    },
    ...
  ]
}
```

---

## 📱 Desktop App Sync API

### Sync Data
```
POST /sync
Authorization: Bearer {userToken}  // User token, not admin!

Request:
{
  "userId": "uuid",
  "deviceId": "mac-abc123",
  "lastSyncAt": "2026-01-18T00:00:00Z",
  "data": {
    "sessions": [...],
    "conversations": [...],
    "messages": [...],
    "memoryItems": [...],
    "experiences": [...],
    "rules": [...],
    "journalEntries": [...]
  }
}

Response:
{
  "success": true,
  "syncedAt": "2026-01-18T10:45:00Z",
  "conflicts": [],  // Any sync conflicts
  "serverData": {
    // Updated data from server
  }
}
```

---

## 🔔 Webhooks

### Register Webhook
```
POST /webhooks
Authorization: Bearer {token}

Request:
{
  "url": "https://your-server.com/webhooks/zenner",
  "events": ["user.created", "subscription.updated", "session.completed"],
  "secret": "webhook_secret_key"
}

Response:
{
  "id": "webhook-uuid",
  "status": "active"
}
```

### Webhook Events
```
user.created
user.suspended
subscription.created
subscription.updated
subscription.canceled
session.completed
ai.conversation.started
data.export.requested
```

---

## 📈 Business Intelligence

### Retention Cohorts
```
GET /analytics/retention
Authorization: Bearer {token}

Response:
{
  "cohorts": [
    {
      "cohortMonth": "2026-01",
      "usersCount": 500,
      "retention": {
        "month0": 100,  // %
        "month1": 75,
        "month2": 60,
        "month3": 55
      }
    },
    ...
  ]
}
```

### Feature Adoption
```
GET /analytics/features
Authorization: Bearer {token}

Response:
{
  "features": {
    "aiCoach": {
      "adoptionRate": 65.5,  // %
      "avgUsagePerUser": 12  // conversations
    },
    "journal": {
      "adoptionRate": 42.3,
      "avgUsagePerUser": 18  // entries
    },
    "spotify": {
      "adoptionRate": 78.9
    }
  }
}
```

---

## 🛡️ Security

### All API requests require:
- HTTPS only
- Bearer token authentication
- Rate limiting (100 req/min for admin, 10 req/min for desktop app)
- IP whitelist for admin endpoints (optional)

### Admin Action Logging
Every admin API call is logged to `audit_logs` table:
```sql
{
  "admin_user_id": "uuid",
  "action": "user_suspended",
  "resource_type": "user",
  "resource_id": "user-uuid",
  "ip_address": "192.168.1.1",
  "timestamp": "2026-01-18T10:45:00Z"
}
```

---

**Next Document:** `SAAS_ADMIN_TECH_STACK.md` - Technology recommendations
