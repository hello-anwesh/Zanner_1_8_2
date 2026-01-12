/**
 * ProfileView - User Profile Management
 * A comprehensive, beautiful profile editor
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Briefcase, Target, Clock, Brain, Heart,
    ChevronRight, Check, Plus, X, Sparkles, Save,
    Sun, Moon, Zap, MessageSquare, Bell, Shield,
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
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    useEffect(() => {
        const unsub = profileService.subscribe(setProfile);
        return () => unsub();
    }, []);

    const handleSave = () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 500);
    };

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
            <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    {options.map(option => (
                        <button
                            key={option}
                            onClick={() => toggle(option)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selected.includes(option)
                                    ? 'text-black'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                                }`}
                            style={selected.includes(option) ? { background: accent } : {}}
                        >
                            {selected.includes(option) && <Check size={12} className="inline mr-1" />}
                            {option}
                        </button>
                    ))}
                    {customizable && !showCustom && (
                        <button
                            onClick={() => setShowCustom(true)}
                            className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/5 text-white/40 hover:bg-white/10 border border-dashed border-white/20 flex items-center gap-1"
                        >
                            <Plus size={14} /> Add custom
                        </button>
                    )}
                </div>
                {showCustom && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                            placeholder="Type and press Enter"
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
                            autoFocus
                        />
                        <button onClick={addCustom} className="px-3 py-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/15">
                            <Check size={16} />
                        </button>
                        <button onClick={() => setShowCustom(false)} className="px-3 py-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10">
                            <X size={16} />
                        </button>
                    </div>
                )}
                {selected.length > 0 && (
                    <div className="text-xs text-white/40">
                        {selected.length} selected {maxItems < 20 && `(max ${maxItems})`}
                    </div>
                )}
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
        <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {options.map(option => {
                const Icon = option.icon;
                const isSelected = value === option.id;
                return (
                    <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onChange(option.id)}
                        className={`p-4 rounded-2xl text-left transition-all ${isSelected
                                ? 'border-2'
                                : 'bg-white/5 border border-white/10 hover:bg-white/8'
                            }`}
                        style={isSelected ? {
                            background: `${accent}15`,
                            borderColor: accent
                        } : {}}
                    >
                        <div className="flex items-start gap-3">
                            {Icon && (
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: isSelected ? `${accent}30` : 'rgba(255,255,255,0.05)' }}
                                >
                                    <Icon size={20} style={{ color: isSelected ? accent : 'rgba(255,255,255,0.5)' }} />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                    {option.label}
                                </div>
                                <div className="text-xs text-white/40 mt-0.5">{option.description}</div>
                            </div>
                            {isSelected && (
                                <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center"
                                    style={{ background: accent }}
                                >
                                    <Check size={12} className="text-black" />
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
        <div className="space-y-2">
            <label className="block text-sm font-bold text-white/70">{label}</label>
            {multiline ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-all resize-none"
                />
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-all"
                />
            )}
            {hint && <p className="text-xs text-white/40">{hint}</p>}
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
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="text-xs text-white/40">{description}</div>
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`w-12 h-7 rounded-full transition-all flex items-center ${value ? 'justify-end' : 'justify-start'}`}
                style={{ background: value ? accent : 'rgba(255,255,255,0.1)' }}
            >
                <div className="w-5 h-5 rounded-full bg-white shadow-md mx-1" />
            </button>
        </div>
    );

    // Render section content
    const renderSection = () => {
        switch (activeSection) {
            case 'identity':
                return (
                    <div className="space-y-6">
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
                            hint="The AI will use this in conversations"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-white/70">Timezone</label>
                                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm">
                                    {profile.identity.timezone}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-white/70">Language</label>
                                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm">
                                    {profile.identity.language}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'profession':
                return (
                    <div className="space-y-6">
                        <InputField
                            label="Your Role"
                            value={profile.profession.role}
                            onChange={(v) => profileService.updateProfession({ role: v })}
                            placeholder="e.g., Software Engineer, Designer, Product Manager"
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Industry</label>
                            <div className="flex flex-wrap gap-2">
                                {INDUSTRIES.map(industry => (
                                    <button
                                        key={industry}
                                        onClick={() => profileService.updateProfession({ industry })}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${profile.profession.industry === industry
                                                ? 'text-black'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                                            }`}
                                        style={profile.profession.industry === industry ? { background: accent } : {}}
                                    >
                                        {industry}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Experience Level</label>
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

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Work Style</label>
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
                    <div className="space-y-6">
                        <InputField
                            label="What are you currently focused on?"
                            value={profile.goals.currentFocus}
                            onChange={(v) => profileService.updateGoals({ currentFocus: v })}
                            placeholder="e.g., Launching my startup, Learning a new skill, Finishing a project"
                            hint="This helps the AI provide relevant encouragement"
                        />

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Short-term Goals</label>
                            <ChipSelector
                                options={[]}
                                selected={profile.goals.shortTermGoals}
                                onChange={(v) => profileService.updateGoals({ shortTermGoals: v })}
                                maxItems={5}
                            />
                            <p className="text-xs text-white/40">Add 3-5 goals for this week or month</p>
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
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Are you an early bird or night owl?</label>
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

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Preferred Session Length</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="15"
                                    max="90"
                                    step="5"
                                    value={profile.patterns.preferredSessionLength}
                                    onChange={(e) => profileService.updatePatterns({ preferredSessionLength: parseInt(e.target.value) })}
                                    className="flex-1 accent-current"
                                    style={{ accentColor: accent }}
                                />
                                <div
                                    className="w-16 text-center py-2 rounded-lg font-bold text-sm"
                                    style={{ background: `${accent}20`, color: accent }}
                                >
                                    {profile.patterns.preferredSessionLength}m
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Common Distractions</label>
                            <ChipSelector
                                options={COMMON_DISTRACTIONS}
                                selected={profile.patterns.distractions}
                                onChange={(v) => profileService.updatePatterns({ distractions: v })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">What helps you focus?</label>
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
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Coaching Style</label>
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

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Feedback Tone</label>
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

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Reminder Frequency</label>
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

                        <div className="space-y-3">
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
                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                            <p className="text-sm text-purple-300">
                                🎯 This section is optional but helps the AI understand you better for more personalized coaching.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Hobbies & Interests</label>
                            <ChipSelector
                                options={COMMON_HOBBIES}
                                selected={profile.personal.hobbies}
                                onChange={(v) => profileService.updatePersonal({ hobbies: v })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">What motivates you?</label>
                            <ChipSelector
                                options={COMMON_MOTIVATORS}
                                selected={profile.personal.motivators}
                                onChange={(v) => profileService.updatePersonal({ motivators: v })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Common stressors</label>
                            <ChipSelector
                                options={COMMON_STRESSORS}
                                selected={profile.personal.stressors}
                                onChange={(v) => profileService.updatePersonal({ stressors: v })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-white/70">Communication Style</label>
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
            <div className="w-72 border-r border-white/10 p-6 space-y-2">
                {/* Profile Completion */}
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white/70">Profile Complete</span>
                        <span className="text-sm font-bold" style={{ color: accent }}>
                            {profile.meta.completionPercentage}%
                        </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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
                {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                        <motion.button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            whileHover={{ x: 4 }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${isActive ? 'bg-white/10' : 'hover:bg-white/5'
                                }`}
                        >
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{
                                    background: isActive ? `${accent}20` : 'rgba(255,255,255,0.05)'
                                }}
                            >
                                <Icon size={18} style={{ color: isActive ? accent : 'rgba(255,255,255,0.5)' }} />
                            </div>
                            <div className="flex-1">
                                <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-white/60'}`}>
                                    {section.label}
                                </div>
                            </div>
                            {isActive && <ChevronRight size={16} className="text-white/30" />}
                        </motion.button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Section Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ background: `${accent}20` }}
                            >
                                <CurrentIcon size={28} style={{ color: accent }} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{currentSectionData.label}</h2>
                                <p className="text-white/50">{currentSectionData.description}</p>
                            </div>
                        </div>

                        {/* Section Content */}
                        <div className="max-w-2xl">
                            {renderSection()}
                        </div>

                        {/* Auto-save indicator */}
                        <div className="mt-8 flex items-center gap-2 text-white/40 text-sm">
                            <Check size={14} />
                            <span>Changes save automatically</span>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
