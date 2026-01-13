# ZENNER ECOSYSTEM - MASTER DOCUMENTATION (Part 5)
## Development Workflow, Best Practices & Future Roadmap

---

# 14. DEVELOPMENT WORKFLOW

## Project Setup

### Prerequisites

```bash
# Required
- Node.js 20+
- Rust (via rustup)
- PostgreSQL 16
- Redis (optional, for rate limiting)

# macOS specific
- Xcode Command Line Tools

# Windows specific
- Visual Studio Build Tools
- WebView2 runtime

# Linux specific
- webkit2gtk-4.0
- libayatana-appindicator3
```

### Clone & Install

```bash
# Clone repository
git clone https://github.com/your-org/zenner.git
cd zenner

# Install frontend dependencies
npm install

# Install Tauri CLI
cargo install tauri-cli

# Install Rust dependencies
cd src-tauri
cargo build

# Run in development
npm run tauri dev
```

### Environment Setup

```bash
# .env.local (frontend)
VITE_API_URL=http://localhost:4000
VITE_SYNC_URL=http://localhost:5000

# src-tauri/.env (Rust - optional)
# Tauri reads from tauri.conf.json
```

## Development Commands

### Client App

```bash
# Development (with hot reload)
npm run tauri dev

# Build for current platform
npm run tauri build

# Build for specific platform
npm run tauri build -- --target x86_64-pc-windows-msvc
npm run tauri build -- --target x86_64-apple-darwin
npm run tauri build -- --target x86_64-unknown-linux-gnu

# Frontend only (without Tauri)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

### SuperAdmin

```bash
cd superadmin/apps/dashboard

# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Database migrations
npx prisma migrate dev      # Development
npx prisma migrate deploy   # Production
npx prisma generate         # Regenerate client
npx prisma studio           # Open database GUI
```

### API Gateway

```bash
cd api-gateway

# Development
npm run dev

# Build
npm run build

# Start production
npm start

# PM2 (production)
pm2 start ecosystem.config.js
pm2 logs
pm2 restart all
pm2 stop all
```

## Git Workflow

### Branch Strategy

```
main          ← Production releases
  │
  ├── develop ← Integration branch
  │     │
  │     ├── feature/add-cloud-sync
  │     ├── feature/new-ai-model
  │     └── fix/session-counter
  │
  └── release/1.2.0 ← Release candidates
```

### Commit Convention

```
type(scope): description

Types:
- feat:     New feature
- fix:      Bug fix
- docs:     Documentation
- style:    Formatting (no code change)
- refactor: Code restructuring
- perf:     Performance improvement
- test:     Tests
- chore:    Build/config changes

Examples:
feat(ai): add GPT-4 Turbo support
fix(timer): session count not persisting
docs(readme): update installation steps
refactor(coach): extract memory orchestration
```

### Pull Request Template

```markdown
## Description
<!-- What does this PR do? -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] Tested on multiple platforms

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors/warnings
```

## Code Style Guidelines

### TypeScript

```typescript
// Use explicit types
function calculateDuration(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / 1000;
}

// Use interfaces for objects
interface SessionData {
  id: string;
  startTime: Date;
  mode: 'focus' | 'break';
}

// Use enums for fixed values
enum SessionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

// Async/await over promises
async function fetchUser(id: string): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

// Use early returns
function validateSession(session: Session): boolean {
  if (!session.id) return false;
  if (!session.startTime) return false;
  return true;
}
```

### React Components

```tsx
// Function components with explicit types
interface TimerProps {
  duration: number;
  onComplete: () => void;
  className?: string;
}

export function Timer({ duration, onComplete, className }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    if (timeLeft === 0) {
      onComplete();
    }
  }, [timeLeft, onComplete]);
  
  return (
    <div className={className}>
      {formatTime(timeLeft)}
    </div>
  );
}

// Named exports, not default
export function Timer() {}  // ✓
export default Timer;       // ✗
```

### Services

```typescript
// Singleton pattern for services
class DatabaseService {
  private static instance: DatabaseService;
  private db: Database | null = null;
  
  private constructor() {}
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }
  
  async init(): Promise<void> {
    // Initialize database
  }
}

// Export singleton
export const databaseService = DatabaseService.getInstance();
```

## Testing

### Unit Tests

```typescript
// services/ai/CoachService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { coachService } from './CoachService';

describe('CoachService', () => {
  it('should build system prompt with user context', async () => {
    const prompt = await coachService.buildSystemPrompt({
      userName: 'Anwesh',
      goals: ['Focus for 4 hours daily'],
    });
    
    expect(prompt).toContain('Anwesh');
    expect(prompt).toContain('Focus for 4 hours');
  });
  
  it('should handle empty context gracefully', async () => {
    const prompt = await coachService.buildSystemPrompt({});
    expect(prompt).toBeDefined();
    expect(prompt.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
// tests/integration/session-flow.test.ts
import { test, expect } from '@playwright/test';

test('complete focus session flow', async ({ page }) => {
  await page.goto('/');
  
  // Start session
  await page.click('[data-testid="start-button"]');
  expect(await page.locator('[data-testid="timer-status"]')).toHaveText('Running');
  
  // Wait for session to complete (use mock timer)
  await page.waitForSelector('[data-testid="session-complete"]');
  
  // Verify session logged
  await page.goto('/analytics');
  expect(await page.locator('[data-testid="session-count"]')).toContainText('1');
});
```

### E2E Test Setup

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:1420',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run tauri dev',
    url: 'http://localhost:1420',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

# 15. FUTURE ROADMAP

## Phase 1: Foundation (Current)

### Completed ✅

- [x] Core timer functionality
- [x] Zeni AI coach with memory
- [x] Journal with AI reflections
- [x] SQLite persistence
- [x] Multiple AI providers
- [x] Spotify/YouTube integration
- [x] Binaural beat generator
- [x] Cross-platform build (macOS, Windows, Linux)
- [x] Backup/restore system

### In Progress 🚧

- [ ] SuperAdmin dashboard foundation
- [ ] API Gateway with rate limiting
- [ ] License key system
- [ ] Token credit system

## Phase 2: Monetization (Next 2 Months)

### Server Infrastructure

```
Priority: HIGH

Tasks:
- [ ] Set up VPS with NGINX
- [ ] Deploy PostgreSQL + Redis
- [ ] Deploy SuperAdmin dashboard
- [ ] Deploy API Gateway
- [ ] SSL certificates
- [ ] Monitoring (Sentry, Axiom)
```

### Stripe Integration

```
Priority: HIGH

Tasks:
- [ ] Stripe account setup
- [ ] Checkout flow
- [ ] Webhook handlers
- [ ] Subscription management
- [ ] Invoice generation
```

### License System

```
Priority: HIGH

Tasks:
- [ ] License key generation
- [ ] Activation flow
- [ ] Device management
- [ ] Heartbeat system
- [ ] Offline validation
```

## Phase 3: Cloud Sync (Month 3-4)

### Sync Architecture

```
Priority: MEDIUM

Tasks:
- [ ] Design sync protocol
- [ ] Conflict resolution strategy
- [ ] Offline queue
- [ ] Delta sync (only changes)
- [ ] Sync settings UI
```

### Data Sync

```
Tables to sync:
- sessions
- journal_entries
- training_profile
- conversation_summaries (not full messages)

NOT synced (too large):
- conversation_messages
- rag_documents
```

## Phase 4: Team Features (Month 5-6)

### Team Management

```
Priority: LOW

Tasks:
- [ ] Team creation
- [ ] Invite system
- [ ] Role management (admin, member)
- [ ] Shared dashboards
- [ ] Team analytics
```

### Accountability

```
Priority: MEDIUM

Tasks:
- [ ] Accountability partners
- [ ] Shared goals
- [ ] Progress visibility
- [ ] Nudge system
```

## Phase 5: Advanced AI (Month 7+)

### Local LLM Support

```
Priority: LOW

Tasks:
- [ ] Bundle small LLM (Phi-3, Gemma-2B)
- [ ] Offline AI capabilities
- [ ] Hybrid mode (local + cloud)
```

### Advanced Memory

```
Priority: MEDIUM

Tasks:
- [ ] Vector embeddings (local)
- [ ] Semantic search
- [ ] Long-term memory synthesis
- [ ] Forgetting curve
```

### Voice Features

```
Priority: LOW

Tasks:
- [ ] Voice commands
- [ ] Continuous listening mode
- [ ] Voice journaling
- [ ] Conversation mode
```

---

# 16. IMPROVEMENT OPPORTUNITIES

## Current Issues (Must Fix)

| Issue | Impact | Solution | Priority |
|-------|--------|----------|----------|
| Chat in localStorage | Data loss risk | Use ConversationManager + SQLite | 🔴 HIGH |
| RAG in localStorage | Performance | Move to SQLite table | 🟡 MEDIUM |
| No cloud backup | Single device | Implement SyncService | 🟡 MEDIUM |
| Session counter reset | UX bug | Fixed ✅ | ✅ DONE |

## Performance Optimizations

| Area | Current | Target | Approach |
|------|---------|--------|----------|
| App startup | ~3s | <1.5s | Lazy load services |
| AI response | ~2s | <1s | Response streaming |
| Memory usage | ~512MB | <256MB | Cleanup unused state |
| Bundle size | ~15MB | <10MB | Tree shaking, lazy routes |

## Code Quality Improvements

| Area | Current | Target |
|------|---------|--------|
| Test coverage | ~10% | >60% |
| TypeScript strict | Partial | Full |
| ESLint errors | ~50 | 0 |
| Unused code | Present | Removed |

## UX Enhancements

| Feature | Description | Priority |
|---------|-------------|----------|
| Keyboard shortcuts | Cmd+1-5 for views | 🟡 MEDIUM |
| Notification sounds | Custom notification audio | 🟢 LOW |
| Widget themes | More color options | 🟢 LOW |
| Tutorial mode | Interactive onboarding | 🟡 MEDIUM |
| Quick add journal | Shortcut for journal entry | 🟢 LOW |

---

# 17. QUICK REFERENCE

## Common Tasks

### Add a New AI Provider

1. Create `services/ai/providers/NewProvider.ts`
2. Implement `AIProvider` interface
3. Add to `AIService.providers` map
4. Add UI in `AISettingsView.tsx`

### Add a New Settings Page

1. Add card in `SettingsHub.tsx` (SETTINGS_CARDS array)
2. Create view component in `components/settings/`
3. Add view type in `App.tsx` (View type)
4. Add render condition in `App.tsx`
5. Import and wire up

### Add a SQLite Table

1. Add CREATE TABLE in `DatabaseService.createTables()`
2. Add migration in `MigrationService.MIGRATIONS`
3. Create/update types in `services/db/types.ts`
4. Add CRUD methods to relevant service

### Add a Tauri Command

1. Add function in `src-tauri/src/lib.rs`
2. Add `#[tauri::command]` attribute
3. Register in `invoke_handler`
4. Call from frontend with `invoke('command_name')`

## Important Files to Know

| File | Why It's Important |
|------|-------------------|
| `App.tsx` | Central hub - state, routing, initialization |
| `DatabaseService.ts` | All SQLite operations |
| `CoachService.ts` | Zeni's brain - prompts, context |
| `TrainingService.ts` | User memory persistence |
| `lib.rs` | All Rust/native code |
| `BackupService.ts` | Import/export system |

## Environment Variables

### Client (.env.local)

```bash
VITE_API_URL=https://api.zenner.app
VITE_SYNC_URL=https://sync.zenner.app
```

### Server (.env)

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/zenner
REDIS_URL=redis://localhost:6379

# AI Keys
OPENAI_KEYS=sk-xxx,sk-yyy
ANTHROPIC_KEYS=sk-ant-xxx
GEMINI_KEYS=xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Auth
JWT_SECRET=your-secret-key
ADMIN_PASSWORD_SALT=your-salt

# Encryption
API_KEY_ENCRYPTION_KEY=32-byte-key
```

---

# APPENDIX A: Glossary

| Term | Definition |
|------|------------|
| **Zeni** | The AI coach personality in Zenner |
| **RAG** | Retrieval Augmented Generation - using knowledge base for AI context |
| **Training Profile** | User's stored preferences, goals, personality for AI |
| **Focus Session** | A timed work period (Pomodoro) |
| **Memory Orchestrator** | System that combines all memory sources for AI |
| **License Key** | Unique identifier for paid users |
| **Device Fingerprint** | Unique hardware identifier for device tracking |
| **Heartbeat** | Periodic check-in from client to server |
| **Token Credits** | Virtual currency for AI usage |

---

# APPENDIX B: Contact & Resources

## Resources

- [Tauri Documentation](https://v2.tauri.app)
- [React Documentation](https://react.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe API](https://stripe.com/docs/api)

## Architecture Decisions

All major architecture decisions documented in:
- `Project_Documentation/ZENNER_ARCHITECTURE.md`
- `Project_Documentation/ZENNER_DATA_ARCHITECTURE.md`
- `superadmin/docs/*`

---

*Document Version: 2.0*  
*Last Updated: 2026-01-14*  
*Maintained by: Zenner Team*

---

**END OF MASTER DOCUMENTATION**
