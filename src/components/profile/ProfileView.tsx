/**
 * ProfileView - User Profile Management
 * Premium, airy design with proper spacing
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Briefcase, Target, Clock, Brain, Heart,
    ChevronRight, Check, Plus, X as _X, Sparkles,
    Sun, Moon, Zap, MessageSquare, Bell,
    Coffee, Sunrise, CircleDot
} from 'lucide-react';
import { profileService } from '../../services/profile/ProfileService';
import {
    UserProfile,
    INDUSTRIES,
    COMMON_DISTRACTIONS,
    COMMON_FOCUS_TRIGGERS,
    COMMON_MOTIVATORS,
    COMMON_STRESSORS,
    COMMON_HOBBIES
} from '../../services/profile/profileTypes';

interface ProfileViewProps {
    accent: string;
}

type Section = 'identity' | 'profession' | 'goals' | 'patterns' | 'ai' | 'personal';

const SECTIONS: { id: Section; label: string; icon: typeof User; description: string }[] = [
    { id: 'identity', label: 'About You', icon: User, description: 'Your name and preferences' },
    { id: 'profession', label: 'Your Work', icon: Briefcase, description: 'Role and work context' },
    { id: 'goals', label: 'Your Goals', icon: Target, description: 'What you\'re working toward' },
    { id: 'patterns', label: 'Your Patterns', icon: Clock, description: 'When and how you work best' },
    { id: 'ai', label: 'AI Coach', icon: Brain, description: 'How the AI should interact with you' },
    { id: 'personal', label: 'Personal', icon: Heart, description: 'Optional deeper context' },
];

export function ProfileView({ accent }: ProfileViewProps) {
    const [profile, setProfile] = useState<UserProfile>(profileService.getProfile());
    const [activeSection, setActiveSection] = useState<Section>('identity');

    useEffect(() => {
        const unsub = profileService.subscribe(setProfile);
        return () => unsub();
    }, []);

    // ============================================================
    // REUSABLE COMPONENTS
    // ============================================================

    // Chip multi-select component
    const ChipSelector = ({
        options,
        selected,
        onChange,
        customizable = true,
        maxItems = 10
    }: {
        options: string[];
        selected: string[];
        onChange: (items: string[]) => void;
        customizable?: boolean;
        maxItems?: number;
    }) => {
        const [customInput, setCustomInput] = useState('');
        const [showCustom, setShowCustom] = useState(false);

        const toggle = (item: string) => {
            if (selected.includes(item)) {
                onChange(selected.filter(i => i !== item));
            } else if (selected.length < maxItems) {
                onChange([...selected, item]);
            }
        };

        const addCustom = () => {
            if (customInput.trim() && !selected.includes(customInput.trim())) {
                onChange([...selected, customInput.trim()]);
                setCustomInput('');
                setShowCustom(false);
            }
        };

        return (
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2.5">
                    {options.map(option => (
                        <button
                            key={option}
                            onClick={() => toggle(option)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selected.includes(option)
                                ? 'text-black shadow-lg'
                                : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/70 border border-white/[0.06]'
                                }`}
                            style={selected.includes(option) ? {
                                background: accent,
                                boxShadow: `0 4px 20px ${accent}40`
                            } : {}}
                        >
                            {selected.includes(option) && <Check size={12} className="inline mr-1.5 -mt-0.5" />}
                            {option}
                        </button>
                    ))}
                    {customizable && !showCustom && (
                        <button
                            onClick={() => setShowCustom(true)}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-transparent text-white/30 hover:text-white/50 border border-dashed border-white/10 hover:border-white/20 flex items-center gap-1.5 transition-all"
                        >
                            <Plus size={14} /> Add
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {showCustom && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-3"
                        >
                            <input
                                type="text"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                                placeholder="Type and press Enter"
                                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm outline-none focus:border-white/20 transition-all"
                                autoFocus
                            />
                            <button onClick={addCustom} className="px-4 py-3 rounded-xl bg-white/[0.06] text-white/60 hover:bg-white/[0.1] transition-all">
                                <Check size={18} />
                            </button>
                            <button onClick={() => setShowCustom(false)} className="px-4 py-3 rounded-xl bg-white/[0.03] text-white/30 hover:bg-white/[0.06] transition-all">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // Card selector for single choice
    const CardSelector = ({
        options,
        value,
        onChange,
        columns = 2
    }: {
        options: { id: string; label: string; description: string; icon?: typeof Sun }[];
        value: string;
        onChange: (value: string) => void;
        columns?: number;
    }) => (
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {options.map(option => {
                const Icon = option.icon;
                const isSelected = value === option.id;
                return (
                    <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onChange(option.id)}
                        className={`p-5 rounded-2xl text-left transition-all duration-200 ${isSelected
                            ? 'border-2'
                            : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
                            }`}
                        style={isSelected ? {
                            background: `${accent}08`,
                            borderColor: `${accent}60`
                        } : {}}
                    >
                        <div className="flex items-start gap-4">
                            {Icon && (
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: isSelected ? `${accent}20` : 'rgba(255,255,255,0.03)' }}
                                >
                                    <Icon size={20} style={{ color: isSelected ? accent : 'rgba(255,255,255,0.4)' }} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-semibold mb-1 ${isSelected ? 'text-white' : 'text-white/60'}`}>
                                    {option.label}
                                </div>
                                <div className="text-xs text-white/35 leading-relaxed">{option.description}</div>
                            </div>
                            {isSelected && (
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                    style={{ background: accent }}
                                >
                                    <Check size={14} className="text-black" />
                                </div>
                            )}
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );

    // Input field component
    const InputField = ({
        label,
        value,
        onChange,
        placeholder,
        multiline = false,
        hint
    }: {
        label: string;
        value: string;
        onChange: (value: string) => void;
        placeholder: string;
        multiline?: boolean;
        hint?: string;
    }) => (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-white/60">{label}</label>
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-white/15 focus:bg-white/[0.04] transition-all resize-none text-[15px] leading-relaxed"
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-white/15 focus:bg-white/[0.04] transition-all text-[15px]"
                />
            )}
            {hint && <p className="text-xs text-white/30 leading-relaxed">{hint}</p>}
        </div>
    );

    // Toggle switch
    const Toggle = ({
        label,
        description,
        value,
        onChange
    }: {
        label: string;
        description: string;
        value: boolean;
        onChange: (value: boolean) => void;
    }) => (
        <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="pr-4">
                <div className="text-sm font-medium text-white/80 mb-1">{label}</div>
                <div className="text-xs text-white/35 leading-relaxed">{description}</div>
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`w-14 h-8 rounded-full transition-all duration-300 flex items-center shrink-0 ${value ? 'justify-end' : 'justify-start'}`}
                style={{ background: value ? accent : 'rgba(255,255,255,0.08)' }}
            >
                <div className="w-6 h-6 rounded-full bg-white shadow-lg mx-1" />
            </button>
        </div>
    );

    // Section Label
    const SectionLabel = ({ children }: { children: string }) => (
        <label className="block text-sm font-semibold text-white/60 mb-4">{children}</label>
    );

    // ============================================================
    // SECTION RENDERERS
    // ============================================================

    const renderSection = () => {
        switch (activeSection) {
            case 'identity':
                return (
                    <div className="space-y-8">
                        <InputField
                            label="Your Name"
                            value={profile.identity.name}
                            onChange={(v) => profileService.updateIdentity({ name: v })}
                            placeholder="What's your name?"
                        />
                        <InputField
                            label="Nickname"
                            value={profile.identity.nickname}
                            onChange={(v) => profileService.updateIdentity({ nickname: v })}
                            placeholder="What should the AI call you?"
                            hint="The AI will use this in conversations to make it feel more personal"
                        />

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-white/60">Timezone</label>
                                <div className="px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white/40 text-[15px]">
                                    {profile.identity.timezone}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-white/60">Language</label>
                                <div className="px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-white/40 text-[15px]">
                                    {profile.identity.language}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'profession':
                return (
                    <div className="space-y-10">
                        <InputField
                            label="Your Role"
                            value={profile.profession.role}
                            onChange={(v) => profileService.updateProfession({ role: v })}
                            placeholder="e.g., Software Engineer, Designer, Product Manager"
                        />

                        <div>
                            <SectionLabel>Industry</SectionLabel>
                            <div className="flex flex-wrap gap-2.5">
                                {INDUSTRIES.map(industry => (
                                    <button
                                        key={industry}
                                        onClick={() => profileService.updateProfession({ industry })}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${profile.profession.industry === industry
                                            ? 'text-black'
                                            : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.06] border border-white/[0.06]'
                                            }`}
                                        style={profile.profession.industry === industry ? {
                                            background: accent,
                                            boxShadow: `0 4px 20px ${accent}40`
                                        } : {}}
                                    >
                                        {industry}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <SectionLabel>Experience Level</SectionLabel>
                            <CardSelector
                                options={[
                                    { id: 'student', label: 'Student', description: 'Learning and growing' },
                                    { id: 'junior', label: 'Junior', description: '0-2 years experience' },
                                    { id: 'mid', label: 'Mid-level', description: '2-5 years experience' },
                                    { id: 'senior', label: 'Senior', description: '5+ years experience' },
                                    { id: 'executive', label: 'Executive', description: 'Leadership role' },
                                ]}
                                value={profile.profession.experience}
                                onChange={(v) => profileService.updateProfession({ experience: v as any })}
                                columns={3}
                            />
                        </div>

                        <div>
                            <SectionLabel>Work Style</SectionLabel>
                            <CardSelector
                                options={[
                                    { id: 'remote', label: 'Fully Remote', description: 'Work from home or anywhere', icon: Coffee },
                                    { id: 'hybrid', label: 'Hybrid', description: 'Mix of office and remote', icon: CircleDot },
                                    { id: 'office', label: 'In-Office', description: 'Work from the office', icon: Briefcase },
                                ]}
                                value={profile.profession.workStyle}
                                onChange={(v) => profileService.updateProfession({ workStyle: v as any })}
                                columns={3}
                            />
                        </div>
                    </div>
                );

            case 'goals':
                return (
                    <div className="space-y-10">
                        <InputField
                            label="What are you currently focused on?"
                            value={profile.goals.currentFocus}
                            onChange={(v) => profileService.updateGoals({ currentFocus: v })}
                            placeholder="e.g., Launching my startup, Learning a new skill, Finishing a project"
                            hint="This helps the AI provide relevant encouragement and context-aware support"
                        />

                        <div>
                            <SectionLabel>Short-term Goals</SectionLabel>
                            <ChipSelector
                                options={[]}
                                selected={profile.goals.shortTermGoals}
                                onChange={(v) => profileService.updateGoals({ shortTermGoals: v })}
                                maxItems={5}
                            />
                            <p className="text-xs text-white/30 mt-3">Add 3-5 goals for this week or month</p>
                        </div>

                        <InputField
                            label="Long-term Vision"
                            value={profile.goals.longTermVision}
                            onChange={(v) => profileService.updateGoals({ longTermVision: v })}
                            placeholder="Where do you want to be in 1-5 years?"
                            multiline
                        />

                        <InputField
                            label="Why does productivity matter to you?"
                            value={profile.goals.whyProductivity}
                            onChange={(v) => profileService.updateGoals({ whyProductivity: v })}
                            placeholder="What drives you to be productive?"
                            multiline
                            hint="The AI will reference this when you need motivation"
                        />
                    </div>
                );

            case 'patterns':
                return (
                    <div className="space-y-10">
                        <div>
                            <SectionLabel>Are you an early bird or night owl?</SectionLabel>
                            <CardSelector
                                options={[
                                    { id: 'early_bird', label: 'Early Bird', description: 'Most productive in the morning', icon: Sunrise },
                                    { id: 'night_owl', label: 'Night Owl', description: 'Peak focus in the evening/night', icon: Moon },
                                    { id: 'flexible', label: 'Flexible', description: 'Depends on the day', icon: Sun },
                                ]}
                                value={profile.patterns.chronotype}
                                onChange={(v) => profileService.updatePatterns({ chronotype: v as any })}
                                columns={3}
                            />
                        </div>

                        <div>
                            <SectionLabel>Preferred Session Length</SectionLabel>
                            <div className="flex items-center gap-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                                <input
                                    type="range"
                                    min="15"
                                    max="90"
                                    step="5"
                                    value={profile.patterns.preferredSessionLength}
                                    onChange={(e) => profileService.updatePatterns({ preferredSessionLength: parseInt(e.target.value) })}
                                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, ${accent} ${((profile.patterns.preferredSessionLength - 15) / 75) * 100}%, rgba(255,255,255,0.1) ${((profile.patterns.preferredSessionLength - 15) / 75) * 100}%)`
                                    }}
                                />
                                <div
                                    className="w-20 text-center py-3 rounded-xl font-bold text-sm shrink-0"
                                    style={{ background: `${accent}15`, color: accent }}
                                >
                                    {profile.patterns.preferredSessionLength} min
                                </div>
                            </div>
                        </div>

                        <div>
                            <SectionLabel>Common Distractions</SectionLabel>
                            <ChipSelector
                                options={COMMON_DISTRACTIONS}
                                selected={profile.patterns.distractions}
                                onChange={(v) => profileService.updatePatterns({ distractions: v })}
                            />
                        </div>

                        <div>
                            <SectionLabel>What helps you focus?</SectionLabel>
                            <ChipSelector
                                options={COMMON_FOCUS_TRIGGERS}
                                selected={profile.patterns.focusTriggers}
                                onChange={(v) => profileService.updatePatterns({ focusTriggers: v })}
                            />
                        </div>
                    </div>
                );

            case 'ai':
                return (
                    <div className="space-y-10">
                        <div>
                            <SectionLabel>Coaching Style</SectionLabel>
                            <CardSelector
                                options={[
                                    { id: 'supportive', label: 'Supportive', description: 'Warm, encouraging, understanding', icon: Heart },
                                    { id: 'challenging', label: 'Challenging', description: 'Pushes you out of comfort zone', icon: Zap },
                                    { id: 'analytical', label: 'Analytical', description: 'Data-driven, logical, precise', icon: Brain },
                                    { id: 'motivational', label: 'Motivational', description: 'Inspiring, energetic, positive', icon: Sparkles },
                                ]}
                                value={profile.aiPreferences.coachingStyle}
                                onChange={(v) => profileService.updateAIPreferences({ coachingStyle: v as any })}
                            />
                        </div>

                        <div>
                            <SectionLabel>Feedback Tone</SectionLabel>
                            <CardSelector
                                options={[
                                    { id: 'gentle', label: 'Gentle', description: 'Soft, kind, patient', icon: Heart },
                                    { id: 'direct', label: 'Direct', description: 'Honest, straightforward', icon: MessageSquare },
                                    { id: 'encouraging', label: 'Encouraging', description: 'Uplifting, positive focus', icon: Sparkles },
                                    { id: 'no_nonsense', label: 'No Nonsense', description: 'Just the facts, minimal fluff', icon: Zap },
                                ]}
                                value={profile.aiPreferences.feedbackTone}
                                onChange={(v) => profileService.updateAIPreferences({ feedbackTone: v as any })}
                            />
                        </div>

                        <div>
                            <SectionLabel>Reminder Frequency</SectionLabel>
                            <CardSelector
                                options={[
                                    { id: 'minimal', label: 'Minimal', description: 'Only when essential', icon: Bell },
                                    { id: 'moderate', label: 'Moderate', description: 'Balanced reminders', icon: Bell },
                                    { id: 'frequent', label: 'Frequent', description: 'Keep me on track often', icon: Bell },
                                ]}
                                value={profile.aiPreferences.reminderFrequency}
                                onChange={(v) => profileService.updateAIPreferences({ reminderFrequency: v as any })}
                                columns={3}
                            />
                        </div>

                        <div className="space-y-4">
                            <SectionLabel>Preferences</SectionLabel>
                            <Toggle
                                label="Affirmations"
                                description="Include positive affirmations in coaching"
                                value={profile.aiPreferences.wantsAffirmations}
                                onChange={(v) => profileService.updateAIPreferences({ wantsAffirmations: v })}
                            />
                            <Toggle
                                label="Accountability"
                                description="Hold me accountable for my goals"
                                value={profile.aiPreferences.wantsAccountability}
                                onChange={(v) => profileService.updateAIPreferences({ wantsAccountability: v })}
                            />
                            <Toggle
                                label="Insights"
                                description="Provide analysis and patterns about my work"
                                value={profile.aiPreferences.wantsInsights}
                                onChange={(v) => profileService.updateAIPreferences({ wantsInsights: v })}
                            />
                        </div>
                    </div>
                );

            case 'personal':
                return (
                    <div className="space-y-10">
                        <div className="p-5 rounded-2xl bg-purple-500/[0.08] border border-purple-500/20">
                            <p className="text-sm text-purple-300/80 leading-relaxed">
                                🎯 This section is optional but helps the AI understand you better for more personalized coaching.
                            </p>
                        </div>

                        <div>
                            <SectionLabel>Hobbies & Interests</SectionLabel>
                            <ChipSelector
                                options={COMMON_HOBBIES}
                                selected={profile.personal.hobbies}
                                onChange={(v) => profileService.updatePersonal({ hobbies: v })}
                            />
                        </div>

                        <div>
                            <SectionLabel>What motivates you?</SectionLabel>
                            <ChipSelector
                                options={COMMON_MOTIVATORS}
                                selected={profile.personal.motivators}
                                onChange={(v) => profileService.updatePersonal({ motivators: v })}
                            />
                        </div>

                        <div>
                            <SectionLabel>Common stressors</SectionLabel>
                            <ChipSelector
                                options={COMMON_STRESSORS}
                                selected={profile.personal.stressors}
                                onChange={(v) => profileService.updatePersonal({ stressors: v })}
                            />
                        </div>

                        <div>
                            <SectionLabel>Communication Style</SectionLabel>
                            <CardSelector
                                options={[
                                    { id: 'detailed', label: 'Detailed', description: 'Give me all the context' },
                                    { id: 'concise', label: 'Concise', description: 'Keep it short and sweet' },
                                    { id: 'casual', label: 'Casual', description: 'Friendly and relaxed' },
                                    { id: 'formal', label: 'Formal', description: 'Professional and proper' },
                                ]}
                                value={profile.personal.communicationStyle}
                                onChange={(v) => profileService.updatePersonal({ communicationStyle: v as any })}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const currentSectionData = SECTIONS.find(s => s.id === activeSection)!;
    const CurrentIcon = currentSectionData.icon;

    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/[0.06] p-8 flex flex-col">
                {/* Profile Completion */}
                <div className="mb-10 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-white/50">Profile Complete</span>
                        <span className="text-sm font-bold" style={{ color: accent }}>
                            {profile.meta.completionPercentage}%
                        </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: accent }}
                            initial={{ width: 0 }}
                            animate={{ width: `${profile.meta.completionPercentage}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                {/* Section Navigation */}
                <nav className="flex-1 space-y-2">
                    {SECTIONS.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <motion.button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                whileHover={{ x: 4 }}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 ${isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                                    }`}
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{
                                        background: isActive ? `${accent}15` : 'rgba(255,255,255,0.03)'
                                    }}
                                >
                                    <Icon size={18} style={{ color: isActive ? accent : 'rgba(255,255,255,0.4)' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/50'}`}>
                                        {section.label}
                                    </div>
                                </div>
                                {isActive && <ChevronRight size={16} style={{ color: accent }} />}
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Auto-save indicator */}
                <div className="mt-auto pt-6 flex items-center gap-2 text-white/25 text-xs">
                    <Check size={12} />
                    <span>Changes save automatically</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="p-12"
                    >
                        {/* Section Header */}
                        <div className="flex items-center gap-5 mb-12">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{ background: `${accent}12` }}
                            >
                                <CurrentIcon size={28} style={{ color: accent }} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{currentSectionData.label}</h2>
                                <p className="text-white/40">{currentSectionData.description}</p>
                            </div>
                        </div>

                        {/* Section Content */}
                        <div className="max-w-2xl">
                            {renderSection()}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
