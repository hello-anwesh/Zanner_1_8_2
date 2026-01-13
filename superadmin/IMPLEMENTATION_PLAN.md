# SuperAdmin Implementation Plan
## Step-by-Step Development Guide

---

## PHASE 1: PROJECT SETUP (Days 1-3)

### 1.1 Initialize Monorepo

```bash
# Create monorepo structure
mkdir -p superadmin/{apps/{dashboard,api},packages/{shared,ui}}
cd superadmin

# Initialize root package.json
npm init -y

# Install turbo for monorepo management
npm install turbo -D
```

### 1.2 Setup Dashboard (Next.js)

```bash
cd apps/dashboard
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-import-alias

# Install dependencies
npm install @tanstack/react-query @tanstack/react-table zustand
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install react-hook-form @hookform/resolvers zod
npm install recharts date-fns
npm install next-auth@beta

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input table dialog dropdown-menu
npx shadcn-ui@latest add avatar badge tabs toast sheet separator
```

### 1.3 Setup API (Fastify + Prisma)

```bash
cd apps/api
npm init -y
npm install fastify @fastify/cors @fastify/jwt @fastify/cookie
npm install @prisma/client bcryptjs zod
npm install -D typescript @types/node prisma ts-node-dev

# Initialize Prisma
npx prisma init
```

### 1.4 Docker Compose for Local Dev

```yaml
# superadmin/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: zenner_admin
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## PHASE 2: DATABASE & AUTH (Days 4-7)

### 2.1 Prisma Schema

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ ADMIN SYSTEM ============

model AdminUser {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String
  passwordHash  String    @map("password_hash")
  role          AdminRole @default(SUPPORT)
  permissions   Json      @default("[]")
  
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  auditLogs     AuditLog[]
  
  @@map("admin_users")
}

enum AdminRole {
  SUPPORT
  ADMIN
  SUPERADMIN
}

model AuditLog {
  id          String   @id @default(uuid())
  adminId     String   @map("admin_id")
  admin       AdminUser @relation(fields: [adminId], references: [id])
  
  action      String
  entityType  String?  @map("entity_type")
  entityId    String?  @map("entity_id")
  
  oldValue    Json?    @map("old_value")
  newValue    Json?    @map("new_value")
  
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")
  
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@map("audit_log")
}

// ============ USER SYSTEM ============

model User {
  id              String   @id @default(uuid())
  email           String   @unique
  name            String?
  avatarUrl       String?  @map("avatar_url")
  
  status          UserStatus @default(PENDING)
  plan            UserPlan   @default(FREE)
  
  emailVerifiedAt DateTime? @map("email_verified_at")
  lastActiveAt    DateTime? @map("last_active_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")
  
  metadata        Json      @default("{}")
  
  subscription    Subscription?
  tokenAccount    TokenAccount?
  sessions        UserSession[]
  transactions    TokenTransaction[]
  
  @@map("users")
}

enum UserStatus {
  PENDING
  ACTIVE
  SUSPENDED
  BANNED
}

enum UserPlan {
  FREE
  PRO_MONTHLY
  PRO_ANNUAL
  TEAM
  ENTERPRISE
}

// ============ BILLING ============

model Subscription {
  id                    String   @id @default(uuid())
  userId                String   @unique @map("user_id")
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  plan                  String
  status                SubscriptionStatus
  
  stripeCustomerId      String?  @map("stripe_customer_id")
  stripeSubscriptionId  String?  @map("stripe_subscription_id")
  
  currentPeriodStart    DateTime @map("current_period_start")
  currentPeriodEnd      DateTime @map("current_period_end")
  canceledAt            DateTime? @map("canceled_at")
  
  createdAt             DateTime @default(now()) @map("created_at")
  
  @@map("subscriptions")
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  PAUSED
  TRIALING
}

// ============ TOKEN ECONOMY ============

model TokenAccount {
  id              String   @id @default(uuid())
  userId          String   @unique @map("user_id")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  aiCredits       Int      @default(100) @map("ai_credits")
  embeddingCredits Int     @default(50) @map("embedding_credits")
  voiceCredits    Int      @default(25) @map("voice_credits")
  
  dailyLimit      Int      @default(50) @map("daily_limit")
  monthlyLimit    Int      @default(1000) @map("monthly_limit")
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@map("token_accounts")
}

model TokenTransaction {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type      TransactionType
  amount    Int
  balance   Int
  source    String
  
  metadata  Json     @default("{}")
  createdAt DateTime @default(now()) @map("created_at")
  
  @@map("token_transactions")
}

enum TransactionType {
  GRANT
  CONSUME
  PURCHASE
  REFUND
  EXPIRE
}

// ============ SESSIONS ============

model UserSession {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  startTime       DateTime @map("start_time")
  endTime         DateTime? @map("end_time")
  mode            String
  durationSeconds Int?     @map("duration_seconds")
  status          String
  
  deviceId        String?  @map("device_id")
  appVersion      String?  @map("app_version")
  
  createdAt       DateTime @default(now()) @map("created_at")
  
  @@map("user_sessions")
}

// ============ SYSTEM ============

model FeatureFlag {
  id                String   @id @default(uuid())
  key               String   @unique
  
  enabled           Boolean  @default(false)
  rolloutPercentage Int      @default(0) @map("rollout_percentage")
  
  targetUserIds     String[] @map("target_user_ids")
  targetPlans       String[] @map("target_plans")
  
  metadata          Json     @default("{}")
  
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  
  @@map("feature_flags")
}

model SystemConfig {
  id    String @id @default(uuid())
  key   String @unique
  value Json
  
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("system_config")
}
```

### 2.2 Admin Auth Implementation

```typescript
// apps/api/src/routes/auth.ts
import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/login', async (request, reply) => {
    const { email, password } = loginSchema.parse(request.body);
    
    const admin = await prisma.adminUser.findUnique({
      where: { email }
    });
    
    if (!admin || !await bcrypt.compare(password, admin.passwordHash)) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }
    
    const token = fastify.jwt.sign({ 
      id: admin.id, 
      email: admin.email,
      role: admin.role 
    });
    
    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() }
    });
    
    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'LOGIN',
        ipAddress: request.ip,
        userAgent: request.headers['user-agent']
      }
    });
    
    return { token, admin: { id: admin.id, email: admin.email, role: admin.role } };
  });
  
  fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request) => {
    const admin = await prisma.adminUser.findUnique({
      where: { id: request.user.id },
      select: { id: true, email: true, name: true, role: true }
    });
    return admin;
  });
};
```

---

## PHASE 3: USER MANAGEMENT (Days 8-14)

### 3.1 User List API

```typescript
// apps/api/src/routes/users.ts
import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const listUsersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED']).optional(),
  plan: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // List users
  fastify.get('/', async (request, reply) => {
    const params = listUsersSchema.parse(request.query);
    const { page, limit, status, plan, search, sortBy, sortOrder } = params;
    
    const where: any = {};
    if (status) where.status = status;
    if (plan) where.plan = plan;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          subscription: true,
          tokenAccount: true,
          _count: { select: { sessions: true } }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where })
    ]);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  });
  
  // Get single user
  fastify.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        tokenAccount: true,
        sessions: { take: 10, orderBy: { createdAt: 'desc' } },
        transactions: { take: 20, orderBy: { createdAt: 'desc' } }
      }
    });
    
    if (!user) {
      throw fastify.httpErrors.notFound('User not found');
    }
    
    return user;
  });
  
  // Suspend user
  fastify.post('/:id/suspend', async (request) => {
    const { id } = request.params as { id: string };
    const { reason } = request.body as { reason?: string };
    
    const user = await prisma.user.update({
      where: { id },
      data: { 
        status: 'SUSPENDED',
        metadata: { suspendedReason: reason, suspendedAt: new Date() }
      }
    });
    
    // Log action
    await prisma.auditLog.create({
      data: {
        adminId: request.user.id,
        action: 'SUSPEND_USER',
        entityType: 'user',
        entityId: id,
        newValue: { reason }
      }
    });
    
    return user;
  });
  
  // Grant tokens
  fastify.post('/:id/tokens/grant', async (request) => {
    const { id } = request.params as { id: string };
    const { amount, type, reason } = request.body as { 
      amount: number; 
      type: 'ai' | 'embedding' | 'voice';
      reason?: string;
    };
    
    const field = {
      ai: 'aiCredits',
      embedding: 'embeddingCredits',
      voice: 'voiceCredits'
    }[type];
    
    const account = await prisma.tokenAccount.update({
      where: { userId: id },
      data: { [field]: { increment: amount } }
    });
    
    await prisma.tokenTransaction.create({
      data: {
        userId: id,
        type: 'GRANT',
        amount,
        balance: account[field as keyof typeof account] as number,
        source: 'admin_grant',
        metadata: { reason, grantedBy: request.user.id }
      }
    });
    
    return account;
  });
};
```

### 3.2 User List Component

```tsx
// apps/dashboard/src/app/users/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, MoreVertical } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, search }],
    queryFn: () => api.get('/users', { params: { page, search, limit: 20 } })
  });
  
  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/10 text-green-500',
    PENDING: 'bg-yellow-500/10 text-yellow-500',
    SUSPENDED: 'bg-red-500/10 text-red-500',
    BANNED: 'bg-gray-500/10 text-gray-500',
  };
  
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            {data?.pagination.total || 0} total users
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>AI Credits</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.users.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link href={`/users/${user.id}`} className="flex items-center gap-3 hover:opacity-80">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name || 'No name'}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[user.status]}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.plan}</TableCell>
                <TableCell>{user._count.sessions}</TableCell>
                <TableCell>{user.tokenAccount?.aiCredits ?? 0}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Page {page} of {data?.pagination.totalPages || 1}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page >= (data?.pagination.totalPages || 1)}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## PHASE 4: ANALYTICS DASHBOARD (Days 15-21)

### 4.1 Analytics API

```typescript
// apps/api/src/routes/analytics.ts
import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/overview', async () => {
    const now = new Date();
    const today = startOfDay(now);
    const weekAgo = subDays(today, 7);
    const monthAgo = subDays(today, 30);
    
    const [
      totalUsers,
      activeToday,
      activeWeekly,
      activeMonthly,
      newUsersToday,
      subscriptions,
      aiUsageToday
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastActiveAt: { gte: today } } }),
      prisma.user.count({ where: { lastActiveAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { lastActiveAt: { gte: monthAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.tokenTransaction.aggregate({
        where: { 
          type: 'CONSUME',
          createdAt: { gte: today }
        },
        _sum: { amount: true }
      })
    ]);
    
    const activeSubscriptions = subscriptions.find(s => s.status === 'ACTIVE')?._count || 0;
    const mrr = activeSubscriptions * 10; // Simplified - would calc from actual prices
    
    return {
      users: {
        total: totalUsers,
        activeToday,
        activeWeekly,
        activeMonthly,
        newToday: newUsersToday
      },
      revenue: {
        mrr,
        arr: mrr * 12,
        activeSubscriptions,
        conversionRate: totalUsers > 0 ? (activeSubscriptions / totalUsers * 100).toFixed(1) : 0
      },
      ai: {
        creditsUsedToday: aiUsageToday._sum.amount || 0
      }
    };
  });
  
  fastify.get('/users/daily', async (request) => {
    const { days = 30 } = request.query as { days?: number };
    
    const data = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_users
      FROM users
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
    
    return data;
  });
};
```

### 4.2 Dashboard Overview Component

```tsx
// apps/dashboard/src/app/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Activity, Zap } from 'lucide-react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview')
  });
  
  const stats = [
    {
      title: 'Total Users',
      value: data?.users.total || 0,
      change: `+${data?.users.newToday || 0} today`,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'MRR',
      value: `$${data?.revenue.mrr || 0}`,
      change: `${data?.revenue.activeSubscriptions || 0} active`,
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Active Today',
      value: data?.users.activeToday || 0,
      change: `of ${data?.users.total || 0} total`,
      icon: Activity,
      color: 'text-orange-500'
    },
    {
      title: 'AI Credits Used',
      value: data?.ai.creditsUsedToday || 0,
      change: 'today',
      icon: Zap,
      color: 'text-purple-500'
    }
  ];
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Charts and more widgets would go here */}
    </div>
  );
}
```

---

## REMAINING PHASES

### Phase 5: Token Economy (Days 22-28)
- Token dashboard with usage charts
- Grant/revoke UI
- Transaction history
- Package configuration

### Phase 6: Billing Integration (Days 29-35)
- Stripe webhook handler
- Subscription management
- Revenue analytics
- Refund processing

### Phase 7: System Control (Days 36-42)
- Feature flags CRUD
- Kill switches
- Maintenance mode
- Announcement system

### Phase 8: Polish & Deploy (Days 43-49)
- Error handling
- Loading states
- Testing
- Documentation
- Deployment

---

## DEPLOYMENT CHECKLIST

- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Admin user created
- [ ] Stripe webhooks configured
- [ ] SSL certificates active
- [ ] Rate limiting enabled
- [ ] Audit logging verified
- [ ] Backup schedule configured
- [ ] Monitoring alerts set up
- [ ] Documentation complete

---

*This is a living document - update as implementation progresses.*
