# SUPERADMIN DETAILED STRUCTURE
## Every File, Every Folder, Every Purpose

---

> **Usage:** This document serves as the blueprint for the SuperAdmin workspace.  
> Copy this to your new workspace so the agent has complete context.

---

## DIRECTORY TREE

```
superadmin/
│
├── apps/
│   │
│   ├── dashboard/                          # Next.js Admin Dashboard
│   │   │
│   │   ├── src/
│   │   │   │
│   │   │   ├── app/                        # Next.js App Router
│   │   │   │   │
│   │   │   │   ├── layout.tsx              # Root layout - sidebar, header, auth provider
│   │   │   │   ├── page.tsx                # Dashboard home - overview metrics
│   │   │   │   ├── loading.tsx             # Global loading state
│   │   │   │   ├── error.tsx               # Global error boundary
│   │   │   │   │
│   │   │   │   ├── (auth)/                 # Auth routes (no layout)
│   │   │   │   │   ├── login/
│   │   │   │   │   │   └── page.tsx        # Admin login page
│   │   │   │   │   └── logout/
│   │   │   │   │       └── route.ts        # Logout handler
│   │   │   │   │
│   │   │   │   ├── users/                  # User management
│   │   │   │   │   ├── page.tsx            # User list with filters, search
│   │   │   │   │   ├── loading.tsx         # Loading skeleton
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx        # User detail view
│   │   │   │   │       ├── sessions/
│   │   │   │   │       │   └── page.tsx    # User's session history
│   │   │   │   │       ├── transactions/
│   │   │   │   │       │   └── page.tsx    # User's token transactions
│   │   │   │   │       └── impersonate/
│   │   │   │   │           └── route.ts    # Start impersonation
│   │   │   │   │
│   │   │   │   ├── tokens/                 # Token economy
│   │   │   │   │   ├── page.tsx            # Token overview dashboard
│   │   │   │   │   ├── packages/
│   │   │   │   │   │   └── page.tsx        # Configure token packages
│   │   │   │   │   └── transactions/
│   │   │   │   │       └── page.tsx        # All transactions
│   │   │   │   │
│   │   │   │   ├── subscriptions/          # Billing management
│   │   │   │   │   ├── page.tsx            # Subscription list
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx        # Subscription detail
│   │   │   │   │   └── invoices/
│   │   │   │   │       └── page.tsx        # Invoice history
│   │   │   │   │
│   │   │   │   ├── analytics/              # Analytics & insights
│   │   │   │   │   ├── page.tsx            # Analytics hub
│   │   │   │   │   ├── revenue/
│   │   │   │   │   │   └── page.tsx        # Revenue metrics
│   │   │   │   │   ├── engagement/
│   │   │   │   │   │   └── page.tsx        # User engagement
│   │   │   │   │   ├── ai/
│   │   │   │   │   │   └── page.tsx        # AI usage stats
│   │   │   │   │   └── cohorts/
│   │   │   │   │       └── page.tsx        # Cohort analysis
│   │   │   │   │
│   │   │   │   ├── system/                 # System control
│   │   │   │   │   ├── page.tsx            # System overview
│   │   │   │   │   ├── flags/
│   │   │   │   │   │   ├── page.tsx        # Feature flags list
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx    # Edit flag
│   │   │   │   │   ├── announcements/
│   │   │   │   │   │   └── page.tsx        # Manage announcements
│   │   │   │   │   ├── maintenance/
│   │   │   │   │   │   └── page.tsx        # Maintenance mode
│   │   │   │   │   └── config/
│   │   │   │   │       └── page.tsx        # System configuration
│   │   │   │   │
│   │   │   │   ├── support/                # Support tools
│   │   │   │   │   ├── page.tsx            # Support dashboard
│   │   │   │   │   └── search/
│   │   │   │   │       └── page.tsx        # User search
│   │   │   │   │
│   │   │   │   ├── audit/                  # Audit log
│   │   │   │   │   └── page.tsx            # Audit log viewer
│   │   │   │   │
│   │   │   │   ├── admins/                 # Admin management
│   │   │   │   │   ├── page.tsx            # Admin list
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx        # Admin detail
│   │   │   │   │
│   │   │   │   └── api/                    # API Routes
│   │   │   │       │
│   │   │   │       ├── auth/
│   │   │   │       │   ├── [...nextauth]/
│   │   │   │       │   │   └── route.ts    # NextAuth handler
│   │   │   │       │   └── me/
│   │   │   │       │       └── route.ts    # Get current admin
│   │   │   │       │
│   │   │   │       ├── users/
│   │   │   │       │   ├── route.ts        # GET (list), POST (create)
│   │   │   │       │   └── [id]/
│   │   │   │       │       ├── route.ts    # GET, PATCH, DELETE
│   │   │   │       │       ├── suspend/
│   │   │   │       │       │   └── route.ts # POST suspend
│   │   │   │       │       ├── tokens/
│   │   │   │       │       │   └── grant/
│   │   │   │       │       │       └── route.ts # POST grant tokens
│   │   │   │       │       └── export/
│   │   │   │       │           └── route.ts # GET GDPR export
│   │   │   │       │
│   │   │   │       ├── tokens/
│   │   │   │       │   ├── overview/
│   │   │   │       │   │   └── route.ts    # GET overview stats
│   │   │   │       │   ├── transactions/
│   │   │   │       │   │   └── route.ts    # GET all transactions
│   │   │   │       │   └── packages/
│   │   │   │       │       └── route.ts    # GET, PUT packages
│   │   │   │       │
│   │   │   │       ├── subscriptions/
│   │   │   │       │   ├── route.ts        # GET list
│   │   │   │       │   └── [id]/
│   │   │   │       │       ├── route.ts    # GET detail
│   │   │   │       │       ├── cancel/
│   │   │   │       │       │   └── route.ts
│   │   │   │       │       └── refund/
│   │   │   │       │           └── route.ts
│   │   │   │       │
│   │   │   │       ├── analytics/
│   │   │   │       │   ├── overview/
│   │   │   │       │   │   └── route.ts    # GET dashboard metrics
│   │   │   │       │   ├── revenue/
│   │   │   │       │   │   └── route.ts    # GET revenue data
│   │   │   │       │   ├── users/
│   │   │   │       │   │   └── route.ts    # GET user analytics
│   │   │   │       │   └── ai/
│   │   │   │       │       └── route.ts    # GET AI usage
│   │   │   │       │
│   │   │   │       ├── system/
│   │   │   │       │   ├── health/
│   │   │   │       │   │   └── route.ts    # GET health check
│   │   │   │       │   ├── flags/
│   │   │   │       │   │   ├── route.ts    # GET all flags
│   │   │   │       │   │   └── [key]/
│   │   │   │       │   │       └── route.ts # PATCH flag
│   │   │   │       │   ├── maintenance/
│   │   │   │       │   │   └── route.ts    # POST toggle
│   │   │   │       │   └── announcement/
│   │   │   │       │       └── route.ts    # POST set
│   │   │   │       │
│   │   │   │       ├── audit/
│   │   │   │       │   └── route.ts        # GET audit log
│   │   │   │       │
│   │   │   │       └── webhooks/
│   │   │   │           └── stripe/
│   │   │   │               └── route.ts    # Stripe webhooks
│   │   │   │
│   │   │   ├── components/                 # React Components
│   │   │   │   │
│   │   │   │   ├── layout/                 # Layout components
│   │   │   │   │   ├── Sidebar.tsx         # Main navigation sidebar
│   │   │   │   │   ├── Header.tsx          # Top header with search, user menu
│   │   │   │   │   ├── PageWrapper.tsx     # Page container with title
│   │   │   │   │   └── MobileNav.tsx       # Mobile navigation
│   │   │   │   │
│   │   │   │   ├── users/                  # User-related components
│   │   │   │   │   ├── UserTable.tsx       # Data table for users
│   │   │   │   │   ├── UserDetail.tsx      # User detail card
│   │   │   │   │   ├── UserActions.tsx     # Dropdown actions menu
│   │   │   │   │   ├── UserFilters.tsx     # Filter sidebar
│   │   │   │   │   ├── UserSearch.tsx      # Search input
│   │   │   │   │   ├── SuspendDialog.tsx   # Suspend confirmation
│   │   │   │   │   ├── GrantTokensDialog.tsx # Grant tokens modal
│   │   │   │   │   └── ImpersonateBanner.tsx # Impersonation indicator
│   │   │   │   │
│   │   │   │   ├── tokens/                 # Token components
│   │   │   │   │   ├── TokenOverview.tsx   # Summary cards
│   │   │   │   │   ├── TokenChart.tsx      # Usage over time
│   │   │   │   │   ├── TransactionTable.tsx # Transaction list
│   │   │   │   │   └── PackageEditor.tsx   # Edit token packages
│   │   │   │   │
│   │   │   │   ├── analytics/              # Analytics components
│   │   │   │   │   ├── MetricCard.tsx      # Single metric display
│   │   │   │   │   ├── LineChart.tsx       # Time series chart
│   │   │   │   │   ├── BarChart.tsx        # Bar chart
│   │   │   │   │   ├── PieChart.tsx        # Distribution chart
│   │   │   │   │   ├── FunnelChart.tsx     # Conversion funnel
│   │   │   │   │   ├── CohortTable.tsx     # Retention cohort
│   │   │   │   │   └── DateRangePicker.tsx # Date filter
│   │   │   │   │
│   │   │   │   ├── subscriptions/          # Billing components
│   │   │   │   │   ├── SubscriptionTable.tsx
│   │   │   │   │   ├── SubscriptionDetail.tsx
│   │   │   │   │   ├── CancelDialog.tsx
│   │   │   │   │   ├── RefundDialog.tsx
│   │   │   │   │   └── InvoiceList.tsx
│   │   │   │   │
│   │   │   │   ├── system/                 # System components
│   │   │   │   │   ├── FeatureFlagList.tsx
│   │   │   │   │   ├── FeatureFlagEditor.tsx
│   │   │   │   │   ├── MaintenanceToggle.tsx
│   │   │   │   │   ├── AnnouncementEditor.tsx
│   │   │   │   │   └── SystemHealth.tsx
│   │   │   │   │
│   │   │   │   ├── audit/                  # Audit components
│   │   │   │   │   ├── AuditTable.tsx      # Audit log table
│   │   │   │   │   └── AuditFilters.tsx    # Filter by action, admin
│   │   │   │   │
│   │   │   │   └── ui/                     # shadcn/ui components
│   │   │   │       ├── button.tsx
│   │   │   │       ├── card.tsx
│   │   │   │       ├── dialog.tsx
│   │   │   │       ├── dropdown-menu.tsx
│   │   │   │       ├── input.tsx
│   │   │   │       ├── table.tsx
│   │   │   │       ├── tabs.tsx
│   │   │   │       ├── toast.tsx
│   │   │   │       ├── avatar.tsx
│   │   │   │       ├── badge.tsx
│   │   │   │       ├── select.tsx
│   │   │   │       ├── sheet.tsx
│   │   │   │       ├── skeleton.tsx
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── lib/                        # Utilities
│   │   │   │   ├── prisma.ts               # Prisma client singleton
│   │   │   │   ├── api.ts                  # API client (fetch wrapper)
│   │   │   │   ├── auth.ts                 # NextAuth configuration
│   │   │   │   ├── utils.ts                # General utilities (cn, formatters)
│   │   │   │   ├── permissions.ts          # RBAC helpers
│   │   │   │   └── audit.ts                # Audit logging helper
│   │   │   │
│   │   │   ├── hooks/                      # React hooks
│   │   │   │   ├── useUsers.ts             # User list with filters
│   │   │   │   ├── useUser.ts              # Single user
│   │   │   │   ├── useAnalytics.ts         # Analytics data
│   │   │   │   ├── useTokens.ts            # Token data
│   │   │   │   ├── useSubscriptions.ts     # Subscription data
│   │   │   │   ├── useAudit.ts             # Audit log
│   │   │   │   ├── useFeatureFlags.ts      # Feature flags
│   │   │   │   └── usePermission.ts        # Permission check
│   │   │   │
│   │   │   ├── types/                      # TypeScript types
│   │   │   │   ├── user.ts                 # User types
│   │   │   │   ├── subscription.ts         # Subscription types
│   │   │   │   ├── token.ts                # Token types
│   │   │   │   ├── analytics.ts            # Analytics types
│   │   │   │   ├── system.ts               # System/flag types
│   │   │   │   └── index.ts                # Re-exports
│   │   │   │
│   │   │   └── styles/
│   │   │       └── globals.css             # Global styles + Tailwind
│   │   │
│   │   ├── prisma/
│   │   │   ├── schema.prisma               # Database schema
│   │   │   └── migrations/                 # Migration history
│   │   │       └── YYYYMMDDHHMMSS_name/
│   │   │           └── migration.sql
│   │   │
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   └── logo.svg
│   │   │
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── api-gateway/                        # AI Gateway Service
│       │
│       ├── src/
│       │   │
│       │   ├── server.ts                   # Fastify server setup
│       │   │
│       │   ├── routes/
│       │   │   ├── v1/
│       │   │   │   ├── chat.ts             # /v1/chat/completions
│       │   │   │   ├── embeddings.ts       # /v1/embeddings
│       │   │   │   └── models.ts           # /v1/models
│       │   │   └── health.ts               # /health
│       │   │
│       │   ├── services/
│       │   │   ├── key-manager.ts          # API key rotation
│       │   │   ├── rate-limiter.ts         # Rate limiting
│       │   │   ├── credit-service.ts       # Credit management
│       │   │   ├── license-service.ts      # License validation
│       │   │   └── usage-tracker.ts        # Usage logging
│       │   │
│       │   ├── middleware/
│       │   │   ├── auth.ts                 # License validation
│       │   │   ├── rate-limit.ts           # Rate limit check
│       │   │   └── error-handler.ts        # Error handling
│       │   │
│       │   ├── providers/
│       │   │   ├── openai.ts               # OpenAI adapter
│       │   │   ├── anthropic.ts            # Claude adapter
│       │   │   └── gemini.ts               # Gemini adapter
│       │   │
│       │   ├── lib/
│       │   │   ├── prisma.ts               # Database client
│       │   │   ├── redis.ts                # Redis client
│       │   │   └── logger.ts               # Logging
│       │   │
│       │   └── types/
│       │       └── index.ts                # Type definitions
│       │
│       ├── package.json
│       ├── tsconfig.json
│       └── ecosystem.config.js             # PM2 config for gateway
│
├── docs/                                   # This documentation
│   ├── 00_MASTER_DOCUMENTATION.md
│   ├── 01_API_DATABASE_AUTH.md
│   ├── 02_DEPLOYMENT_SECURITY_MONETIZATION.md
│   ├── 03_FILE_REFERENCE.md
│   ├── 04_DEVELOPMENT_ROADMAP.md
│   └── 05_SUPERADMIN_STRUCTURE.md          # This file
│
├── scripts/
│   ├── deploy.sh                           # Full deployment
│   ├── deploy-dashboard.sh                 # Dashboard only
│   ├── deploy-gateway.sh                   # Gateway only
│   ├── backup-db.sh                        # Database backup
│   ├── restore-db.sh                       # Database restore
│   ├── seed.ts                             # Seed initial data
│   ├── create-admin.ts                     # Create admin user
│   └── generate-license.ts                 # Generate license key
│
├── nginx/
│   ├── zenner-admin.conf                   # Admin dashboard config
│   ├── zenner-api.conf                     # API gateway config
│   └── ssl-params.conf                     # SSL settings
│
├── docker-compose.yml                      # Local development DBs
├── ecosystem.config.js                     # PM2 config (all services)
├── package.json                            # Monorepo root
├── turbo.json                              # Turborepo config
├── .env.example                            # Environment template
└── README.md                               # Getting started
```

---

## KEY FILES EXPLAINED

### apps/dashboard/src/app/layout.tsx

```tsx
/**
 * Root layout for the admin dashboard.
 * 
 * RESPONSIBILITIES:
 * - Wrap app with providers (auth, theme, query client)
 * - Render sidebar and header
 * - Handle auth redirects
 * 
 * CONNECTS TO:
 * - lib/auth.ts (session provider)
 * - components/layout/Sidebar.tsx
 * - components/layout/Header.tsx
 */
```

### apps/dashboard/src/lib/prisma.ts

```typescript
/**
 * Prisma client singleton.
 * 
 * WHY SINGLETON:
 * - Prevents creating new connections on hot reload
 * - Manages connection pool efficiently
 * 
 * USED BY:
 * - All API routes that need database access
 * - Server components that fetch data
 */
```

### apps/dashboard/src/lib/permissions.ts

```typescript
/**
 * Role-based access control.
 * 
 * ROLES:
 * - support: Read-only, can impersonate
 * - admin: Can modify users, subscriptions
 * - superadmin: Full access including system config
 * 
 * USAGE:
 * - API routes check permissions before operations
 * - UI hides/shows features based on role
 */
```

### apps/api-gateway/src/services/key-manager.ts

```typescript
/**
 * API key rotation manager.
 * 
 * FEATURES:
 * - Round-robin selection across keys
 * - Per-key rate tracking
 * - Automatic cooldown on 429s
 * - Health checking
 * 
 * WHY NEEDED:
 * - Multiple API keys for higher throughput
 * - Automatic failover on rate limits
 */
```

### apps/api-gateway/src/middleware/auth.ts

```typescript
/**
 * License key validation middleware.
 * 
 * FLOW:
 * 1. Extract license key from Authorization header
 * 2. Verify against database
 * 3. Check device ID matches activation
 * 4. Verify not expired/suspended
 * 5. Attach user context to request
 * 
 * CONNECT TO:
 * - PostgreSQL: licenses, device_activations tables
 * - Redis: Cache license lookups
 */
```

---

## PRISMA SCHEMA OVERVIEW

```prisma
// prisma/schema.prisma

// Users and their data
model User { ... }
model Subscription { ... }
model TokenAccount { ... }
model TokenTransaction { ... }

// Licensing
model License { ... }
model DeviceActivation { ... }

// Analytics
model UserStatsDaily { ... }
model GlobalStatsDaily { ... }

// Admin
model AdminUser { ... }
model AuditLog { ... }

// System
model FeatureFlag { ... }
model SystemConfig { ... }
```

---

## NEXT.JS API ROUTE PATTERNS

```typescript
// app/api/users/route.ts - Collection routes

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth';

// GET /api/users - List users
export async function GET(request: NextRequest) {
  await requireAuth();
  await requirePermission('users.read');
  
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  
  const where = status ? { status } : {};
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { subscription: true, tokenAccount: true }
    }),
    prisma.user.count({ where })
  ]);
  
  return NextResponse.json({
    success: true,
    data: { users },
    meta: { page, limit, total }
  });
}
```

```typescript
// app/api/users/[id]/route.ts - Single resource routes

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePermission, logAudit } from '@/lib/auth';

// GET /api/users/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await requireAuth();
  await requirePermission('users.read');
  
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      subscription: true,
      tokenAccount: true,
      _count: { select: { sessions: true } }
    }
  });
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true, data: user });
}

// PATCH /api/users/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAuth();
  await requirePermission('users.update');
  
  const body = await request.json();
  
  const oldUser = await prisma.user.findUnique({ where: { id: params.id } });
  
  const user = await prisma.user.update({
    where: { id: params.id },
    data: body
  });
  
  await logAudit(admin.id, 'USER_UPDATE', 'user', params.id, oldUser, user);
  
  return NextResponse.json({ success: true, data: user });
}
```

---

## COMPONENT PATTERNS

### Data Table with Filters

```tsx
// components/users/UserTable.tsx

'use client';

import { useUsers } from '@/hooks/useUsers';
import { DataTable } from '@/components/ui/data-table';
import { UserFilters } from './UserFilters';
import { columns } from './columns';

export function UserTable() {
  const { users, isLoading, filters, setFilters, pagination, setPagination } = useUsers();
  
  return (
    <div className="flex gap-4">
      <UserFilters filters={filters} onChange={setFilters} />
      
      <div className="flex-1">
        <DataTable
          columns={columns}
          data={users}
          loading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>
    </div>
  );
}
```

### Action Dialogs

```tsx
// components/users/GrantTokensDialog.tsx

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Props {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GrantTokensDialog({ userId, open, onOpenChange, onSuccess }: Props) {
  const [amount, setAmount] = useState(100);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  async function handleGrant() {
    setLoading(true);
    try {
      await api.post(`/users/${userId}/tokens/grant`, { amount, reason });
      toast({ title: 'Tokens granted successfully' });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({ title: 'Failed to grant tokens', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant AI Credits</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            placeholder="Amount"
          />
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
          />
          <Button onClick={handleGrant} disabled={loading}>
            {loading ? 'Granting...' : 'Grant Tokens'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## HOOK PATTERNS

```typescript
// hooks/useUsers.ts

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';

interface Filters {
  status?: string;
  plan?: string;
  search?: string;
}

export function useUsers() {
  const [filters, setFilters] = useState<Filters>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', filters, pagination],
    queryFn: () => api.get('/users', {
      params: { ...filters, ...pagination }
    })
  });
  
  return {
    users: data?.data?.users || [],
    total: data?.meta?.total || 0,
    isLoading,
    filters,
    setFilters,
    pagination,
    setPagination,
    refetch
  };
}
```

---

## SCRIPTS

### create-admin.ts

```typescript
// scripts/create-admin.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const name = process.argv[3] || 'Admin';
  const role = process.argv[4] || 'admin';
  
  if (!email) {
    console.error('Usage: npx ts-node scripts/create-admin.ts <email> [name] [role]');
    process.exit(1);
  }
  
  // Generate random password
  const password = randomBytes(12).toString('hex');
  const hash = await bcrypt.hash(password, 12);
  
  const admin = await prisma.adminUser.create({
    data: {
      email,
      name,
      passwordHash: hash,
      role
    }
  });
  
  console.log('✅ Admin created!');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role: ${role}`);
  console.log('\n⚠️  Save this password - it cannot be recovered!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

This document provides everything needed to understand and build the SuperAdmin system from scratch. Copy the relevant sections to your new workspace for the agent to have full context.
