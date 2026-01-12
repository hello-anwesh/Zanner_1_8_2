# Journal Enhancement Plan - AI-Augmented Journaling USP

**Date Created:** 2026-01-12
**Status:** In Progress

---

## Vision

Transform the journal from a simple text input into an **AI-powered thinking partner** that helps users reflect, grow, and maintain mental clarity. This becomes a key differentiator (USP) for the app.

---

## Phases Overview

| Phase | Focus | Effort | Impact |
|-------|-------|--------|--------|
| Phase 1 | Core Improvements | Easy | 🔥🔥 |
| Phase 2 | AI Integration | Medium | 🔥🔥🔥 |
| Phase 3 | Smart Features | Medium | 🔥🔥🔥 |
| Phase 4 | Session Integration | Medium | 🔥🔥 |
| Phase 5 | Analytics & Insights | Hard | 🔥🔥🔥 |

---

## Phase 1: Core Improvements (Foundation)

### Tasks:
- [ ] **Auto-save with debounce** - Save every 3 seconds of inactivity
- [ ] **Markdown rendering** - Support bold, italic, lists, headers
- [ ] **Character/word count** - Show stats in editor
- [ ] **Quick mood change** - Don't require save to update mood
- [ ] **Improved empty state** - Better onboarding for first entry
- [ ] **Keyboard shortcuts** - Cmd+S to save, Cmd+Enter to save & close
- [ ] **Delete confirmation** - Modal before deleting entry

### Files to modify:
- `JournalView.tsx`
- `JournalService.ts`

---

## Phase 2: AI Integration (The USP)

### 2A: AI Writing Prompts
- [ ] **JournalPromptService** - Generate contextual prompts
- [ ] **Time-aware prompts** - Morning vs evening prompts
- [ ] **Mood-aware prompts** - Different prompts based on recent mood
- [ ] **Session-aware prompts** - "You completed 3 sessions today..."
- [ ] **Prompt UI** - Dismissible prompt cards above editor

### 2B: AI Reflection Mode
- [ ] **"Reflect with AI" button** - Appears after writing
- [ ] **Pattern detection** - Analyze entries for recurring themes
- [ ] **Sentiment analysis** - Track emotional patterns
- [ ] **AI feedback** - Supportive insights on entry
- [ ] **Reflection modal** - Beautiful display of AI insights

### 2C: AI Summary
- [ ] **Weekly auto-summary** - Generate every Sunday
- [ ] **Summary storage** - Save summaries in DB
- [ ] **Summary view** - Card showing weekly summary

### Files to create:
- `JournalAIService.ts`
- `JournalPromptService.ts`

---

## Phase 3: Smart Features (Delight)

### 3A: Templates
- [ ] **Template selector** - Dropdown/modal to choose template
- [ ] **Built-in templates:**
  - Morning Check-in (energy, intentions, gratitude)
  - Evening Reflection (wins, lessons, tomorrow)
  - Session Debrief (accomplished, blockers, next)
  - Freewrite (empty)
  - Weekly Review (highlights, challenges, goals)
- [ ] **Custom templates** - User can save their own

### 3B: Gratitude Mode
- [ ] **Toggle switch** - "Gratitude Mode"
- [ ] **Structured input** - 3 numbered fields
- [ ] **Auto-tag #gratitude**
- [ ] **Gratitude streak** - Separate from regular streak

### 3C: Smart Tags
- [ ] **Tag suggestions** - AI suggests tags based on content
- [ ] **Popular tags** - Show user's most used tags
- [ ] **Tag filtering** - Filter entries by tag in All view

### Files to modify:
- `JournalView.tsx`
- `JournalService.ts`

---

## Phase 4: Session Integration

### 4A: Post-Session Journal
- [ ] **Quick journal modal** - After session complete
- [ ] **Auto-populate context** - Session number, duration, time
- [ ] **Quick entry type** - Shorter form for session notes
- [ ] **Link to session** - Store session ID in entry

### 4B: Session Notes View
- [ ] **"Session Notes" tab** - View entries linked to sessions
- [ ] **Timeline view** - Chronological with session markers

### Files to create:
- `PostSessionJournal.tsx`

### Files to modify:
- `JournalService.ts` - Add session linking

---

## Phase 5: Analytics & Insights (Premium Polish)

### 5A: Mood Analytics
- [ ] **Mood chart** - Line/bar chart over time
- [ ] **Mood calendar** - Heatmap of moods
- [ ] **Mood correlations** - "You feel best after 3 sessions"

### 5B: Writing Analytics
- [ ] **Words written** - Daily/weekly/monthly counts
- [ ] **Journaling streak** - Visual streak display
- [ ] **Best writing day** - "You write most on Sundays"

### 5C: AI Insights Dashboard
- [ ] **Theme extraction** - What topics appear most
- [ ] **Sentiment timeline** - How mood text correlates
- [ ] **Growth indicators** - Positive changes over time

### Files to create:
- `JournalAnalytics.tsx`
- `JournalInsightsService.ts`

---

## Database Schema Updates

```sql
-- Add to journal_entries table:
ALTER TABLE journal_entries ADD COLUMN session_id INTEGER;
ALTER TABLE journal_entries ADD COLUMN template TEXT;
ALTER TABLE journal_entries ADD COLUMN is_gratitude BOOLEAN DEFAULT 0;
ALTER TABLE journal_entries ADD COLUMN word_count INTEGER;

-- New table for AI summaries
CREATE TABLE journal_summaries (
    id INTEGER PRIMARY KEY,
    week_start TEXT NOT NULL,
    week_end TEXT NOT NULL,
    summary TEXT NOT NULL,
    mood_trend TEXT,
    themes TEXT,
    created_at INTEGER NOT NULL
);

-- New table for templates
CREATE TABLE journal_templates (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT 0,
    created_at INTEGER NOT NULL
);
```

---

## Progress Tracking

### Phase 1: Core Improvements
- [x] Auto-save with debounce ✅
- [ ] Markdown rendering
- [x] Character/word count ✅
- [ ] Quick mood change
- [ ] Improved empty state
- [x] Keyboard shortcuts (Cmd+S) ✅
- [ ] Delete confirmation

### Phase 2: AI Integration
- [x] JournalPromptService ✅
- [x] Time-aware prompts ✅
- [x] Mood-aware prompts ✅
- [x] Session-aware prompts ✅
- [x] Prompt UI ✅
- [x] "Reflect with AI" button ✅
- [x] Pattern detection ✅
- [x] AI feedback ✅
- [x] Reflection modal ✅
- [ ] Weekly auto-summary
- [ ] Summary storage
- [ ] Summary view

### Phase 3: Smart Features
- [x] Template selector ✅
- [x] Built-in templates (5) ✅
- [ ] Custom templates
- [x] Gratitude Mode ✅
- [ ] Gratitude streak
- [ ] Tag suggestions
- [ ] Popular tags
- [ ] Tag filtering

### Phase 4: Session Integration
- [x] Quick journal modal ✅
- [x] Auto-populate context ✅
- [x] Quick entry type ✅
- [x] Link to session ✅
- [ ] Session Notes tab

### Phase 5: Analytics & Insights
- [ ] Mood chart
- [ ] Mood calendar
- [ ] Mood correlations
- [ ] Words written stats
- [ ] Theme extraction
- [ ] Sentiment timeline

---

## Implementation Order

1. **Phase 1** - Foundation (do this first, it's quick)
2. **Phase 2A** - AI Prompts (easy AI win)
3. **Phase 3B** - Gratitude Mode (quick, high value)
4. **Phase 2B** - AI Reflection (the big USP)
5. **Phase 3A** - Templates
6. **Phase 4** - Session Integration
7. **Phase 5** - Analytics (polish phase)
8. **Phase 2C** - Weekly Summaries (premium feature)
9. **Phase 3C** - Smart Tags

---

## Notes

- All AI features use existing AIService
- Premium gating: Consider making Phase 5 and weekly summaries premium
- Performance: Journal queries should be cached
- Privacy: All data stays local, no cloud sync for journal (unless user opts in)

