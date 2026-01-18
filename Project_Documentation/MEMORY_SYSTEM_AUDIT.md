# Memory & Context System Audit
**Date:** 2026-01-12  
**Status:** Complete Analysis & Recommendations

---

## Executive Summary

The Zenner AI system implements a **multi-layered memory architecture** with three distinct memory systems working in parallel. While functional, the current implementation has **significant inefficiencies** in token usage, redundant context passing, and lacks economic optimization for API costs.

**Key Findings:**
- ✅ **Strengths:** Multi-modal memory (episodic, semantic, procedural), RAG integration, background learning
- ⚠️ **Issues:** Duplicate conversation histories, no context window management, unoptimized token usage
- 💰 **Cost Impact:** Estimated 3-5x higher API costs than necessary

---

## Current Architecture

### 1. **Conversation History (Short-term Memory)**

**Location:** `AIService.ts` + `CoachService.ts`

**Problem: DUPLICATE HISTORIES**
```typescript
// AIService maintains its own history
private conversationHistory: Message[] = [];

// CoachService ALSO maintains its own history
private conversationHistory: Array<{ role: string; content: string }> = [];
```

**Flow:**
1. User sends message to `CoachService.chat()`
2. CoachService passes `conversationHistory.slice(-10)` to AIService
3. AIService ADDS the message to its OWN history
4. Both histories are sent to the provider

**Result:** Messages are duplicated in the context window, wasting tokens.

**Current Limits:**
- CoachService: Last 10 messages (5 exchanges)
- AIService: Unlimited (grows forever until `clearHistory()` is called)

---

### 2. **Training Memory (Long-term Semantic + Procedural)**

**Location:** `TrainingService.ts`

**Components:**
- **Identity:** User profile (name, role, values, vision)
- **Rhythms:** Work preferences (chronotype, session duration, break style)
- **Knowledge Base:** Facts learned from conversations
- **Rules:** Behavioral guidelines (procedural memory)
- **Experiences:** Episodic memory (last 50 interactions)

**Storage:** localStorage (`chronos_ai_training_profile`)

**Retrieval Method:** Simple keyword matching (line 100-111)
```typescript
getContext(query: string): string {
    const keywords = query.toLowerCase().split(" ").filter(w => w.length > 3);
    const relevant = this.profile.knowledgeBase.filter(k =>
        keywords.some(w => k.content.toLowerCase().includes(w))
    );
    // Returns matched knowledge as text
}
```

**Issues:**
- ❌ No vector similarity (just keyword matching)
- ❌ No relevance scoring
- ❌ Always returns ALL matched items (no limit)
- ❌ No deduplication with RAG results

---

### 3. **RAG System (Knowledge Base)**

**Location:** `RAGService.ts`

**Purpose:** Semantic search over frequency presets

**Implementation:**
- Embeds all frequency presets on init
- Uses cosine similarity for retrieval
- Returns top-k (default k=3) results

**Storage:** localStorage (`zenner_rag_index_v1`)

**Token Cost:**
- Initial indexing: ~30 embedding calls (one-time)
- Per query: 1 embedding call + similarity computation

**Issues:**
- ✅ Proper vector search (good)
- ❌ Only indexes frequency presets (limited scope)
- ❌ No caching of query embeddings
- ❌ No integration with TrainingService knowledge

---

### 4. **Background Learning System**

**Location:** `CoachService.analyzeInteraction()` (line 264-324)

**Process:**
1. After each chat response, waits 1 second
2. Sends entire interaction to AI for analysis
3. Extracts: new facts, preferences, sentiment, summary
4. Stores in TrainingService (knowledge + rules + experiences)

**Token Cost Per Interaction:**
- Analysis prompt: ~200 tokens
- Existing knowledge context: ~50-500 tokens (grows over time)
- Response: ~100-200 tokens
- **Total:** ~350-900 tokens per message (EXPENSIVE!)

**Issues:**
- ❌ Runs on EVERY message (no throttling)
- ❌ Sends entire knowledge base for deduplication check
- ❌ No batching (could analyze multiple interactions at once)
- ❌ JSON parsing can fail silently

---

## Token Usage Analysis

### Current Flow for a Single User Message:

```
User: "How do I stay focused?"

1. CoachService.chat() constructs context:
   - buildContextString(): ~100 tokens
   - getAdvancedPersonaPrompt(): ~300 tokens
   - trainingService.getContext(): ~0-500 tokens (variable)
   - ragService.retrieve(): ~0-600 tokens (variable)
   - conversationHistory (last 10): ~500-2000 tokens
   
   Total Input: ~900-3500 tokens

2. AIService.chat() adds:
   - systemPrompt override: ~400 tokens (includes all above)
   - conversationHistory: ~500-2000 tokens (DUPLICATE)
   - User message: ~10 tokens
   
   Total Sent to Provider: ~1400-6000 tokens

3. Provider Response: ~100-500 tokens

4. Background Analysis (1s later):
   - Analysis prompt: ~200 tokens
   - Existing knowledge: ~50-500 tokens
   - Response: ~100-200 tokens
   
   Total Background: ~350-900 tokens

TOTAL PER MESSAGE: ~1850-7400 tokens
```

**For a 10-message conversation:**
- Total tokens: 18,500 - 74,000 tokens
- At $0.15/1M input tokens (Gemini): $0.0028 - $0.011 per conversation
- At $2.50/1M input tokens (GPT-4): $0.046 - $0.185 per conversation

**Waste Estimate:** 40-60% of tokens are redundant or inefficient.

---

## Recommendations

### Priority 1: Fix Duplicate Conversation History

**Problem:** Two separate conversation histories causing duplication.

**Solution:**
```typescript
// Option A: Single Source of Truth
// Remove CoachService.conversationHistory entirely
// Let AIService manage all history
// CoachService just passes context, not history

// Option B: Explicit Separation
// CoachService: Manages session-level context
// AIService: Manages provider-level history
// Never pass conversationHistory in context
```

**Impact:** Reduces tokens by 30-50% per message.

---

### Priority 2: Implement Context Window Management

**Problem:** No limits on AIService history, grows unbounded.

**Solution:**
```typescript
class AIService {
    private readonly MAX_HISTORY_TOKENS = 4000; // Configurable
    
    private trimHistory(messages: Message[]): Message[] {
        let tokenCount = 0;
        const trimmed: Message[] = [];
        
        // Keep most recent messages that fit in budget
        for (let i = messages.length - 1; i >= 0; i--) {
            const msgTokens = this.estimateTokens(messages[i].content);
            if (tokenCount + msgTokens > this.MAX_HISTORY_TOKENS) break;
            trimmed.unshift(messages[i]);
            tokenCount += msgTokens;
        }
        
        return trimmed;
    }
    
    private estimateTokens(text: string): number {
        // Rough estimate: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }
}
```

**Impact:** Prevents runaway token usage in long conversations.

---

### Priority 3: Optimize Background Learning

**Problem:** Runs expensive analysis on every message.

**Solution:**
```typescript
class CoachService {
    private interactionBuffer: Array<{user: string, ai: string}> = [];
    private lastAnalysis = Date.now();
    
    async analyzeInteraction(user: string, ai: string) {
        // Buffer interactions
        this.interactionBuffer.push({user, ai});
        
        // Only analyze every 5 messages OR every 5 minutes
        const shouldAnalyze = 
            this.interactionBuffer.length >= 5 || 
            (Date.now() - this.lastAnalysis > 5 * 60 * 1000);
        
        if (!shouldAnalyze) return;
        
        // Batch analyze all buffered interactions
        const prompt = `Analyze these ${this.interactionBuffer.length} interactions...`;
        // ... rest of analysis
        
        this.interactionBuffer = [];
        this.lastAnalysis = Date.now();
    }
}
```

**Impact:** Reduces background analysis costs by 80%.

---

### Priority 4: Unified Memory Retrieval

**Problem:** RAG and TrainingService operate independently, no deduplication.

**Solution:**
```typescript
class MemoryService {
    async retrieve(query: string, maxTokens: number = 1000): Promise<string> {
        // 1. Get RAG results (vector search)
        const ragResults = await ragService.retrieve(query, 3);
        
        // 2. Get training memory (keyword search)
        const memoryResults = trainingService.getContext(query);
        
        // 3. Deduplicate and rank by relevance
        const combined = this.deduplicateAndRank(ragResults, memoryResults);
        
        // 4. Trim to token budget
        return this.trimToTokenBudget(combined, maxTokens);
    }
}
```

**Impact:** Prevents duplicate context, respects token budgets.

---

### Priority 5: Add Caching Layer

**Problem:** Same queries re-embed and re-retrieve every time.

**Solution:**
```typescript
class CacheService {
    private queryCache = new Map<string, {
        embedding: number[],
        results: string,
        timestamp: number
    }>();
    
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    
    async getCachedRetrieval(query: string): Promise<string | null> {
        const cached = this.queryCache.get(query);
        if (!cached) return null;
        
        // Check if cache is still valid
        if (Date.now() - cached.timestamp > this.CACHE_TTL) {
            this.queryCache.delete(query);
            return null;
        }
        
        return cached.results;
    }
}
```

**Impact:** Saves embedding API calls for repeated queries.

---

### Priority 6: Implement Sliding Window Summary

**Problem:** Old conversation history is kept verbatim, wasting tokens.

**Solution:**
```typescript
class ConversationManager {
    private messages: Message[] = [];
    private summary: string = "";
    
    async addMessage(msg: Message) {
        this.messages.push(msg);
        
        // Every 20 messages, summarize the oldest 10
        if (this.messages.length > 20) {
            const toSummarize = this.messages.slice(0, 10);
            const newSummary = await this.summarize(toSummarize);
            
            this.summary = this.summary 
                ? `${this.summary}\n\n${newSummary}` 
                : newSummary;
            
            this.messages = this.messages.slice(10);
        }
    }
    
    getContext(): string {
        return this.summary 
            ? `Previous conversation summary:\n${this.summary}\n\nRecent messages:\n${this.formatMessages(this.messages)}`
            : this.formatMessages(this.messages);
    }
}
```

**Impact:** Maintains long-term context with minimal token cost.

---

## Proposed New Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Message                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  MemoryOrchestrator                          │
│  - Manages all memory systems                                │
│  - Enforces token budgets                                    │
│  - Deduplicates context                                      │
└────────┬────────────────┬────────────────┬──────────────────┘
         │                │                │
         ▼                ▼                ▼
┌────────────────┐ ┌──────────────┐ ┌─────────────────┐
│ ConversationMgr│ │ SemanticMem  │ │ ProceduralMem   │
│ (Short-term)   │ │ (RAG+Training│ │ (Rules)         │
│                │ │  Knowledge)  │ │                 │
│ - Sliding      │ │ - Vector     │ │ - Active rules  │
│   window       │ │   search     │ │ - Preferences   │
│ - Summaries    │ │ - Cached     │ │                 │
│ - Max 4K tokens│ │ - Max 1K tok │ │ - Max 500 tok   │
└────────────────┘ └──────────────┘ └─────────────────┘
         │                │                │
         └────────────────┴────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Unified Context (Max 6K tokens)                 │
│  - Conversation: 4K                                          │
│  - Semantic Memory: 1K                                       │
│  - Procedural Rules: 500                                     │
│  - System Prompt: 500                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Provider                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Critical Fixes (Week 1)
1. ✅ Remove duplicate conversation history
2. ✅ Add context window limits
3. ✅ Implement token estimation

### Phase 2: Optimization (Week 2)
4. ✅ Batch background learning
5. ✅ Add query caching
6. ✅ Unified memory retrieval

### Phase 3: Advanced Features (Week 3)
7. ✅ Sliding window summaries
8. ✅ Memory orchestrator
9. ✅ Token budget UI controls

---

## Economic Impact

### Current Costs (Estimated)
- Average conversation: 10 messages
- Current token usage: ~40,000 tokens
- **Gemini 1.5 Flash:** $0.006/conversation
- **GPT-4:** $0.10/conversation
- **Monthly (100 users, 5 convos/day):** $90-$1,500

### After Optimization
- Optimized token usage: ~15,000 tokens (62.5% reduction)
- **Gemini 1.5 Flash:** $0.002/conversation
- **GPT-4:** $0.0375/conversation
- **Monthly (100 users, 5 convos/day):** $30-$562

**Savings:** $60-$938/month (67% cost reduction)

---

## Configuration Recommendations

Add to `Settings → AI Engine`:

```typescript
interface MemoryConfig {
    // Context Window
    maxConversationTokens: number;      // Default: 4000
    maxSemanticMemoryTokens: number;    // Default: 1000
    maxProceduralMemoryTokens: number;  // Default: 500
    
    // Background Learning
    learningBatchSize: number;          // Default: 5 messages
    learningInterval: number;           // Default: 5 minutes
    
    // Caching
    enableQueryCache: boolean;          // Default: true
    cacheTTL: number;                   // Default: 5 minutes
    
    // Conversation Management
    enableSummaries: boolean;           // Default: true
    summaryThreshold: number;           // Default: 20 messages
}
```

---

## Monitoring & Metrics

Add tracking for:
1. **Token Usage:**
   - Input tokens per message
   - Output tokens per message
   - Background analysis tokens
   - Total tokens per conversation

2. **Memory Performance:**
   - Cache hit rate
   - Retrieval latency
   - Memory size (KB)

3. **Cost Tracking:**
   - Cost per message
   - Cost per conversation
   - Monthly total

---

## Conclusion

The current memory system is **functional but inefficient**. By implementing the recommended changes, you can:

- ✅ Reduce token usage by 60-70%
- ✅ Lower API costs by 67%
- ✅ Improve response latency
- ✅ Scale to more users economically
- ✅ Maintain or improve context quality

**Next Steps:**
1. Review and approve this plan
2. Prioritize which phases to implement
3. Create implementation tasks
4. Add monitoring before changes
5. Implement and measure improvements
