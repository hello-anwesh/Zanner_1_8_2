/**
 * RichTextEditor - Clean, premium editor for Journal writing
 * Minimal, beautiful interface for user input
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { useCallback } from 'react';
import {
    Bold, Italic, List, ListOrdered,
    Quote, Undo, Redo, Heading2
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    autoSaveStatus?: 'idle' | 'saving' | 'saved' | 'unsaved';
}

export function RichTextEditor({
    content,
    onChange,
    placeholder = "Start writing...",
    autoSaveStatus = 'idle'
}: RichTextEditorProps) {

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Placeholder.configure({ placeholder }),
            Highlight,
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return (
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                <div className="animate-pulse h-64 bg-white/5 rounded-xl" />
            </div>
        );
    }

    const ToolbarButton = ({ onClick, isActive = false, disabled = false, children, title }: {
        onClick: () => void; isActive?: boolean; disabled?: boolean; children: React.ReactNode; title?: string;
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2.5 rounded-xl transition-all ${isActive ? 'bg-purple-500/20 text-purple-300' : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );

    return (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
            {/* Minimal Toolbar */}
            <div className="flex items-center gap-1 px-4 py-3 border-b border-white/5 bg-white/[0.01]">
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
                    <Undo size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
                    <Redo size={16} />
                </ToolbarButton>

                <div className="w-px h-5 bg-white/10 mx-2" />

                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading">
                    <Heading2 size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
                    <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
                    <Italic size={16} />
                </ToolbarButton>

                <div className="w-px h-5 bg-white/10 mx-2" />

                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
                    <List size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
                    <ListOrdered size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
                    <Quote size={16} />
                </ToolbarButton>

                <div className="flex-1" />

                {/* Save status */}
                {autoSaveStatus !== 'idle' && (
                    <span className={`text-xs px-3 py-1.5 rounded-full ${autoSaveStatus === 'saving' ? 'bg-yellow-500/10 text-yellow-400' :
                            autoSaveStatus === 'saved' ? 'bg-green-500/10 text-green-400' :
                                'bg-orange-500/10 text-orange-400'
                        }`}>
                        {autoSaveStatus === 'saving' ? 'Saving...' : autoSaveStatus === 'saved' ? '✓ Saved' : '○ Unsaved'}
                    </span>
                )}
            </div>

            {/* Editor */}
            <div className="min-h-[350px] max-h-[500px] overflow-y-auto">
                <EditorContent editor={editor} className="journal-editor" />
            </div>

            {/* Clean, Premium Styles */}
            <style>{`
                .journal-editor .ProseMirror {
                    min-height: 350px;
                    padding: 1.5rem;
                    outline: none;
                    font-size: 1rem;
                    line-height: 1.8;
                    color: rgba(255, 255, 255, 0.85);
                }
                .journal-editor .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: rgba(255, 255, 255, 0.2);
                    pointer-events: none;
                    height: 0;
                    font-style: italic;
                }
                .journal-editor .ProseMirror h2 {
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin: 1.5rem 0 0.75rem 0;
                    color: white;
                }
                .journal-editor .ProseMirror h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 1.25rem 0 0.5rem 0;
                    color: rgba(255, 255, 255, 0.9);
                }
                .journal-editor .ProseMirror p {
                    margin-bottom: 1rem;
                }
                .journal-editor .ProseMirror strong {
                    color: white;
                    font-weight: 600;
                }
                .journal-editor .ProseMirror em {
                    color: rgba(255, 255, 255, 0.9);
                    font-style: italic;
                }
                .journal-editor .ProseMirror ul, .journal-editor .ProseMirror ol {
                    padding-left: 1.5rem;
                    margin: 1rem 0;
                }
                .journal-editor .ProseMirror li {
                    margin-bottom: 0.4rem;
                }
                .journal-editor .ProseMirror li::marker {
                    color: rgba(139, 92, 246, 0.6);
                }
                .journal-editor .ProseMirror blockquote {
                    border-left: 3px solid rgba(139, 92, 246, 0.4);
                    padding-left: 1rem;
                    margin: 1rem 0;
                    color: rgba(255, 255, 255, 0.7);
                    font-style: italic;
                }
                .journal-editor .ProseMirror mark {
                    background: rgba(250, 204, 21, 0.25);
                    color: inherit;
                    padding: 0.1rem 0.2rem;
                    border-radius: 2px;
                }
            `}</style>
        </div>
    );
}

export default RichTextEditor;
