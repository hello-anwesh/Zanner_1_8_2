# Zenner SaaS Admin - Deployment Architecture

**Document Version:** 1.0  
**Created:** January 2026  
**Purpose:** Complete deployment guide and infrastructure setup

---

## 🏗️ Production Architecture

```
                           ┌─────────────┐
                           │  CloudFlare │
                           │    (CDN)    │
                           └──────┬──────┘
                                  │
              ┌───────────────────┴───────────────────┐
              │                                       │
              ▼                                       ▼
    ┌──────────────────┐                  ┌──────────────────┐
    │   Frontend CDN   │                  │   API Gateway    │
    │  (Static Files)  │                  │  (Load Balancer) │
    │                  │                  │                  │
    │  admin.zenner.app│                  │ api.zenner.app   │
    └──────────────────┘                  └────────┬─────────┘
                                                   │
                                   ┌───────────────┼───────────────┐
                                   │               │               │
                                   ▼               ▼               ▼
                            ┌──────────┐   ┌──────────┐   ┌──────────┐
                            │ API Node │   │ API Node │   │ API Node │
                            │    #1    │   │    #2    │   │    #3    │
                            └─────┬────┘   └─────┬────┘   └─────┬────┘
                                  │              │              │
                        ┌─────────┴──────────────┴──────────────┴─────────┐
                        │                                                  │
                        ▼                                                  ▼
                 ┌──────────────┐                                  ┌──────────────┐
                 │  PostgreSQL  │                                  │    Redis     │
                 │  (Primary)   │◄──────┐                          │   (Cache)    │
                 └──────────────┘       │                          └──────────────┘
                        │               │
                        │               │
                        ▼               │
                 ┌──────────────┐       │
                 │  PostgreSQL  │       │
                 │  (Replica)   │───────┘
                 └──────────────┘
                     (Read-only)
```

---

## 🚀 Deployment Options

### Option 1: AWS (Recommended for Scale)

**Services Used:**
```
Frontend:
├── CloudFront (CDN)
├── S3 (Static hosting)
└── Route 53 (DNS)

Backend API:
├── Application Load Balancer (ALB)
├── ECS Fargate (Container orchestration)
│   └── Auto Scaling (3-10 containers)
└── ECR (Docker image registry)

Database:
├── RDS PostgreSQL (Multi-AZ)
│   ├── Primary (us-east-1a)
│   └── Replica (us-east-1b)
└── ElastiCache Redis (Cluster mode)

Monitoring:
├── CloudWatch (Logs, metrics, alarms)
└── X-Ray (Distributed tracing)

Storage:
└── S3 (Data exports, backups)
```

**Estimated Monthly Cost:**
```
ECS Fargate (3 tasks, 0.5vCPU, 1GB):    ~$65
RDS PostgreSQL (db.t4g.medium):         ~$75
ElastiCache Redis (cache.t4g.small):    ~$25
ALB:                                    ~$25
CloudFront + S3:                        ~$10
CloudWatch:                             ~$10
──────────────────────────────────────────
Total:                                  ~$210/month
```

---

### Option 2: DigitalOcean (Cost-Effective)

**Services Used:**
```
Frontend:
└── Vercel (Free tier or $20/month)

Backend API:
├── App Platform ($12/month per container)
└── Container Registry

Database:
├── Managed PostgreSQL ($15/month)
└── Managed Redis ($15/month)

Storage:
└── Spaces ($5/month)
```

**Estimated Monthly Cost:**
```
Vercel Pro:               $20
App Platform (2 nodes):   $24
PostgreSQL:               $15
Redis:                    $15
Spaces:                    $5
──────────────────────────────
Total:                    $79/month
```

---

### Option 3: Vercel + Railway (Simplest)

**Services Used:**
```
Frontend:
└── Vercel (Automatic GitHub deployments)

Backend API:
└── Railway ($10/month base + usage)

Database:
├── Railway PostgreSQL ($5/month for 1GB)
└── Railway Redis ($5/month)
```

**Estimated Monthly Cost:**
```
Vercel (Free or Pro):     $0-20
Railway:                  ~$30-50
──────────────────────────────
Total:                    $30-70/month
```

**Recommendation:** Start with **Option 3 (Vercel + Railway)** for MVP, migrate to **Option 1 (AWS)** when scaling to 10,000+ users.

---

## 📦 Dockerization

### Backend API Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start app
CMD ["node", "dist/index.js"]
```

### Docker Compose (Local Development)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: zenner_admin
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://admin:dev_password@postgres:5432/zenner_admin
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev_jwt_secret_change_in_production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

---

## 🔧 Environment Variables

### Backend API (.env)
```bash
# Server
NODE_ENV=production
PORT=4000
API_BASE_URL=https://api.zenner.app

# Database
DATABASE_URL=postgresql://user:pass@host:5432/zenner_admin
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://host:6379
REDIS_TTL=300  # Default cache TTL (5 min)

# JWT
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRY=8h  # 8 hours
REFRESH_TOKEN_EXPIRY=7d  # 7 days

# CORS
ALLOWED_ORIGINS=https://admin.zenner.app,https://zenner.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=100

# Email (SendGrid or AWS SES)
EMAIL_FROM=noreply@zenner.app
SENDGRID_API_KEY=your_sendgrid_key
# OR
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret

# Stripe (for subscription management)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info  # debug, info, warn, error
```

### Frontend (.env)
```bash
VITE_API_URL=https://api.zenner.app
VITE_WS_URL=wss://api.zenner.app
VITE_ENABLE_ANALYTICS=true
```

---

## 🚀 CI/CD Pipeline (GitHub Actions)

### Frontend Deployment (.github/workflows/deploy-frontend.yml)
```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
        
      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

### Backend Deployment (.github/workflows/deploy-backend.yml)
```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
        
      - name: Run tests
        working-directory: ./backend
        run: npm test
        
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
        
      - name: Build, tag, and push image to ECR
        working-directory: ./backend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: zenner-admin-api
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster zenner-admin-cluster \
            --service zenner-admin-api \
            --force-new-deployment
```

---

## 📊 Database Migrations

### Prisma Migration Workflow
```bash
# Development: Create migration
npm run prisma:migrate:dev

# Production: Apply migrations
npm run prisma:migrate:deploy

# Generate Prisma Client
npm run prisma:generate
```

### Migration Script (package.json)
```json
{
  "scripts": {
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:generate": "prisma generate",
    "db:seed": "ts-node prisma/seed.ts",
    "db:reset": "prisma migrate reset"
  }
}
```

---

## 🔐 Security Checklist

### Pre-Deployment
- [ ] HTTPS only (no HTTP)
- [ ] Environment variables secure (not in code)
- [ ] API keys encrypted at rest
- [ ] Passwords hashed (bcrypt, rounds >= 10)
- [ ] JWT secret is strong (64+ chars)
- [ ] CORS configured (whitelist only)
- [ ] Rate limiting enabled
- [ ] SQL injection protection (use ORM)
- [ ] XSS protection (sanitize inputs)
- [ ] CSRF tokens (for forms)
- [ ] Helmet.js enabled (security headers)
- [ ] Database backups automated
- [ ] Audit logs enabled
- [ ] MFA required for super_admin

### Post-Deployment
- [ ] Penetration testing
- [ ] OWASP Top 10 review
- [ ] Dependency vulnerability scan
- [ ] SSL certificate monitoring
- [ ] Log monitoring (Sentry, DataDog)

---

## 📈 Monitoring & Alerts

### Health Checks
```typescript
// Backend health endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis
    await redis.ping();
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      error: error.message 
    });
  }
});
```

### Alerts (AWS CloudWatch)
```
API Error Rate > 1%          → Send SNS notification
Database CPU > 80%           → Send SNS notification
API Response Time > 500ms    → Send SNS notification
Redis Memory > 90%           → Send SNS notification
ECS Task Unhealthy           → Auto-restart + notify
```

---

## 🔄 Backup & Recovery

### Database Backups
```bash
# Automated daily backups (AWS RDS)
- Backup retention: 7 days
- Backup window: 02:00-03:00 UTC
- Point-in-time recovery: Enabled

# Manual backup
pg_dump -h db-host -U admin -d zenner_admin > backup.sql

# Restore
psql -h db-host -U admin -d zenner_admin < backup.sql
```

### Data Export Storage
```
S3 Bucket: zenner-user-exports
Lifecycle: Delete after 7 days
Encryption: AES-256
Access: Pre-signed URLs only
```

---

## 🎯 Deployment Checklist

### First-Time Deployment
1. [ ] Provision infrastructure (AWS/DO/Railway)
2. [ ] Configure DNS (admin.zenner.app, api.zenner.app)
3. [ ] Set up SSL certificates
4. [ ] Create database (PostgreSQL)
5. [ ] Create Redis instance
6. [ ] Run database migrations
7. [ ] Seed initial admin user
8. [ ] Deploy backend API
9. [ ] Deploy frontend
10. [ ] Configure monitoring (Sentry, logs)
11. [ ] Set up backups
12. [ ] Test health checks
13. [ ] Smoke test (login, view dashboard)

### Routine Deployments
1. [ ] Run tests locally
2. [ ] Create PR, get code review
3. [ ] Merge to main
4. [ ] GitHub Actions triggers build
5. [ ] Tests run in CI
6. [ ] Docker image built
7. [ ] Deployed to production
8. [ ] Health check passes
9. [ ] Smoke test

---

## 📝 Runbook

### Common Operations

**Scale API instances:**
```bash
aws ecs update-service \
  --cluster zenner-admin-cluster \
  --service zenner-admin-api \
  --desired-count 5
```

**View logs:**
```bash
aws logs tail /ecs/zenner-admin-api --follow
```

**Database query (read-only):**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

**Clear Redis cache:**
```bash
redis-cli FLUSHALL
```

---

**End of Deployment Guide**

**All 7 documentation files created! ✅**

---

## 📚 Complete Documentation Index

1. ✅ **SAAS_ADMIN_OVERVIEW.md** - Big picture, what to build
2. ✅ **SAAS_ADMIN_DATABASE_SCHEMA.md** - Complete DB schema
3. ✅ **SAAS_ADMIN_API_SPECIFICATION.md** - All API endpoints
4. ✅ **SAAS_ADMIN_TECH_STACK.md** - Technology recommendations
5. ✅ **SAAS_ADMIN_REQUIREMENTS.md** - Detailed feature requirements
6. ✅ **SAAS_ADMIN_UI_MOCKUPS.md** - UI design with ASCII mockups
7. ✅ **SAAS_ADMIN_DEPLOYMENT.md** - This document (deployment guide)

**Start with #1, work sequentially through #7.**
