/**
 * Session Notes Timeline
 * Displays session notes as beautiful timeline cards
 * Separate from the main journal content
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Target, Sparkles, ChevronDown, ChevronUp, Trash2, Heart, Lightbulb, Brain, Smile } from 'lucide-react';
import { sessionNotesService, SessionNote } from '../../services/journal/SessionNotesService';
import { getTimeString } from '../../utils/dateUtils';

/**
 * Premium AI Reflection Card
 * Parses markdown-like content and renders it beautifully
 */
function AIReflectionCard({ content }: { content: string }) {
    // Parse the reflection content into sections
    const parseReflection = (text: string) => {
        const sections: { type: string; label: string; content: string; icon: any }[] = [];

        // Extract Summary
        const summaryMatch = text.match(/\*\*Summary:\*\*\s*([^\n]+)/i);
        if (summaryMatch) {
            sections.push({
                type: 'summary',
                label: 'Summary',
                content: summaryMatch[1].trim(),
                icon: Brain
            });
        }

        // Extract Emotions
        const emotionsMatch = text.match(/\*\*Emotions:\*\*\s*([^\n]+)/i);
        if (emotionsMatch) {
            sections.push({
                type: 'emotions',
                label: 'Emotions',
                content: emotionsMatch[1].trim(),
                icon: Smile
            });
        }

        // Extract Affirmation (the ✨ line)
        const affirmationMatch = text.match(/\*\*✨\s*([^*]+)\*\*/i) || text.match(/\*\*[✨⭐🌟]\s*([^*]+)\*\*/i);
        if (affirmationMatch) {
            sections.push({
                type: 'affirmation',
                label: 'Affirmation',
                content: affirmationMatch[1].trim(),
                icon: Heart
            });
        }

        // Extract Suggestions
        const suggestionsMatch = text.match(/\*\*Suggestions:\*\*\s*([\s\S]*?)(?=\n\n|$)/i);
        if (suggestionsMatch) {
            const suggestionsText = suggestionsMatch[1].trim();
            const suggestions = suggestionsText
                .split(/[•\-]/)
                .map(s => s.trim())
                .filter(s => s.length > 0);

            if (suggestions.length > 0) {
                sections.push({
                    type: 'suggestions',
                    label: 'Suggestions',
                    content: suggestions.join('|||'),
                    icon: Lightbulb
                });
            }
        }

        return sections;
    };

    const sections = parseReflection(content);

    // If no sections parsed, show raw content in a nice format
    if (sections.length === 0) {
        return (
            <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-pink-500/10 border border-purple-500/20 overflow-hidden">
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-purple-500/20">
                            <Sparkles size={14} className="text-purple-400" />
                        </div>
                        <h4 className="text-sm font-semibold text-purple-300">AI Reflection</h4>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-pink-500/10 border border-purple-500/20 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-purple-500/10 bg-purple-500/5">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                        <Sparkles size={14} className="text-purple-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-purple-300">AI Reflection</h4>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {sections.map((section, index) => {
                    const Icon = section.icon;

                    // Special rendering for affirmation
                    if (section.type === 'affirmation') {
                        return (
                            <div
                                key={index}
                                className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/20"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/20 mt-0.5">
                                        <Heart size={14} className="text-amber-400" />
                                    </div>
                                    <p className="text-sm text-amber-200/90 font-medium italic leading-relaxed">
                                        ✨ {section.content}
                                    </p>
                                </div>
                            </div>
                        );
                    }

                    // Special rendering for suggestions
                    if (section.type === 'suggestions') {
                        const suggestions = section.content.split('|||');
                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center gap-2 text-white/50">
                                    <Lightbulb size={12} />
                                    <span className="text-xs font-medium uppercase tracking-wider">Suggestions</span>
                                </div>
                                <div className="space-y-2 pl-1">
                                    {suggestions.map((suggestion, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="text-cyan-400 mt-1.5">•</span>
                                            <p className="text-sm text-white/70 leading-relaxed">{suggestion}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    // Default rendering for summary/emotions
                    const iconColors: Record<string, string> = {
                        summary: 'text-purple-400 bg-purple-500/20',
                        emotions: 'text-pink-400 bg-pink-500/20',
                    };
                    const colorClass = iconColors[section.type] || 'text-purple-400 bg-purple-500/20';

                    return (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2 text-white/50">
                                <div className={`p-1 rounded ${colorClass.split(' ')[1]}`}>
                                    <Icon size={12} className={colorClass.split(' ')[0]} />
                                </div>
                                <span className="text-xs font-medium uppercase tracking-wider">{section.label}</span>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed pl-6">{section.content}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface SessionNotesTimelineProps {
    date: string; // YYYY-MM-DD
    onRefresh?: () => void;
}

export function SessionNotesTimeline({ date, onRefresh }: SessionNotesTimelineProps) {
    const [notes, setNotes] = useState<SessionNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        loadNotes();
    }, [date]);

    const loadNotes = async () => {
        setLoading(true);
        try {
            const sessionNotes = await sessionNotesService.getNotesForDate(date);
            setNotes(sessionNotes);
        } catch (error) {
            console.error('[SessionNotesTimeline] Failed to load:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this session note?')) return;

        try {
            await sessionNotesService.deleteNote(id);
            await loadNotes();
            onRefresh?.();
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-white/5 rounded-xl" />
                ))}
            </div>
        );
    }

    if (notes.length === 0) {
        return null; // Don't show anything if no session notes
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Target size={16} className="text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white/80">
                        Session Notes
                    </h3>
                    <p className="text-xs text-white/40">
                        {notes.length} session{notes.length !== 1 ? 's' : ''} logged
                    </p>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 border-l-2 border-white/10 space-y-4">
                <AnimatePresence>
                    {notes.map((note, index) => {
                        const isExpanded = expandedId === note.id;
                        const endTime = new Date(note.ended_at.replace('T', ' '));

                        return (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative"
                            >
                                {/* Timeline dot */}
                                <div className="absolute -left-[25px] top-3 w-3 h-3 rounded-full bg-cyan-500/50 border-2 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />

                                {/* Card */}
                                <div className="rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden hover:border-white/20 transition-all">
                                    {/* Card Header - Always visible */}
                                    <button
                                        onClick={() => toggleExpand(note.id)}
                                        className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 text-white/60">
                                                <Clock size={14} />
                                                <span className="text-sm font-medium">
                                                    {getTimeString(endTime)}
                                                </span>
                                            </div>
                                            <span className="text-white/30">•</span>
                                            <span className="text-sm text-white/50">
                                                Session {note.session_number}
                                            </span>
                                            <span className="text-white/30">•</span>
                                            <span className="text-xs text-white/40">
                                                {note.duration} min {note.type}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {note.ai_reflection && (
                                                <Sparkles size={14} className="text-purple-400" />
                                            )}
                                            {isExpanded ? (
                                                <ChevronUp size={16} className="text-white/40" />
                                            ) : (
                                                <ChevronDown size={16} className="text-white/40" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Quick Reflections - Shown on collapsed too if present */}
                                    {note.quick_reflections.length > 0 && (
                                        <div className="px-4 pb-3 flex flex-wrap gap-2">
                                            {note.quick_reflections.map((reflection, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                                >
                                                    {reflection}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Expanded Content */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/5"
                                            >
                                                <div className="p-4 space-y-4">
                                                    {/* Notes */}
                                                    {note.notes && (
                                                        <div>
                                                            <h4 className="text-xs font-medium text-white/40 mb-2">Notes</h4>
                                                            <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                                                                {note.notes}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* AI Reflection - Premium Styled */}
                                                    {note.ai_reflection && (
                                                        <AIReflectionCard content={note.ai_reflection} />
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                                                        <button
                                                            onClick={() => handleDelete(note.id)}
                                                            className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default SessionNotesTimeline;
