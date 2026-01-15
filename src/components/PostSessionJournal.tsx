/**
 * Post-Session Journal Modal
 * Quick journaling prompt that appears after completing a focus session
 * Now with AI Reflection support
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Send, Clock, Target, Zap, Sparkles, Loader2 } from 'lucide-react';
import { sessionNotesService } from '../services/journal/SessionNotesService';
import { journalAIService } from '../services/journal/JournalAIService';

interface PostSessionJournalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionData: {
        sessionNumber: number;
        duration: number;
        startTime: Date;
        endTime: Date;
        type: 'focus' | 'break';
    };
}

const QUICK_REFLECTIONS = [
    { emoji: '🎯', text: 'Focused and productive' },
    { emoji: '💪', text: 'Made good progress' },
    { emoji: '🧠', text: 'Learned something new' },
    { emoji: '🚧', text: 'Hit some blockers' },
    { emoji: '😊', text: 'Feeling good' },
    { emoji: '😓', text: 'Was difficult' },
];

export function PostSessionJournal({ isOpen, onClose, sessionData }: PostSessionJournalProps) {
    const [notes, setNotes] = useState('');
    const [selectedReflections, setSelectedReflections] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isReflecting, setIsReflecting] = useState(false);
    const [aiReflection, setAiReflection] = useState<string | null>(null);

    const toggleReflection = (text: string) => {
        setSelectedReflections(prev =>
            prev.includes(text)
                ? prev.filter(r => r !== text)
                : [...prev, text]
        );
    };

    const handleAIReflect = async () => {
        if (!notes.trim() && selectedReflections.length === 0) return;

        setIsReflecting(true);
        try {
            // Build content for AI reflection
            let contentForAI = '';
            if (selectedReflections.length > 0) {
                contentForAI += `Session feelings: ${selectedReflections.join(', ')}\n\n`;
            }
            if (notes.trim()) {
                contentForAI += `Session notes: ${notes.trim()}`;
            }

            // Create entry-like object for AI reflection
            const entry = {
                id: 0,
                date: new Date().toLocaleDateString('en-US'),
                content: contentForAI,
                created_at: Date.now(),
                updated_at: Date.now()
            };

            const result = await journalAIService.getReflection(entry as any);

            if (result) {
                // Format the AI reflection nicely
                let formattedReflection = '';
                formattedReflection += `**Summary:** ${result.summary}\n\n`;

                if (result.emotions) {
                    formattedReflection += `**Emotions:** ${result.emotions.primary}`;
                    if (result.emotions.secondary) {
                        formattedReflection += ` + ${result.emotions.secondary}`;
                    }
                    formattedReflection += `\n\n`;
                }

                if (result.affirmation) {
                    formattedReflection += `**✨ ${result.affirmation}**\n\n`;
                }

                if (result.suggestions && result.suggestions.length > 0) {
                    formattedReflection += `**Suggestions:**\n`;
                    result.suggestions.forEach((s: string) => {
                        formattedReflection += `• ${s}\n`;
                    });
                }

                setAiReflection(formattedReflection);
            }
        } catch (error) {
            console.error('AI Reflection failed:', error);
        } finally {
            setIsReflecting(false);
        }
    };

    const handleSave = async () => {
        if (!notes.trim() && selectedReflections.length === 0 && !aiReflection) {
            onClose();
            return;
        }

        setIsSaving(true);
        try {
            // Save to SessionNotesService as a first-class entity
            await sessionNotesService.createNote({
                sessionNumber: sessionData.sessionNumber,
                duration: sessionData.duration,
                type: sessionData.type,
                startTime: sessionData.startTime,
                endTime: sessionData.endTime,
                quickReflections: selectedReflections,
                notes: notes.trim(),
                aiReflection: aiReflection
            });

            setSaved(true);
            setTimeout(() => {
                onClose();
                setNotes('');
                setSelectedReflections([]);
                setAiReflection(null);
                setSaved(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to save session note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkip = () => {
        setNotes('');
        setSelectedReflections([]);
        setAiReflection(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                onClick={handleSkip}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 max-w-lg w-full border border-white/10 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
                                <BookOpen className="text-green-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Session Complete!</h2>
                                <p className="text-sm text-white/50">Quick reflection on your focus time</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSkip}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Session Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-white/5 text-center">
                            <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-white">#{sessionData.sessionNumber}</div>
                            <div className="text-xs text-white/40">Session</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 text-center">
                            <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-white">{sessionData.duration}m</div>
                            <div className="text-xs text-white/40">Duration</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 text-center">
                            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-white">{sessionData.type}</div>
                            <div className="text-xs text-white/40">Type</div>
                        </div>
                    </div>

                    {/* Quick Reflections */}
                    <div className="mb-6">
                        <p className="text-sm text-white/60 mb-3">How was this session?</p>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_REFLECTIONS.map((item) => (
                                <button
                                    key={item.text}
                                    onClick={() => toggleReflection(item.text)}
                                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${selectedReflections.includes(item.text)
                                        ? 'bg-green-500/20 border-green-500/50 text-green-300 border'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                                        }`}
                                >
                                    {item.emoji} {item.text}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes Input */}
                    <div className="mb-6">
                        <p className="text-sm text-white/60 mb-2">Any notes? (optional)</p>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="What did you accomplish? Any thoughts?"
                            className="w-full h-24 p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-green-500/50 resize-none transition-all"
                        />
                    </div>

                    {/* AI Reflection Result */}
                    {aiReflection && (
                        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30">
                            <div className="flex items-center gap-2 text-purple-300 mb-3">
                                <Sparkles size={16} />
                                <span className="text-sm font-bold">AI Reflection</span>
                            </div>
                            <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                                {aiReflection.split('\n').map((line, i) => (
                                    <p key={i} className="mb-1">{line.replace(/\*\*/g, '')}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={handleSkip}
                            className="px-4 py-4 rounded-2xl bg-white/5 text-white/60 font-medium hover:bg-white/10 transition-all"
                        >
                            Skip
                        </button>

                        {/* AI Reflect Button */}
                        <button
                            onClick={handleAIReflect}
                            disabled={isReflecting || (!notes.trim() && selectedReflections.length === 0)}
                            className="flex-1 px-4 py-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                            {isReflecting ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Sparkles size={18} />
                            )}
                            {isReflecting ? 'Reflecting...' : aiReflection ? 'Reflect Again' : 'AI Reflect'}
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 px-4 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:shadow-2xl hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saved ? (
                                <>✓ Saved!</>
                            ) : isSaving ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
