/**
 * Post-Session Journal Modal
 * Quick journaling prompt that appears after completing a focus session
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Send, Clock, Target, Zap } from 'lucide-react';
import { journalService } from '../services/journal/JournalService';

interface PostSessionJournalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionData: {
        sessionNumber: number;
        duration: number; // in minutes
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

    const toggleReflection = (text: string) => {
        setSelectedReflections(prev =>
            prev.includes(text)
                ? prev.filter(r => r !== text)
                : [...prev, text]
        );
    };

    const handleSave = async () => {
        if (!notes.trim() && selectedReflections.length === 0) {
            onClose();
            return;
        }

        setIsSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const existingEntry = await journalService.getEntry(today);

            // Build session note content
            const timeStr = sessionData.endTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
            });

            let sessionNote = `\n\n---\n## Session ${sessionData.sessionNumber} (${timeStr})\n`;
            sessionNote += `*${sessionData.duration} min ${sessionData.type} session*\n\n`;

            if (selectedReflections.length > 0) {
                sessionNote += selectedReflections.join(' • ') + '\n\n';
            }

            if (notes.trim()) {
                sessionNote += notes.trim() + '\n';
            }

            // Append to existing entry or create new
            const newContent = existingEntry
                ? existingEntry.content + sessionNote
                : `# ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n${sessionNote}`;

            const tags = existingEntry?.tags || [];
            if (!tags.includes('session-notes')) {
                tags.push('session-notes');
            }

            await journalService.createOrUpdateEntry(
                today,
                newContent,
                existingEntry?.mood,
                tags
            );

            setSaved(true);
            setTimeout(() => {
                onClose();
                // Reset state
                setNotes('');
                setSelectedReflections([]);
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
                    className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 max-w-lg w-full border border-white/10"
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
                            <X size={20} className="text-white/70" />
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

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSkip}
                            className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-white/60 font-medium hover:bg-white/10 transition-all"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:shadow-2xl hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saved ? (
                                <>✓ Saved!</>
                            ) : isSaving ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Save Note
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
