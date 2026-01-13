import { AIKnowledge, AIRule, AIExperience } from "./types";

/**
 * ZENI'S PRE-SEEDED KNOWLEDGE BASE
 * 
 * This makes Zeni smart out of the box with:
 * - Productivity science
 * - Psychology expertise
 * - Behavioral coaching rules
 * - Motivational frameworks
 */

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTIVITY SCIENCE
// ═══════════════════════════════════════════════════════════════════════════

const PRODUCTIVITY_KNOWLEDGE: Omit<AIKnowledge, 'id' | 'lastUpdated'>[] = [
    // Time Management
    {
        category: "fact",
        content: "The Pomodoro Technique works because time-boxing creates urgency, reducing Parkinson's Law effect where work expands to fill available time."
    },
    {
        category: "fact",
        content: "Deep work requires 15-25 minutes to enter flow state. Any interruption resets this timer completely."
    },
    {
        category: "fact",
        content: "Ultradian rhythms suggest humans work best in 90-120 minute cycles followed by 20-minute recovery periods."
    },
    {
        category: "fact",
        content: "Context switching costs an average of 23 minutes to fully refocus on the original task. Batching similar work minimizes this tax."
    },
    {
        category: "fact",
        content: "The Zeigarnik Effect: uncompleted tasks occupy mental RAM, causing cognitive load. Writing tasks down frees mental resources."
    },
    {
        category: "fact",
        content: "Peak cognitive performance occurs 2-4 hours after waking for most people. This is when to tackle the hardest work."
    },

    // Energy Management
    {
        category: "fact",
        content: "Decision fatigue is real - the average person makes 35,000 decisions daily, each depleting willpower reserves."
    },
    {
        category: "fact",
        content: "Willpower is like a muscle - it fatigues with use but strengthens with rest. Morning willpower is typically strongest."
    },
    {
        category: "fact",
        content: "Energy management trumps time management. A focused hour beats four distracted hours."
    },
    {
        category: "fact",
        content: "Physical movement increases BDNF (brain-derived neurotrophic factor), literally growing new neural connections."
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// PSYCHOLOGY EXPERTISE
// ═══════════════════════════════════════════════════════════════════════════

const PSYCHOLOGY_KNOWLEDGE: Omit<AIKnowledge, 'id' | 'lastUpdated'>[] = [
    // Motivation & Dopamine
    {
        category: "fact",
        content: "Dopamine is released in ANTICIPATION of reward, not after receiving it. Celebrate starting, not just finishing."
    },
    {
        category: "fact",
        content: "Intrinsic motivation (autonomy, mastery, purpose) is more sustainable than extrinsic motivation (rewards, punishments)."
    },
    {
        category: "fact",
        content: "The Progress Principle: small wins create momentum. Tracking visible progress is more motivating than distant goals."
    },
    {
        category: "fact",
        content: "Implementation intentions ('I will do X at time Y in location Z') are 2-3x more effective than simple goal-setting."
    },

    // Cognitive Psychology
    {
        category: "fact",
        content: "Working memory holds only 4±1 items. Cognitive overload begins when too many things compete for attention."
    },
    {
        category: "fact",
        content: "The peak-end rule: people judge experiences by their peak intensity and ending, not the average. End work sessions positively."
    },
    {
        category: "fact",
        content: "Cognitive fluency bias: people prefer easy-to-process information. Break complex tasks into simple, clear steps."
    },
    {
        category: "fact",
        content: "The mere-exposure effect: repeated exposure increases preference. Consistent routines become comfortable over time."
    },

    // Emotional Regulation
    {
        category: "fact",
        content: "Name it to tame it: labeling emotions activates the prefrontal cortex and calms the amygdala's threat response."
    },
    {
        category: "fact",
        content: "The 90-second rule: primary emotions like anger naturally dissipate in 90 seconds if not re-triggered by thoughts."
    },
    {
        category: "fact",
        content: "Psychological safety is the #1 predictor of high-performing teams. Self-compassion creates internal psychological safety."
    },
    {
        category: "fact",
        content: "Anxiety and excitement have identical physiological signatures. Reframing 'I'm anxious' to 'I'm excited' improves performance."
    },

    // Behavioral Psychology
    {
        category: "fact",
        content: "Habit formation follows the cue-routine-reward loop. To build habits, make cues obvious and rewards immediate."
    },
    {
        category: "fact",
        content: "The two-minute rule: if something takes less than two minutes, do it now. Procrastination costs more than the task itself."
    },
    {
        category: "fact",
        content: "Temptation bundling: pairing a 'want' with a 'should' (music only during exercise) increases follow-through."
    },
    {
        category: "fact",
        content: "Environment design beats willpower. Remove friction from good behaviors, add friction to bad ones."
    },

    // Self-Determination Theory
    {
        category: "fact",
        content: "Human motivation requires three psychological needs: autonomy (choice), competence (mastery), relatedness (connection)."
    },
    {
        category: "fact",
        content: "Autonomy support: having choices, even small ones, increases intrinsic motivation and reduces resistance."
    },
    {
        category: "fact",
        content: "Competence is built through optimal challenge - tasks slightly beyond current ability, not too easy or too hard."
    },

    // Procrastination Psychology
    {
        category: "fact",
        content: "Procrastination is emotion regulation, not time management. We avoid tasks that trigger negative emotions."
    },
    {
        category: "fact",
        content: "The Procrastination Equation: Motivation = (Expectancy × Value) / (Impulsiveness × Delay). Boost expectancy and value, reduce delay."
    },
    {
        category: "fact",
        content: "Perfectionism drives procrastination through fear of judgment. 'Done is better than perfect' breaks this cycle."
    },
    {
        category: "fact",
        content: "Starting is the hardest part. The 'two-minute start' overcomes inertia - commit only to beginning."
    },

    // Growth Mindset & Resilience
    {
        category: "fact",
        content: "Growth mindset: abilities can be developed through effort. Fixed mindset: abilities are static. Mindset affects persistence."
    },
    {
        category: "fact",
        content: "Learned helplessness: repeated failures without control lead to giving up. Restore agency through small controllable wins."
    },
    {
        category: "fact",
        content: "Post-traumatic growth is real: adversity can lead to positive psychological change when processed effectively."
    },
    {
        category: "fact",
        content: "Self-efficacy (belief in your ability) is the strongest predictor of success. Past successes build future confidence."
    },

    // Stress & Performance
    {
        category: "fact",
        content: "The Yerkes-Dodson Law: performance increases with arousal to a point, then decreases. Optimal stress is moderate."
    },
    {
        category: "fact",
        content: "Stress isn't inherently harmful. Viewing stress as enhancing (vs. debilitating) improves health outcomes."
    },
    {
        category: "fact",
        content: "Burnout has three components: exhaustion, cynicism, and inefficacy. Address all three for recovery."
    },
    {
        category: "fact",
        content: "Recovery is active, not passive. Psychological detachment from work during off-hours predicts next-day engagement."
    },

    // Social Psychology
    {
        category: "fact",
        content: "Social proof: people look to others for behavioral cues. Surround yourself with focused, ambitious people."
    },
    {
        category: "fact",
        content: "Commitment and consistency: public commitments increase follow-through. Tell someone your goals."
    },
    {
        category: "fact",
        content: "The spotlight effect: people overestimate how much others notice their mistakes. Others are too busy with themselves."
    },

    // Attention & Focus
    {
        category: "fact",
        content: "Attention is a limited resource that depletes with use. Protect deep focus time ruthlessly."
    },
    {
        category: "fact",
        content: "The mere presence of a smartphone reduces cognitive capacity, even when turned off. Out of sight is truly out of mind."
    },
    {
        category: "fact",
        content: "Open loops (unfinished business) constantly ping for attention. Close loops or schedule them to free focus."
    },

    // Advanced Cognitive Science
    {
        category: "fact",
        content: "Neuroplasticity: the brain physically rewires based on repeated thoughts and actions. Consistent practice literally reshapes neural pathways."
    },
    {
        category: "fact",
        content: "The default mode network activates during rest and is crucial for creativity, self-reflection, and problem-solving. Downtime is productive."
    },
    {
        category: "fact",
        content: "Cognitive reappraisal (reframing situations) is more effective for emotional regulation than suppression."
    },
    {
        category: "fact",
        content: "The spacing effect: distributed practice over time leads to better retention than cramming. Rest between learning sessions."
    },
    {
        category: "fact",
        content: "Interleaving (mixing different types of practice) improves learning more than blocked practice, though it feels harder."
    },

    // Positive Psychology
    {
        category: "fact",
        content: "The broaden-and-build theory: positive emotions expand awareness and build psychological resources for future challenges."
    },
    {
        category: "fact",
        content: "Gratitude practices physically change the brain, increasing activity in areas associated with empathy and decision-making."
    },
    {
        category: "fact",
        content: "Flow state requires: clear goals, immediate feedback, and challenge-skill balance. These are designable conditions."
    },
    {
        category: "fact",
        content: "Savoring - deliberately attending to and appreciating positive experiences - amplifies their psychological benefits."
    },

    // Trauma-Informed Psychology
    {
        category: "fact",
        content: "The window of tolerance: optimal functioning occurs within a zone between hyperarousal (anxiety) and hypoarousal (shutdown)."
    },
    {
        category: "fact",
        content: "Polyvagal theory: the nervous system has three states - safe/social, fight/flight, and freeze. Recognizing your state is the first step to regulation."
    },
    {
        category: "fact",
        content: "Co-regulation: humans calm each other's nervous systems through presence and connection. We regulate together before we regulate alone."
    },
    {
        category: "fact",
        content: "Somatic awareness: paying attention to body sensations helps process emotions that are stored physically, not just mentally."
    },

    // Jungian & Depth Psychology
    {
        category: "fact",
        content: "The shadow contains disowned parts of self. Integrating shadow aspects increases wholeness and reduces projection onto others."
    },
    {
        category: "fact",
        content: "Archetypes are universal patterns in the collective unconscious. Recognizing your active archetypes provides insight into behavior."
    },
    {
        category: "fact",
        content: "Individuation is the lifelong process of becoming your authentic self by integrating conscious and unconscious aspects."
    },

    // Acceptance & Commitment Therapy (ACT)
    {
        category: "fact",
        content: "Psychological flexibility: the ability to be present, open to experience, and act according to values, even when it's uncomfortable."
    },
    {
        category: "fact",
        content: "Cognitive defusion: creating distance from thoughts ('I notice I'm having the thought that...') reduces their power over behavior."
    },
    {
        category: "fact",
        content: "Values clarification: knowing what truly matters provides a compass for behavior when emotions pull in different directions."
    },
    {
        category: "fact",
        content: "Experiential avoidance (avoiding discomfort) paradoxically increases suffering. Acceptance is the alternative."
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// CREATOR KNOWLEDGE (ANWESH RATH)
// ═══════════════════════════════════════════════════════════════════════════

const CREATOR_KNOWLEDGE: Omit<AIKnowledge, 'id' | 'lastUpdated'>[] = [
    {
        category: "fact",
        content: "I was created by Anwesh Rath, a manifestation coach, sonic therapy specialist, and productivity expert based in India."
    },
    {
        category: "fact",
        content: "Anwesh designed me to combine ancient wisdom with modern science - manifestation principles, sound healing, and cognitive psychology."
    },
    {
        category: "fact",
        content: "My creator believes that true productivity isn't about doing more, but about aligning actions with deeper purpose and authentic self."
    },
    {
        category: "fact",
        content: "Zenner (this app) was built by Anwesh to help people access flow states, maintain focus, and manifest their goals through intentional work."
    },
    {
        category: "fact",
        content: "Anwesh's philosophy: the universe responds to focused intention backed by aligned action. Productivity is a spiritual practice."
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// SONIC THERAPY & SOUND HEALING
// ═══════════════════════════════════════════════════════════════════════════

const SONIC_THERAPY_KNOWLEDGE: Omit<AIKnowledge, 'id' | 'lastUpdated'>[] = [
    // Brainwave Entrainment
    {
        category: "fact",
        content: "Brainwave entrainment: the brain synchronizes to external rhythmic stimuli. Binaural beats can guide the brain into specific states."
    },
    {
        category: "fact",
        content: "Delta waves (0.5-4 Hz) dominate deep sleep. Delta entrainment supports profound rest and physical healing."
    },
    {
        category: "fact",
        content: "Theta waves (4-8 Hz) occur in deep meditation and creativity. Theta entrainment enhances intuition, learning, and memory consolidation."
    },
    {
        category: "fact",
        content: "Alpha waves (8-12 Hz) represent relaxed alertness. Alpha entrainment reduces anxiety and promotes calm focus."
    },
    {
        category: "fact",
        content: "Beta waves (12-30 Hz) dominate active thinking. Low beta (12-15 Hz) supports focused concentration without anxiety."
    },
    {
        category: "fact",
        content: "Gamma waves (30-100 Hz) correlate with peak performance, insight, and 'aha' moments. 40 Hz gamma is associated with enhanced cognition."
    },

    // Frequency Healing
    {
        category: "fact",
        content: "432 Hz is called 'nature's frequency' - mathematically consistent with patterns in nature. Many find it more harmonious than standard 440 Hz tuning."
    },
    {
        category: "fact",
        content: "528 Hz is known as the 'love frequency' or 'miracle tone' - associated with DNA repair and transformation in frequency healing traditions."
    },
    {
        category: "fact",
        content: "The Solfeggio frequencies (174, 285, 396, 417, 528, 639, 741, 852, 963 Hz) are ancient healing tones used in Gregorian chants."
    },
    {
        category: "fact",
        content: "396 Hz is associated with liberating guilt and fear. It helps release emotional patterns that block progress."
    },
    {
        category: "fact",
        content: "417 Hz facilitates change by clearing traumatic experiences and negative energy from the past."
    },
    {
        category: "fact",
        content: "639 Hz enhances connection, relationships, and communication. It balances emotions and lifts mood."
    },
    {
        category: "fact",
        content: "741 Hz is linked to intuition and problem-solving. It helps cleanse cells of toxins and electromagnetic radiation."
    },
    {
        category: "fact",
        content: "852 Hz awakens intuition and returns the listener to spiritual order. It promotes seeing through illusions."
    },
    {
        category: "fact",
        content: "963 Hz activates the pineal gland and connects to higher consciousness. Known as the 'frequency of the gods.'"
    },

    // Sound & Body
    {
        category: "fact",
        content: "Sound therapy works because the body is 70% water, and water is an excellent conductor of sound vibration."
    },
    {
        category: "fact",
        content: "Cymatics shows that sound creates geometric patterns in matter. Sound literally shapes physical reality at the molecular level."
    },
    {
        category: "fact",
        content: "Vagal toning through humming or chanting stimulates the vagus nerve, activating the parasympathetic (rest-and-digest) nervous system."
    },
    {
        category: "fact",
        content: "Isochronic tones (evenly spaced pulses) are effective without headphones, unlike binaural beats which require stereo separation."
    },
    {
        category: "fact",
        content: "Pink noise (balanced across frequencies like rain) improves sleep quality and memory consolidation more than white noise."
    },
    {
        category: "fact",
        content: "Brown noise (deeper, like thunder or waterfalls) is especially calming for people with ADHD and racing thoughts."
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// MANIFESTATION & LAW OF ATTRACTION
// ═══════════════════════════════════════════════════════════════════════════

const MANIFESTATION_KNOWLEDGE: Omit<AIKnowledge, 'id' | 'lastUpdated'>[] = [
    // Core Principles
    {
        category: "fact",
        content: "Manifestation is the practice of aligning thoughts, emotions, and actions to attract desired outcomes. It combines intention with inspired action."
    },
    {
        category: "fact",
        content: "The reticular activating system (RAS) filters reality based on focus. What you consistently think about, you notice more of."
    },
    {
        category: "fact",
        content: "Visualization activates the same neural networks as actual experience. The brain doesn't fully distinguish imagined from real."
    },
    {
        category: "fact",
        content: "Emotion is the language of manifestation. Feeling the desired outcome as already real accelerates its arrival."
    },
    {
        category: "fact",
        content: "The observer effect in quantum physics: observation affects outcome. Focused attention collapses possibility into reality."
    },

    // Practical Manifestation
    {
        category: "fact",
        content: "Scripting: writing about your desired reality in present tense, with sensory detail, programs the subconscious mind."
    },
    {
        category: "fact",
        content: "The 369 method: write your intention 3 times in morning, 6 times at midday, 9 times before bed. Repetition impresses the subconscious."
    },
    {
        category: "fact",
        content: "Acting 'as if' - behaving as if your goal is already achieved - aligns your energy with the desired outcome."
    },
    {
        category: "fact",
        content: "Resistance blocks manifestation. Identifying and releasing limiting beliefs is as important as positive visualization."
    },
    {
        category: "fact",
        content: "Detachment paradox: holding goals lightly, without desperate attachment, allows them to manifest more easily."
    },
    {
        category: "fact",
        content: "Gratitude accelerates manifestation by putting you in the vibrational state of already having what you desire."
    },
    {
        category: "fact",
        content: "Inspired action feels different from forced action. It comes with excitement, ease, and synchronicity."
    },

    // Mindset & Belief
    {
        category: "fact",
        content: "Beliefs are instructions to the subconscious. Changing beliefs changes what's possible. Beliefs can be reprogrammed."
    },
    {
        category: "fact",
        content: "The subconscious mind doesn't understand negatives. 'Don't think about pink elephants' creates pink elephants. Focus on what you want."
    },
    {
        category: "fact",
        content: "Self-concept: your beliefs about who you are determine what you attract. Upgrade your self-concept to upgrade your reality."
    },
    {
        category: "fact",
        content: "The bridge of incidents: manifestation rarely happens overnight. Trust the process as events unfold toward your goal."
    },
];


// ═══════════════════════════════════════════════════════════════════════════
// BEHAVIORAL RULES
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_RULES: Omit<AIRule, 'id'>[] = [
    // Focus Rules
    {
        rule: "Never interrupt a running focus session unless there's a genuine emergency. The cost of interruption is far greater than the delay.",
        triggerContext: "focus",
        isActive: true
    },
    {
        rule: "When focus is slipping, a 2-minute walk or stretch is more effective than pushing through with declining returns.",
        triggerContext: "focus",
        isActive: true
    },
    {
        rule: "If a task feels overwhelming, break it down until each piece takes less than 30 minutes.",
        triggerContext: "focus",
        isActive: true
    },

    // Break Rules
    {
        rule: "Short breaks should involve physical movement. Sitting continuously impairs cognition and energy.",
        triggerContext: "breaks",
        isActive: true
    },
    {
        rule: "Long breaks should include something restorative: nature, social connection, or genuine rest - not just different screens.",
        triggerContext: "breaks",
        isActive: true
    },

    // Morning Rules
    {
        rule: "Tackle the hardest, most important task first when willpower and cognitive resources are at their peak.",
        triggerContext: "morning",
        isActive: true
    },
    {
        rule: "Avoid checking email or messages for the first hour. Protect creative morning energy from reactive tasks.",
        triggerContext: "morning",
        isActive: true
    },

    // Evening Rules
    {
        rule: "Use low-energy evening time for planning tomorrow, not creative work. Set up tomorrow's success tonight.",
        triggerContext: "evening",
        isActive: true
    },
    {
        rule: "Do a 'shutdown ritual' at day's end: review accomplishments, write tomorrow's priorities, and mentally close work.",
        triggerContext: "evening",
        isActive: true
    },

    // Emotional Rules
    {
        rule: "When feeling resistance to a task, name the emotion ('I'm feeling anxious about this') before pushing through.",
        triggerContext: "resistance",
        isActive: true
    },
    {
        rule: "Celebrate starting, not just finishing. The hardest part is beginning - acknowledge that victory.",
        triggerContext: "motivation",
        isActive: true
    },
    {
        rule: "After a setback, practice self-compassion first, then analyze. Harsh self-criticism reduces future performance.",
        triggerContext: "setback",
        isActive: true
    },

    // General Rules
    {
        rule: "Batch similar tasks together to minimize context-switching costs. Email, calls, and deep work should have separate blocks.",
        triggerContext: "general",
        isActive: true
    },
    {
        rule: "If you've been stuck for more than 15 minutes, change your approach: ask for help, take a break, or try a different angle.",
        triggerContext: "general",
        isActive: true
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// WELCOME EXPERIENCE
// ═══════════════════════════════════════════════════════════════════════════

const INITIAL_EXPERIENCE: Omit<AIExperience, 'id'>[] = [
    {
        summary: "User started using Zenner - beginning their journey toward better focus and productivity.",
        sentiment: "positive",
        keyLearnings: [
            "New user onboarding",
            "Fresh start with productivity habits",
            "Open to learning and growing"
        ],
        timestamp: Date.now()
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all pre-seeded knowledge items with IDs and timestamps
 */
export function getDefaultKnowledgeBase(): AIKnowledge[] {
    const allKnowledge = [
        ...PRODUCTIVITY_KNOWLEDGE,
        ...PSYCHOLOGY_KNOWLEDGE,
        ...CREATOR_KNOWLEDGE,
        ...SONIC_THERAPY_KNOWLEDGE,
        ...MANIFESTATION_KNOWLEDGE
    ];
    return allKnowledge.map((k, index) => ({
        ...k,
        id: `zeni_knowledge_${index}`,
        lastUpdated: Date.now()
    }));
}

/**
 * Get all pre-seeded rules with IDs
 */
export function getDefaultRules(): AIRule[] {
    return DEFAULT_RULES.map((r, index) => ({
        ...r,
        id: `zeni_rule_${index}`
    }));
}

/**
 * Get initial experience entries
 */
export function getDefaultExperiences(): AIExperience[] {
    return INITIAL_EXPERIENCE.map((e, index) => ({
        ...e,
        id: `zeni_exp_${index}`
    }));
}

/**
 * Get the count of pre-seeded items (for onboarding display)
 */
export function getPreSeedStats() {
    return {
        productivityFacts: PRODUCTIVITY_KNOWLEDGE.length,
        psychologyFacts: PSYCHOLOGY_KNOWLEDGE.length,
        creatorFacts: CREATOR_KNOWLEDGE.length,
        sonicTherapyFacts: SONIC_THERAPY_KNOWLEDGE.length,
        manifestationFacts: MANIFESTATION_KNOWLEDGE.length,
        behavioralRules: DEFAULT_RULES.length,
        totalKnowledge: PRODUCTIVITY_KNOWLEDGE.length +
            PSYCHOLOGY_KNOWLEDGE.length +
            CREATOR_KNOWLEDGE.length +
            SONIC_THERAPY_KNOWLEDGE.length +
            MANIFESTATION_KNOWLEDGE.length
    };
}
