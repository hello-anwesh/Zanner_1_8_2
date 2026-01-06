# Intelligent Planner & Journal System
**Date:** January 7, 2026 at 12:25 AM IST

## Vision
A productivity command center where users plan their work, journal their progress, and Zeni has full context to provide intelligent guidance.

---

## Core Features

### 1. Daily Planner
**What:** Today's focused task list and schedule

**Features:**
- **Today's Focus** - Main 1-3 priorities
- **Task List** - Specific tasks with:
  • Checkbox completion
  • Estimated time
  • Subject/Project tags
  • Priority (High/Medium/Low)
  • Notes/Context
- **Time Blocks** - Schedule view
  • 9-11 AM: Deep work on X
  • 2-4 PM: Meetings
- **Quick Capture** - Fast add with natural language
  • "Work on API integration for 2 hours"
  • Auto-parse time, subject, priority

**UI:**
```
Today - January 7, 2026

PRIORITIES
🎯 Launch marketing campaign
🎯 Fix critical bug in auth

SCHEDULE
9:00 AM  ▶ Deep Work: API Integration (2h)
11:00 AM ▶ Team Sync
2:00 PM  ▶ Code Review
4:00 PM  ▶ Documentation

TASKS [5/12]
☑ Review pull requests
☐ Update deployment docs (30min) #DevOps
☐ Client meeting prep (1h) #Business [HIGH]
☐ Write blog post (2h) #Content
```

---

### 2. Journal / Daily Log
**What:** Reflection and progress tracking

**Entry Types:**
- **Daily Entry** - End of day reflection
  • What went well?
  • What didn't?
  • What did I learn?
  • Tomorrow's focus?

- **Session Notes** - After focus sessions
  • What I worked on
  • Progress made
  • Blockers encountered
  • Next steps

- **Project Log** - Per-project notes
  • Ideas
  • Decisions made
  • Resources
  • Milestones

- **Quick Thoughts** - Capture anything
  • Voice notes
  • Text snippets
  • Links/Resources

**UI:**
```
JOURNAL - Today

📝 Daily Reflection
What went well today?
[Rich text editor]

💡 Session Log (2:15 PM)
Worked on: User authentication refactor
Progress: Implemented JWT refresh tokens
Blocker: CORS issue with staging
Next: Debug CORS, test on prod

🚀 Project: Mobile App Redesign
Decision: Going with React Native over Flutter
Reason: Team expertise, faster iteration
```

---

### 3. Projects / Subjects
**What:** High-level organization of work

**Features:**
- **Project Cards**
  • Name
  • Description
  • Start/End dates
  • Status (Planning/Active/Paused/Done)
  • Tags/Categories
  • Related tasks
  • Notes/Resources

- **Subject Areas**
  • Work
  • Side Projects
  • Learning
  • Health
  • Creative

**Example:**
```
PROJECT: E-commerce Platform Rewrite
Status: Active
Timeline: Dec 1 - Feb 15
Tags: #Development #Backend #API

Description:
Complete backend rewrite using microservices

Tasks: 12 total, 5 completed
Last worked: 2 hours ago

Notes:
- Using NestJS framework
- PostgreSQL for primary DB
- Redis for caching
```

---

### 4. Weekly Planning
**What:** Week-level strategy and goals

**Features:**
- **Weekly Goals**
  • 3-5 main objectives
  • Projects to advance
  • Habits to build

- **Week Review**
  • Wins
  • Challenges
  • Insights
  • Next week plan

**UI:**
```
WEEK OF JAN 6-12

GOALS
□ Ship v2.0 to production
□ Complete 3 client deliverables  
□ Exercise 5 days
□ Read 2 chapters of [book]

FOCUS PROJECTS
• Mobile App (40% time)
• Client Website (30%)
• Learning Rust (20%)

REVIEW (End of Week)
Wins: Shipped on time, great client feedback
Challenges: Underestimated testing time
Learned: Better to over-estimate
Next Week: Focus on performance optimization
```

---

### 5. Zeni Integration (THE KEY PART)

#### 5A. Full Context Access
```typescript
ZeniContext {
  // Today
  todaysPriorities: string[]
  todaysSchedule: TimeBlock[]
  completedTasks: Task[]
  pendingTasks: Task[]
  
  // Recent Journal
  last7DaysEntries: JournalEntry[]
  sessionLogs: SessionLog[]
  
  // Projects
  activeProjects: Project[]
  projectNotes: Note[]
  
  // Weekly
  weeklyGoals: Goal[]
  weekProgress: number
  
  // Historical
  completedGoals: Goal[]
  pastJournals: JournalEntry[]
}
```

#### 5B. Smart Queries Zeni Can Answer

**About Tasks:**
- "What should I work on next?"
  → Checks priorities, schedule, task list
  → "Your next priority is the API integration - you blocked 2 hours at 9 AM for it"

- "How much time do I have today?"
  → Analyzes schedule
  → "You have 4 hours of unscheduled time: 1-2 PM and 5-8 PM"

**About Progress:**
- "How's my week going?"
  → Reviews week goals, completed tasks, journal sentiment
  → "You've completed 2/5 weekly goals. You're 60% through focused work but mentioned feeling blocked on testing. Want help prioritizing?"

- "What did I accomplish this week?"
  → Summarizes completed tasks, journal highlights
  → "You shipped the auth system, completed 3 client tasks, and learned GraphQL. Your journal shows you felt most productive Tuesday-Thursday"

**About Projects:**
- "Remind me about the mobile app project"
  → Retrieves project details, recent activity
  → "Mobile App Redesign: Active since Dec 1. You last worked on it yesterday. Current focus: User onboarding flow. 5 tasks remaining"

- "What's blocking me on [project]?"
  → Analyzes journal entries for blockers
  → "You mentioned CORS issues twice this week and dependency conflicts on Monday. Still blocking you?"

**About Learning:**
- "What am I learning?"
  → Checks projects tagged #Learning, journal mentions
  → "You're learning Rust (dedicated 3 hours this week) and exploring system design patterns. Notes show you're struggling with ownership concepts"

**Strategic Insights:**
- "Am I being productive?"
  → Correlates session data, task completion, journal sentiment
  → "Mixed. You're completing tasks but journal shows you feel scattered. You've switched contexts 12 times today - try batching similar work"

- "What should I focus on this month?"
  → Looks at active projects, goals, notes
  → "Your Jan priorities are: ship v2.0, grow client base, build exercise habit. You're on track for v2.0 but haven't scheduled client outreach"

#### 5C. Proactive Suggestions
```
Zeni Can:
- Remind you of priorities if you're distracted
- Suggest what to journal about after sessions
- Point out if you're overcommitted
- Celebrate when you hit goals
- Identify patterns ("You work best mornings - schedule deep work then")
```

---

## Data Structure

### SQLite Schema
```sql
-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT, -- planning/active/paused/done
  start_date DATE,
  end_date DATE,
  tags TEXT, -- JSON array
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT, -- todo/in-progress/done
  priority TEXT, -- high/medium/low
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  due_date DATE,
  completed_at TIMESTAMP,
  tags TEXT, -- JSON array
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Journal Entries
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT, -- daily/session/project/thought
  title TEXT,
  content TEXT NOT NULL, -- Rich text / Markdown
  mood INTEGER, -- 1-5 scale
  project_id TEXT,
  session_id TEXT,
  tags TEXT, -- JSON array
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Time Blocks
CREATE TABLE time_blocks (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Weekly Goals
CREATE TABLE weekly_goals (
  id TEXT PRIMARY KEY,
  week_start DATE NOT NULL,
  goal TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  progress INTEGER DEFAULT 0, -- 0-100%
  created_at TIMESTAMP
);

-- Notes (Project-level)
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  type TEXT, -- idea/decision/resource/milestone
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

---

## UI Components

### Main Planner View
```
Sidebar Navigation:
- Today
- Journal
- Projects
- Week Plan
- Archive

Main Area:
[Depends on selection]
```

### Today View
```
+------------------+------------------+
|   PRIORITIES     |    SCHEDULE      |
|   (Big 3)        |   (Time blocks)  |
+------------------+------------------+
|           TASKS                      |
|   (Interactive list)                |
+--------------------------------------+
|       QUICK ADD                      |
+--------------------------------------+
```

### Journal View
```
Calendar sidebar (select day)

Main:
- Entry type tabs (Daily/Session/Project/Thoughts)
- Rich text editor
- Template prompts
- Auto-save
- Tags/Mood selector
```

### Project View
```
+------------------+------------------+
| PROJECT LIST     | PROJECT DETAILS  |
| (Cards)          | - Info           |
|                  | - Tasks          |
|                  | - Notes          |
|                  | - Activity       |
+------------------+------------------+
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. **Database Schema**
   - Create tables
   - Migration scripts
   - CRUD services

2. **Basic UI**
   - Planner view layout
   - Task list component
   - Journal editor

3. **Core Features**
   - Add/edit/delete tasks
   - Add journal entries
   - Create projects

### Phase 2: Zeni Integration (Week 2)
4. **Context Service**
   - PlannerContextService
   - Fetch today's data
   - Fetch recent journals
   - Fetch active projects

5. **Zeni Prompts**
   - Update CoachService with planner context
   - Add planner data to RAG
   - Test queries

6. **Smart Features**
   - Task suggestions
   - Progress summaries
   - Blocker detection

### Phase 3: Advanced Features (Week 3)
7. **Time Blocking**
   - Schedule view
   - Drag and drop
   - Integration with timer

8. **Weekly Planning**
   - Week view
   - Goal setting
   - Review prompts

9. **Search & Filters**
   - Search all content
   - Filter by project/tag
   - Date ranges

### Phase 4: Polish (Week 4)
10. **Rich Editor**
    - Markdown support
    - Voice input
    - Quick formatting

11. **Templates**
    - Daily journal templates
    - Project templates
    - Quick add shortcuts

12. **Analytics**
    - Completion trends
    - Time spent per project
    - Productivity insights

---

## Key Interactions

### Scenario 1: Start of Day
```
User: Opens app
Zeni: "Good morning! Ready to plan your day?"

User: Clicks "Today"
Planner: Shows priorities, schedule, tasks

Zeni: "I see you blocked 9-11 for API work. You mentioned 
       yesterday this was challenging - need help breaking it down?"
```

### Scenario 2: During Work
```
User: Working on task
Session ends

Zeni: "How did that session go? Want to log it?"
[One-click journal prompt]:
- What I worked on: [auto-filled from task]
- Progress: [dropdown]
- Blockers: [text]
```

### Scenario 3: Query
```
User: "Zeni, what should I focus on?"

Zeni: [Analyzes]:
- Today's priorities: API integration
- Schedule: 2 hours blocked now
- Recent journal: Mentioned being stuck on auth
- Project status: API is 70% done

Response: "Your priority is the API integration - you have 
          2 hours blocked now. Last time you worked on this, 
          you got stuck on auth. Want to tackle that first or 
          work on something else while you're fresh?"
```

### Scenario 4: End of Week
```
Friday Evening

Zeni: "Time to review your week! You completed 4/5 goals. 
       Want to journal about it?"

[Opens journal template]:
- What went well: 
- Challenges:
- Learnings:
- Next week focus:

Zeni: "You mentioned time estimation 3 times this week. 
       I noticed your tasks took 30% longer than estimated. 
       Try padding estimates by 50% next week?"
```

---

## Technical Architecture

### Services Layer
```typescript
PlannerService:
  - createTask()
  - updateTask()
  - getTodaysTasks()
  - getProjectTasks()

JournalService:
  - createEntry()
  - getEntriesByDate()
  - searchEntries()

ProjectService:
  - createProject()
  - getActiveProjects()
  - getProjectDetails()

ContextService:
  - getTodayContext()
  - getWeekContext()
  - getProjectContext()
  - formatForZeni()
```

### Zeni Integration
```typescript
// In CoachService
getAdvancedContext() {
  const plannerContext = contextService.getTodayContext();
  const journalContext = journalService.getRecent(7);
  const projectContext = projectService.getActive();
  
  return {
    ...existingContext,
    planner: plannerContext,
    journal: journalContext,
    projects: projectContext
  };
}

// Enhanced prompt
systemPrompt = `
You are Zeni...

USER'S TODAY:
Priorities: ${context.planner.priorities}
Scheduled: ${context.planner.schedule}
Tasks: ${context.planner.tasks.length} pending

RECENT WORK:
${context.journal.last7Days.map(e => e.summary)}

ACTIVE PROJECTS:
${context.projects.map(p => p.name + ': ' + p.status)}

Use this to provide contextual, intelligent responses.
`;
```

---

## Benefits

1. **Context-Rich Zeni**
   - She knows what you're working on
   - Can reference past entries
   - Understands your struggles and wins

2. **Single Source of Truth**
   - All productivity data in one place
   - Easy to search and review
   - Zeni has complete picture

3. **Intelligent Insights**
   - Pattern detection
   - Personalized suggestions
   - Proactive help

4. **Natural Workflow**
   - Plan → Work → Journal → Review
   - Seamless integration with timer
   - Zeni guides the process

---

## MVP (Minimum Viable Product)

**Ship First:**
1. Today view with task list
2. Basic journal (daily entry)
3. Simple project list
4. Zeni can read planner context
5. Basic queries work

**Ship Later:**
- Time blocking
- Weekly planning
- Rich editor
- Advanced analytics
- Templates

---

## Starting Point

**Week 1 Priority:**
1. Create database schema
2. Build PlannerService
3. Build Today View UI
4. Wire up Zeni to read tasks

**Deliverable:**
User can add tasks, Zeni can see them and respond intelligently.

Example:
```
User adds: "Work on authentication for 2 hours"
Later asks: "What should I do?"
Zeni: "You planned to work on authentication for 2 hours - 
       ready to start?"
```

Ready to start implementation?
