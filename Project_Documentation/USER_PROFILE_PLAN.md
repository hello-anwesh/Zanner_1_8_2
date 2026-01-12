# User Profile System - Implementation Plan

## Overview
A comprehensive User Profile system that helps the AI understand the user deeply, enabling personalized coaching, relevant suggestions, and contextual support.

---

## Phase 1: Profile Service & Data Model

### UserProfile Interface
```typescript
interface UserProfile {
  // Core Identity
  identity: {
    name: string;
    nickname?: string;
    timezone: string;
    language: string;
  };

  // Work Context
  profession: {
    role: string;              // "Software Engineer", "Designer", etc.
    industry: string;          // "Tech", "Healthcare", "Education"
    experience: 'student' | 'junior' | 'mid' | 'senior' | 'executive';
    workStyle: 'remote' | 'hybrid' | 'office';
  };

  // Goals & Aspirations
  goals: {
    shortTerm: string[];       // This week/month goals
    longTerm: string[];        // Career/life goals
    currentFocus: string;      // What they're working on right now
    whyProductivity: string;   // Why productivity matters to them
  };

  // Working Patterns
  patterns: {
    chronotype: 'early_bird' | 'night_owl' | 'flexible';
    peakHours: string[];       // e.g., ["9:00-12:00", "14:00-17:00"]
    distractions: string[];    // Common distractions
    focusBlockers: string[];   // What blocks their focus
    preferredSessionLength: number; // in minutes
  };

  // AI Interaction Preferences
  aiPreferences: {
    coachingStyle: 'supportive' | 'challenging' | 'analytical' | 'motivational';
    feedbackTone: 'gentle' | 'direct' | 'encouraging' | 'no-nonsense';
    reminderFrequency: 'minimal' | 'moderate' | 'frequent';
    motivationType: 'intrinsic' | 'achievement' | 'social' | 'fear-based';
    wantsAffirmations: boolean;
    wantsAccountability: boolean;
  };

  // Personal Context (optional, for deeper personalization)
  personal: {
    hobbies?: string[];
    stressors?: string[];
    motivators?: string[];
    learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
    communicationStyle?: 'detailed' | 'concise' | 'casual' | 'formal';
  };

  // Metadata
  meta: {
    createdAt: Date;
    updatedAt: Date;
    completionPercentage: number;
    onboardingComplete: boolean;
  };
}
```

---

## Phase 2: Profile View UI

### Sections (Tabbed or Scrollable)

#### 1. **About You** (Identity)
- Name input
- Nickname (what AI should call you)
- Timezone (auto-detect)
- Language preference

#### 2. **Your Work** (Profession)
- Role/Job Title
- Industry selector
- Experience level
- Work style (remote/hybrid/office)

#### 3. **Your Goals** (Goals)
- Current focus (what you're working on)
- Short-term goals (chips, editable)
- Long-term vision (text)
- Why productivity matters to you

#### 4. **Your Patterns** (Patterns)
- Are you an early bird or night owl?
- When do you feel most focused?
- Common distractions (multi-select chips)
- Preferred focus session length slider

#### 5. **AI Coach Preferences** (aiPreferences)
- Coaching style selector (cards with descriptions)
- Feedback tone preference
- Reminder frequency
- Do you want accountability or encouragement?

#### 6. **About Your Style** (Personal - Optional)
- Hobbies (helps AI find common ground)
- What stresses you out?
- What motivates you?
- Communication style preference

---

## Phase 3: Onboarding Flow

### Progressive Disclosure Wizard
1. **Welcome** - "Let's set up your profile"
2. **Quick Basics** - Name, role, experience (30 sec)
3. **Your Why** - Current focus, goals (1 min)
4. **Work Style** - Chronotype, peak hours (30 sec)
5. **AI Preferences** - Coaching style, tone (30 sec)
6. **All Done!** - Summary, can edit later

Total time: ~3-4 minutes

---

## Phase 4: Integration Points

### AI Service Integration
```typescript
// In system prompts:
const userContext = `
USER PROFILE:
- Name: ${profile.identity.name} (prefers "${profile.identity.nickname}")
- Role: ${profile.profession.role} in ${profile.profession.industry}
- Currently focused on: ${profile.goals.currentFocus}
- Coaching style: ${profile.aiPreferences.coachingStyle}
- Feedback tone: ${profile.aiPreferences.feedbackTone}
- Chronotype: ${profile.patterns.chronotype}
- Peak hours: ${profile.patterns.peakHours.join(', ')}
- Motivators: ${profile.personal.motivators?.join(', ')}
`;
```

### CoachService Integration
- Use name/nickname in greetings
- Adapt tone based on feedbackTone
- Reference goals in encouragement
- Acknowledge chronotype in timing suggestions

### Journal Integration
- AI reflections can reference goals
- Prompts can relate to current focus
- Insights can acknowledge patterns

### Analytics Integration
- Compare performance across chronotype
- Track progress toward goals
- Identify pattern correlations

---

## Phase 5: Storage

### Local Storage (immediate)
```typescript
localStorage.setItem('zenner_user_profile', JSON.stringify(profile));
```

### Future: SQLite Migration
Add to existing migration service

---

## Files to Create

1. `src/services/profile/ProfileService.ts` - Core CRUD operations
2. `src/services/profile/profileTypes.ts` - TypeScript interfaces
3. `src/components/profile/ProfileView.tsx` - Main profile page
4. `src/components/profile/ProfileOnboarding.tsx` - Wizard flow
5. Update `src/services/ai/CoachService.ts` - Integration
6. Update `src/App.tsx` - Add profile route

---

## Design Notes

- **Card-based sections** with expand/collapse
- **Progress indicator** showing profile completeness
- **Preview snippets** of how AI will use the info
- **Conversational tone** in labels
- **Chips for multi-select** items
- **Sliders** for ranges
- **Cards** for single-select options (with descriptions)

---

## Priority Order

1. ✅ Define interfaces (profileTypes.ts)
2. ✅ Create ProfileService
3. ✅ Build ProfileView with all sections
4. ✅ Integrate with CoachService
5. ⏳ Add to sidebar navigation
6. ⏳ Create onboarding wizard (optional enhancement)

---

## Quick Win: Essential Fields

For MVP, focus on:
- Name
- Current focus
- Coaching style
- Feedback tone
- Chronotype

These give the AI the most impact with minimal user effort.
