/**
 * User Profile Types
 * Complete data model for user personalization
 */

export interface UserIdentity {
    name: string;
    nickname: string;
    timezone: string;
    language: string;
    avatar?: string;
}

export interface UserProfession {
    role: string;
    industry: string;
    experience: 'student' | 'junior' | 'mid' | 'senior' | 'executive';
    workStyle: 'remote' | 'hybrid' | 'office';
    teamSize?: 'solo' | 'small' | 'medium' | 'large';
}

export interface UserGoals {
    currentFocus: string;
    shortTermGoals: string[];
    longTermVision: string;
    whyProductivity: string;
    weeklyTarget?: number; // hours of focused work
}

export interface UserPatterns {
    chronotype: 'early_bird' | 'night_owl' | 'flexible';
    peakHours: { start: string; end: string }[];
    preferredSessionLength: number; // minutes
    breakPreference: 'short_frequent' | 'long_rare' | 'flexible';
    distractions: string[];
    focusTriggers: string[];
}

export interface AIPreferences {
    coachingStyle: 'supportive' | 'challenging' | 'analytical' | 'motivational';
    feedbackTone: 'gentle' | 'direct' | 'encouraging' | 'no_nonsense';
    reminderFrequency: 'minimal' | 'moderate' | 'frequent';
    motivationType: 'intrinsic' | 'achievement' | 'social' | 'progress';
    wantsAffirmations: boolean;
    wantsAccountability: boolean;
    wantsInsights: boolean;
}

export interface PersonalContext {
    hobbies: string[];
    stressors: string[];
    motivators: string[];
    learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
    communicationStyle: 'detailed' | 'concise' | 'casual' | 'formal';
    energizers: string[];
}

export interface ProfileMeta {
    createdAt: string;
    updatedAt: string;
    completionPercentage: number;
    onboardingComplete: boolean;
    version: number;
}

export interface UserProfile {
    identity: UserIdentity;
    profession: UserProfession;
    goals: UserGoals;
    patterns: UserPatterns;
    aiPreferences: AIPreferences;
    personal: PersonalContext;
    meta: ProfileMeta;
}

// Default values for new profiles
export const DEFAULT_PROFILE: UserProfile = {
    identity: {
        name: '',
        nickname: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language || 'en-US',
    },
    profession: {
        role: '',
        industry: '',
        experience: 'mid',
        workStyle: 'remote',
        teamSize: 'small',
    },
    goals: {
        currentFocus: '',
        shortTermGoals: [],
        longTermVision: '',
        whyProductivity: '',
        weeklyTarget: 20,
    },
    patterns: {
        chronotype: 'flexible',
        peakHours: [{ start: '09:00', end: '12:00' }],
        preferredSessionLength: 25,
        breakPreference: 'short_frequent',
        distractions: [],
        focusTriggers: [],
    },
    aiPreferences: {
        coachingStyle: 'supportive',
        feedbackTone: 'encouraging',
        reminderFrequency: 'moderate',
        motivationType: 'progress',
        wantsAffirmations: true,
        wantsAccountability: true,
        wantsInsights: true,
    },
    personal: {
        hobbies: [],
        stressors: [],
        motivators: [],
        learningStyle: 'visual',
        communicationStyle: 'concise',
        energizers: [],
    },
    meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completionPercentage: 0,
        onboardingComplete: false,
        version: 1,
    },
};

// Predefined options for selectors
export const INDUSTRIES = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Creative',
    'Consulting', 'E-commerce', 'Manufacturing', 'Media', 'Non-profit',
    'Real Estate', 'Legal', 'Marketing', 'Research', 'Other'
];

export const COMMON_DISTRACTIONS = [
    'Social media', 'Email notifications', 'Slack/Teams messages',
    'Phone calls', 'Coworker interruptions', 'News sites',
    'YouTube', 'Gaming', 'Household tasks', 'Daydreaming',
    'Snacking', 'Multitasking'
];

export const COMMON_FOCUS_TRIGGERS = [
    'Coffee/tea', 'Music', 'Silence', 'Morning routine',
    'Clear desk', 'To-do list', 'Deadline pressure',
    'Accountability partner', 'Public commitment', 'Rewards',
    'Exercise beforehand', 'Meditation'
];

export const COMMON_MOTIVATORS = [
    'Learning new things', 'Helping others', 'Financial reward',
    'Recognition', 'Personal growth', 'Creative expression',
    'Problem solving', 'Building something', 'Competition',
    'Freedom/autonomy', 'Making impact', 'Family'
];

export const COMMON_STRESSORS = [
    'Deadlines', 'Too many meetings', 'Unclear expectations',
    'Overwork', 'Lack of progress', 'Conflict',
    'Financial pressure', 'Health worries', 'Perfectionism',
    'Imposter syndrome', 'Work-life balance', 'Isolation'
];

export const COMMON_HOBBIES = [
    'Reading', 'Gaming', 'Exercise', 'Music', 'Cooking',
    'Travel', 'Photography', 'Writing', 'Gardening', 'Art',
    'Sports', 'Hiking', 'Movies', 'Podcasts', 'Coding'
];
