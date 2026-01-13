import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, Brain, Zap, X, ChevronRight } from 'lucide-react';

interface OnboardingProps {
    isOpen: boolean;
    onClose: () => void;
    accent: string;
}

const steps = [
    {
        title: 'Welcome to Zenner',
        description: 'Your AI-powered productivity companion',
        icon: Sparkles,
        content: (
            <div className="text-center space-y-8">
                <div className="text-7xl mb-6">⚡</div>
                <p className="text-lg text-white/70 leading-relaxed max-w-lg mx-auto">
                    Zenner combines the power of the Pomodoro Technique with AI coaching,
                    binaural frequencies, and smart analytics to help you achieve peak productivity.
                </p>
            </div>
        )
    },
    {
        title: 'Choose Your Focus Style',
        description: 'Pick a preset that matches your workflow',
        icon: Target,
        content: (
            <div className="grid grid-cols-3 gap-6">
                {[
                    { icon: '🍅', name: 'Classic Pomodoro', desc: '25/5 minutes' },
                    { icon: '🎯', name: 'Deep Work', desc: '50/10 minutes' },
                    { icon: '🌊', name: 'Flow State', desc: '90 min focus' }
                ].map((preset) => (
                    <motion.div
                        key={preset.name}
                        whileHover={{ scale: 1.05, y: -4 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 cursor-pointer text-center"
                    >
                        <div className="text-4xl mb-4">{preset.icon}</div>
                        <p className="text-base font-bold text-white mb-2">{preset.name}</p>
                        <p className="text-sm text-white/50">{preset.desc}</p>
                    </motion.div>
                ))}
            </div>
        )
    },
    {
        title: 'Meet Your AI Coach',
        description: 'Zeni learns your patterns and helps you improve',
        icon: Brain,
        content: (
            <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 rounded-2xl bg-white/5">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
                        🤖
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-lg text-white mb-2">Zeni - Your AI Companion</p>
                        <p className="text-base text-white/60 leading-relaxed">
                            I'll analyze your productivity patterns, suggest optimal break times,
                            and provide personalized insights to help you work smarter.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <div className="p-5 rounded-xl bg-white/5">
                        <p className="text-sm font-bold text-white/70 mb-2">📊 Smart Analytics</p>
                        <p className="text-sm text-white/50">Track your progress over time</p>
                    </div>
                    <div className="p-5 rounded-xl bg-white/5">
                        <p className="text-sm font-bold text-white/70 mb-2">🎵 Focus Sounds</p>
                        <p className="text-sm text-white/50">Binaural beats & frequencies</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: 'Keyboard Shortcuts',
        description: 'Work faster with shortcuts',
        icon: Zap,
        content: (
            <div className="space-y-4">
                {[
                    { key: 'CMD + K', desc: 'Command palette' },
                    { key: 'Space', desc: 'Start/Pause timer' },
                    { key: 'R', desc: 'Reset timer' },
                    { key: '1, 2, 3', desc: 'Quick switch presets' },
                    { key: 'A', desc: 'View analytics' },
                    { key: 'S', desc: 'Session history' }
                ].map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between p-5 rounded-xl bg-white/5">
                        <span className="text-base text-white/70">{shortcut.desc}</span>
                        <kbd className="px-4 py-2 rounded-lg bg-white/10 text-sm font-mono text-white font-bold">
                            {shortcut.key}
                        </kbd>
                    </div>
                ))}
            </div>
        )
    }
];

export function Onboarding({ isOpen, onClose, accent }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
            localStorage.setItem('zenner-onboarding-completed', 'true');
        }
    };

    const handleSkip = () => {
        onClose();
        localStorage.setItem('zenner-onboarding-completed', 'true');
    };

    if (!isOpen) return null;

    const step = steps[currentStep];
    const Icon = step.icon;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[200] flex items-center justify-center p-8"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(165deg, rgba(18,18,24,0.98) 0%, rgba(12,12,16,0.99) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.8)'
                    }}
                >
                    {/* Skip Button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-8 right-8 p-3 rounded-xl hover:bg-white/10 transition-all z-10"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {/* Content */}
                    <div className="p-16">
                        {/* Icon & Title */}
                        <div className="text-center mb-12">
                            <motion.div
                                key={currentStep}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', damping: 15 }}
                                className="w-24 h-24 mx-auto mb-8 rounded-3xl flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, ${accent}, ${accent}DD)`,
                                    boxShadow: `0 16px 48px ${accent}50`
                                }}
                            >
                                <Icon size={40} color="#000" strokeWidth={2.5} />
                            </motion.div>
                            <motion.h2
                                key={`title-${currentStep}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-black text-white mb-4"
                            >
                                {step.title}
                            </motion.h2>
                            <motion.p
                                key={`desc-${currentStep}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-lg text-white/60"
                            >
                                {step.description}
                            </motion.p>
                        </div>

                        {/* Step Content */}
                        <motion.div
                            key={`content-${currentStep}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-12"
                        >
                            {step.content}
                        </motion.div>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-3 mb-10">
                            {steps.map((_, index) => (
                                <motion.div
                                    key={index}
                                    className="h-2.5 rounded-full transition-all"
                                    style={{
                                        width: currentStep === index ? '40px' : '10px',
                                        background: currentStep === index ? accent : 'rgba(255,255,255,0.2)'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-6">
                            <button
                                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                disabled={currentStep === 0}
                                className="px-8 py-4 rounded-xl font-bold text-base bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                                Back
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNext}
                                className="px-10 py-4 rounded-xl font-bold text-base flex items-center gap-3"
                                style={{
                                    background: `linear-gradient(135deg, ${accent}, ${accent}DD)`,
                                    color: '#000',
                                    boxShadow: `0 12px 32px ${accent}40`
                                }}
                            >
                                {isLastStep ? 'Get Started' : 'Next'}
                                <ChevronRight size={20} />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Helper to check if onboarding should be shown
export function shouldShowOnboarding(): boolean {
    return !localStorage.getItem('zenner-onboarding-completed');
}
