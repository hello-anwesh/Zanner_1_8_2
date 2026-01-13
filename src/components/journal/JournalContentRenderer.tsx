/**
 * JournalContentRenderer - Simply renders HTML content beautifully
 * No complex parsing - just render the stored HTML with premium styling
 */

import { useMemo } from 'react';

interface JournalContentRendererProps {
    content: string;
    className?: string;
}

export function JournalContentRenderer({ content, className = '' }: JournalContentRendererProps) {
    // Process the content - convert markdown-style formatting to HTML if needed
    const processedHtml = useMemo(() => {
        if (!content || !content.trim()) return '';

        let html = content;

        // If it's plain text (no HTML tags), convert to basic HTML
        if (!html.includes('<p>') && !html.includes('<div>')) {
            // Convert newlines to paragraphs
            html = html.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join('');
            html = html.replace(/\n/g, '<br/>');
        }

        // Convert markdown bold to HTML bold if not already
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Convert markdown italic to HTML italic
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // Add breaks before section headers
        html = html.replace(/(Summary:|Emotions:|Insights:|Affirmation:|Gentle Suggestions:)/g, '<br/><br/><span class="section-header">$1</span>');

        // Style AI Reflection header
        html = html.replace(/🪞?\s*AI Reflection\s*\(([^)]+)\)/gi, '<div class="reflection-header">🪞 AI Reflection <span class="time">($1)</span></div>');

        // Style Session headers  
        html = html.replace(/Session\s*(\d+)\s*\(([^)]+)\)/gi, '<div class="session-header">📍 Session $1 <span class="time">($2)</span></div>');

        // Add list styling for insights/suggestions
        html = html.replace(/- 💡\s*/g, '<span class="insight-bullet">💡 </span>');
        html = html.replace(/- →\s*/g, '<span class="suggestion-bullet">→ </span>');
        html = html.replace(/→\s+/g, '<span class="suggestion-bullet">→ </span>');

        return html;
    }, [content]);

    if (!processedHtml) {
        return (
            <div className={`text-white/40 text-center py-12 ${className}`}>
                <p>Start writing your thoughts...</p>
            </div>
        );
    }

    return (
        <div className={className}>
            <div
                className="journal-content"
                dangerouslySetInnerHTML={{ __html: processedHtml }}
            />

            <style>{`
                .journal-content {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.95rem;
                    line-height: 1.9;
                }
                .journal-content p {
                    margin-bottom: 1rem;
                }
                .journal-content strong {
                    color: white;
                    font-weight: 600;
                    background: linear-gradient(120deg, rgba(139, 92, 246, 0.15), rgba(34, 211, 238, 0.1));
                    padding: 0.1rem 0.4rem;
                    border-radius: 4px;
                }
                .journal-content em {
                    color: rgba(250, 204, 21, 0.9);
                    font-style: italic;
                }
                .journal-content .section-header {
                    display: inline-block;
                    color: rgba(167, 139, 250, 1);
                    font-weight: 700;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-top: 1rem;
                    padding: 0.3rem 0.6rem;
                    background: rgba(139, 92, 246, 0.1);
                    border-radius: 6px;
                    border-left: 3px solid rgba(139, 92, 246, 0.5);
                }
                .journal-content .reflection-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: white;
                    font-weight: 700;
                    font-size: 1.1rem;
                    margin: 1.5rem 0 1rem 0;
                    padding: 0.75rem 1rem;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.1));
                    border-radius: 12px;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                }
                .journal-content .reflection-header .time {
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 400;
                    font-size: 0.85rem;
                }
                .journal-content .session-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: rgba(34, 211, 238, 1);
                    font-weight: 700;
                    font-size: 1rem;
                    margin: 1.5rem 0 0.75rem 0;
                    padding: 0.6rem 1rem;
                    background: rgba(34, 211, 238, 0.08);
                    border-radius: 10px;
                    border: 1px solid rgba(34, 211, 238, 0.15);
                }
                .journal-content .session-header .time {
                    color: rgba(255, 255, 255, 0.4);
                    font-weight: 400;
                    font-size: 0.8rem;
                }
                .journal-content .insight-bullet {
                    color: rgba(250, 204, 21, 1);
                }
                .journal-content .suggestion-bullet {
                    color: rgba(52, 211, 153, 1);
                    font-weight: 600;
                }
                .journal-content ul, .journal-content ol {
                    padding-left: 1.5rem;
                    margin: 0.75rem 0;
                }
                .journal-content li {
                    margin-bottom: 0.5rem;
                }
                .journal-content li::marker {
                    color: rgba(139, 92, 246, 0.6);
                }
                .journal-content blockquote {
                    border-left: 3px solid rgba(139, 92, 246, 0.4);
                    padding: 0.75rem 1rem;
                    margin: 1rem 0;
                    background: rgba(139, 92, 246, 0.05);
                    border-radius: 0 8px 8px 0;
                    color: rgba(255, 255, 255, 0.7);
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}

export default JournalContentRenderer;
