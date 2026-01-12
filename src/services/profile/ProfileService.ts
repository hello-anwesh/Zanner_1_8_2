/**
 * Profile Service
 * Manages user profile data with persistence and validation
 */

import { UserProfile, DEFAULT_PROFILE } from './profileTypes';

const STORAGE_KEY = 'zenner_user_profile';

class ProfileService {
    private profile: UserProfile;
    private listeners: Set<(profile: UserProfile) => void> = new Set();

    constructor() {
        this.profile = this.loadFromStorage();
    }

    /**
     * Load profile from localStorage
     */
    private loadFromStorage(): UserProfile {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to handle new fields
                return this.mergeWithDefaults(parsed);
            }
        } catch (error) {
            console.error('[ProfileService] Failed to load profile:', error);
        }
        return { ...DEFAULT_PROFILE };
    }

    /**
     * Merge stored profile with defaults (for backwards compatibility)
     */
    private mergeWithDefaults(stored: Partial<UserProfile>): UserProfile {
        return {
            identity: { ...DEFAULT_PROFILE.identity, ...stored.identity },
            profession: { ...DEFAULT_PROFILE.profession, ...stored.profession },
            goals: { ...DEFAULT_PROFILE.goals, ...stored.goals },
            patterns: { ...DEFAULT_PROFILE.patterns, ...stored.patterns },
            aiPreferences: { ...DEFAULT_PROFILE.aiPreferences, ...stored.aiPreferences },
            personal: { ...DEFAULT_PROFILE.personal, ...stored.personal },
            meta: { ...DEFAULT_PROFILE.meta, ...stored.meta },
        };
    }

    /**
     * Save profile to localStorage
     */
    private saveToStorage(): void {
        try {
            this.profile.meta.updatedAt = new Date().toISOString();
            this.profile.meta.completionPercentage = this.calculateCompletion();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
            this.notifyListeners();
        } catch (error) {
            console.error('[ProfileService] Failed to save profile:', error);
        }
    }

    /**
     * Calculate profile completion percentage
     */
    private calculateCompletion(): number {
        let filled = 0;
        let total = 0;

        // Identity (weight: 20%)
        const identity = this.profile.identity;
        total += 4;
        if (identity.name) filled++;
        if (identity.nickname) filled++;
        if (identity.timezone) filled++;
        if (identity.language) filled++;

        // Profession (weight: 15%)
        const profession = this.profile.profession;
        total += 4;
        if (profession.role) filled++;
        if (profession.industry) filled++;
        if (profession.experience) filled++;
        if (profession.workStyle) filled++;

        // Goals (weight: 25%)
        const goals = this.profile.goals;
        total += 4;
        if (goals.currentFocus) filled++;
        if (goals.shortTermGoals.length > 0) filled++;
        if (goals.longTermVision) filled++;
        if (goals.whyProductivity) filled++;

        // Patterns (weight: 20%)
        const patterns = this.profile.patterns;
        total += 4;
        if (patterns.chronotype) filled++;
        if (patterns.peakHours.length > 0) filled++;
        if (patterns.distractions.length > 0) filled++;
        if (patterns.focusTriggers.length > 0) filled++;

        // AI Preferences (weight: 15%)
        const ai = this.profile.aiPreferences;
        total += 3;
        if (ai.coachingStyle) filled++;
        if (ai.feedbackTone) filled++;
        if (ai.reminderFrequency) filled++;

        // Personal (weight: 5% - optional)
        const personal = this.profile.personal;
        total += 2;
        if (personal.hobbies.length > 0) filled++;
        if (personal.motivators.length > 0) filled++;

        return Math.round((filled / total) * 100);
    }

    /**
     * Get the current profile
     */
    getProfile(): UserProfile {
        return { ...this.profile };
    }

    /**
     * Get a specific section of the profile
     */
    getSection<K extends keyof UserProfile>(section: K): UserProfile[K] {
        return { ...this.profile[section] };
    }

    /**
     * Update identity section
     */
    updateIdentity(updates: Partial<UserProfile['identity']>): void {
        this.profile.identity = { ...this.profile.identity, ...updates };
        this.saveToStorage();
    }

    /**
     * Update profession section
     */
    updateProfession(updates: Partial<UserProfile['profession']>): void {
        this.profile.profession = { ...this.profile.profession, ...updates };
        this.saveToStorage();
    }

    /**
     * Update goals section
     */
    updateGoals(updates: Partial<UserProfile['goals']>): void {
        this.profile.goals = { ...this.profile.goals, ...updates };
        this.saveToStorage();
    }

    /**
     * Update patterns section
     */
    updatePatterns(updates: Partial<UserProfile['patterns']>): void {
        this.profile.patterns = { ...this.profile.patterns, ...updates };
        this.saveToStorage();
    }

    /**
     * Update AI preferences section
     */
    updateAIPreferences(updates: Partial<UserProfile['aiPreferences']>): void {
        this.profile.aiPreferences = { ...this.profile.aiPreferences, ...updates };
        this.saveToStorage();
    }

    /**
     * Update personal section
     */
    updatePersonal(updates: Partial<UserProfile['personal']>): void {
        this.profile.personal = { ...this.profile.personal, ...updates };
        this.saveToStorage();
    }

    /**
     * Update the entire profile
     */
    updateProfile(updates: Partial<UserProfile>): void {
        this.profile = this.mergeWithDefaults({ ...this.profile, ...updates });
        this.saveToStorage();
    }

    /**
     * Mark onboarding as complete
     */
    completeOnboarding(): void {
        this.profile.meta.onboardingComplete = true;
        this.saveToStorage();
    }

    /**
     * Check if onboarding is needed
     */
    needsOnboarding(): boolean {
        return !this.profile.meta.onboardingComplete;
    }

    /**
     * Get display name (nickname or name)
     */
    getDisplayName(): string {
        return this.profile.identity.nickname || this.profile.identity.name || 'there';
    }

    /**
     * Get coaching context for AI
     */
    getAIContext(): string {
        const p = this.profile;
        const lines: string[] = [];

        if (p.identity.name) {
            lines.push(`User: ${p.identity.name}${p.identity.nickname ? ` (prefers "${p.identity.nickname}")` : ''}`);
        }

        if (p.profession.role) {
            lines.push(`Role: ${p.profession.role}${p.profession.industry ? ` in ${p.profession.industry}` : ''}`);
            lines.push(`Experience: ${p.profession.experience}, Work style: ${p.profession.workStyle}`);
        }

        if (p.goals.currentFocus) {
            lines.push(`Currently focused on: ${p.goals.currentFocus}`);
        }

        if (p.goals.longTermVision) {
            lines.push(`Long-term vision: ${p.goals.longTermVision}`);
        }

        if (p.patterns.chronotype !== 'flexible') {
            lines.push(`Chronotype: ${p.patterns.chronotype === 'early_bird' ? 'Early bird' : 'Night owl'}`);
        }

        if (p.patterns.peakHours.length > 0) {
            const hours = p.patterns.peakHours.map(h => `${h.start}-${h.end}`).join(', ');
            lines.push(`Peak productivity hours: ${hours}`);
        }

        lines.push(`\nCOACHING PREFERENCES:`);
        lines.push(`- Style: ${p.aiPreferences.coachingStyle}`);
        lines.push(`- Feedback tone: ${p.aiPreferences.feedbackTone}`);
        lines.push(`- Wants affirmations: ${p.aiPreferences.wantsAffirmations ? 'Yes' : 'No'}`);
        lines.push(`- Wants accountability: ${p.aiPreferences.wantsAccountability ? 'Yes' : 'No'}`);

        if (p.personal.motivators.length > 0) {
            lines.push(`\nMotivated by: ${p.personal.motivators.join(', ')}`);
        }

        if (p.patterns.distractions.length > 0) {
            lines.push(`Common distractions: ${p.patterns.distractions.join(', ')}`);
        }

        return lines.join('\n');
    }

    /**
     * Subscribe to profile changes
     */
    subscribe(listener: (profile: UserProfile) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Notify all listeners of changes
     */
    private notifyListeners(): void {
        const profile = this.getProfile();
        this.listeners.forEach(listener => listener(profile));
    }

    /**
     * Reset profile to defaults
     */
    reset(): void {
        this.profile = { ...DEFAULT_PROFILE };
        this.profile.meta.createdAt = new Date().toISOString();
        this.saveToStorage();
    }

    /**
     * Export profile as JSON
     */
    export(): string {
        return JSON.stringify(this.profile, null, 2);
    }

    /**
     * Import profile from JSON
     */
    import(json: string): boolean {
        try {
            const imported = JSON.parse(json);
            this.profile = this.mergeWithDefaults(imported);
            this.saveToStorage();
            return true;
        } catch (error) {
            console.error('[ProfileService] Failed to import profile:', error);
            return false;
        }
    }
}

// Singleton instance
export const profileService = new ProfileService();
