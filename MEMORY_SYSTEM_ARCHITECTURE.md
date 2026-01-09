# Zenner Memory System (ZMS) - Architecture Plan

## 1. Vision
Transform Zeni from a "stateless responder" into a **Long-Term Partner** that:
1.  **Remembers** your projects, preferences, and context.
2.  **Learns** from every interaction without needing explicit training.
3.  **Proactively** uses this knowledge to offer better advice.

---

## 2. The "Brain" Structure (Data Model)
We will expand the current `TrainingService` to support three distinct memory types:

### A. Semantic Memory (Facts) - `Explicit Knowledge`
*What Zeni knows about your life/work.*
- **Structure**: `category`, `content`, `confidence_score` 
- **Examples**: 
  - "User is building a Pomodoro app called Zenner."
  - "User prioritizes aesthetics over simple utility."
  - "Key stakeholder is 'The User' (You)."

### B. Episodic Memory (Experience) - `Session History`
*What happened in the past.*
- **Structure**: `summary`, `sentiment`, `key_outcome`, `timestamp`
- **Examples**:
  - "Jan 9: User felt frustrated with chat UI borders. We fixed it together."
  - "Jan 8: High productivity streak (8 hours)."

### C. Procedural Memory (Preferences) - `Behavioral Rules`
*How Zeni should act.*
- **Structure**: `rule`, `trigger_context`
- **Examples**:
  - "Always respond with short, punchy sentences during 'Crisis Mode'."
  - "Never suggest 5-minute breaks; user prefers 15-minute deep resets."

---

## 3. The Learning Loop (Ingestion Pipeline)
This is the core engine. Zeni must process chats to extract insights.

### Trigger Points
1.  **End of Session**: When a chat session closes or becomes inactive (>30m).
2.  **Explicit Instruction**: "Zeni, remember this."

### The "Analysis/Extraction" Agent
We will create a background service (`MemoryService`) that runs *after* conversations.
- **Input**: The last 20 messages.
- **Task**: "Extract new facts, preferences, or project details."
- **Output**: JSON objects to be Upserted (Update/Insert) into `MemoryStore`.
- **Validation**: Zeni might ask: *"I noticed you prefer dark mode designs. Should I remember that for future UI suggestions?"*

---

## 4. Retrieval & Context Injection (Recall)
How does Zeni use this info?

### The Context Window Strategy
When you send a message, we construct the prompt dynamically:
1.  **Immediate Context**: Current session stats, time, energy.
2.  **RAG Lookup (Recall)**: Search Memory Store for keywords related to your current message.
    - *User says*: "Let's fix the header."
    - *Retrieval*: Finds memory "User prefers glassmorphism headers."
3.  **System Prompt Injection**:
    - "User Context: You are talking to [Name]. They are working on [Project]. Remember they prefer [Style]."

---

## 5. User UI (Transparency & Control)
You must have god-mode control over Zeni's brain.
- **"The Brain" Tab**: A new section in the AI Menu.
- **Features**:
  - View all stored Memories.
  - Delete incorrect memories.
  - Manually add memories ("I am starting a diet, remind me not to order pizza").
  - "Forget everything" button (Privacy).

---

## 6. Implementation Stages
1.  **Stage 1: The Store** - Upgrade `TrainingService` to support these memory types.
2.  **Stage 2: The Analyzer** - Implement the specific AI call to extract insights from chat.
3.  **Stage 3: The UI** - Build the "Brain" interface in the menu.
