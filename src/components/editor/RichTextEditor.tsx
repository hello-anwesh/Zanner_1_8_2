/**
 * RichTextEditor - Premium WYSIWYG markdown editor for Journal
 * Uses TipTap for rich text editing with proper toolbar and features
 */

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useEffect, useCallback } from 'react';
import {
    Bold, Italic, Strikethrough, List, ListOrdered,
    Quote, Code, Highlighter, Link as LinkIcon,
    CheckSquare, Undo, Redo, Heading1, Heading2, Heading3,
    Sparkles, Share2, Mail, Download
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    onAIReflect?: () => void;
    onShare?: () => void;
    onEmail?: () => void;
    onExport?: () => void;
    isReflecting?: boolean;
    autoSaveStatus?: 'idle' | 'saving' | 'saved';
}

export function RichTextEditor({
    content,
    onChange,
    placeholder = "Start writing...",
    onAIReflect,
    onShare,
    onEmail,
    onExport,
    isReflecting = false,
    autoSaveStatus = 'idle'
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Link.configure({
                openOnClick: true,
                HTMLAttributes: {
                    class: 'text-purple-400 hover:text-purple-300 underline',
                },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[300px] px-6 py-4',
            },
        },
    });

    // Update content when it changes externally
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    if (!editor) {
        return (
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                <div className="animate-pulse h-64 bg-white/5 rounded-xl" />
            </div>
        );
    }

    const ToolbarButton = ({
        onClick,
        isActive = false,
        disabled = false,
        children,
        title
    }: {
        onClick: () => void;
        isActive?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
        title?: string;
    }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-2 rounded-lg transition-all ${isActive
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
            {children}
        </button>
    );

    const Divider = () => <div className="w-px h-6 bg-white/10 mx-1" />;

    return (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-4 py-3 border-b border-white/10 bg-white/[0.02] flex-wrap">
                {/* Undo/Redo */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo"
                >
                    <Undo size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo"
                >
                    <Redo size={16} />
                </ToolbarButton>

                <Divider />

                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 size={16} />
                </ToolbarButton>

                <Divider />

                {/* Text formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Strikethrough"
                >
                    <Strikethrough size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive('highlight')}
                    title="Highlight"
                >
                    <Highlighter size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    isActive={editor.isActive('code')}
                    title="Code"
                >
                    <Code size={16} />
                </ToolbarButton>

                <Divider />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    isActive={editor.isActive('taskList')}
                    title="Task List"
                >
                    <CheckSquare size={16} />
                </ToolbarButton>

                <Divider />

                {/* Block elements */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={setLink}
                    isActive={editor.isActive('link')}
                    title="Add Link"
                >
                    <LinkIcon size={16} />
                </ToolbarButton>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action buttons */}
                {onAIReflect && (
                    <button
                        onClick={onAIReflect}
                        disabled={isReflecting}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:from-purple-500/30 hover:to-cyan-500/30 transition-all disabled:opacity-50"
                    >
                        <Sparkles size={14} className={isReflecting ? 'animate-spin' : ''} />
                        {isReflecting ? 'Reflecting...' : 'AI Reflect'}
                    </button>
                )}

                {onShare && (
                    <ToolbarButton onClick={onShare} title="Share">
                        <Share2 size={16} />
                    </ToolbarButton>
                )}

                {onEmail && (
                    <ToolbarButton onClick={onEmail} title="Email">
                        <Mail size={16} />
                    </ToolbarButton>
                )}

                {onExport && (
                    <ToolbarButton onClick={onExport} title="Export">
                        <Download size={16} />
                    </ToolbarButton>
                )}

                {/* Save status */}
                {autoSaveStatus !== 'idle' && (
                    <span className={`text-xs px-3 py-1 rounded-full ml-2 ${autoSaveStatus === 'saving'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-green-500/20 text-green-300'
                        }`}>
                        {autoSaveStatus === 'saving' ? 'Saving...' : '✓ Saved'}
                    </span>
                )}
            </div>

            {/* Editor */}
            <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
                <EditorContent
                    editor={editor}
                    className="text-white/90 leading-relaxed"
                />
            </div>

            {/* Editor Styles */}
            <style>{`
                .ProseMirror {
                    min-height: 400px;
                    padding: 1.5rem;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: rgba(255, 255, 255, 0.25);
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    color: white;
                }
                .ProseMirror h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.75rem;
                    color: rgba(255, 255, 255, 0.95);
                }
                .ProseMirror h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: rgba(255, 255, 255, 0.9);
                }
                .ProseMirror p {
                    margin-bottom: 1rem;
                    color: rgba(255, 255, 255, 0.8);
                    line-height: 1.8;
                }
                .ProseMirror ul, .ProseMirror ol {
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .ProseMirror li {
                    margin-bottom: 0.5rem;
                    color: rgba(255, 255, 255, 0.8);
                }
                .ProseMirror blockquote {
                    border-left: 4px solid rgba(139, 92, 246, 0.5);
                    padding-left: 1rem;
                    margin: 1rem 0;
                    color: rgba(255, 255, 255, 0.6);
                    font-style: italic;
                }
                .ProseMirror code {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.9em;
                }
                .ProseMirror pre {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 1rem;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 1rem 0;
                }
                .ProseMirror mark {
                    background: rgba(250, 204, 21, 0.3);
                    color: inherit;
                    padding: 0.1rem 0.2rem;
                    border-radius: 2px;
                }
                .ProseMirror ul[data-type="taskList"] {
                    list-style: none;
                    padding-left: 0;
                }
                .ProseMirror ul[data-type="taskList"] li {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                }
                .ProseMirror ul[data-type="taskList"] li > label {
                    flex: 0 0 auto;
                    margin-top: 0.25rem;
                }
                .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
                    width: 1.1rem;
                    height: 1.1rem;
                    accent-color: #8B5CF6;
                    cursor: pointer;
                }
                .ProseMirror ul[data-type="taskList"] li > div {
                    flex: 1 1 auto;
                }
                .ProseMirror hr {
                    border: none;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 2rem 0;
                }
                .ProseMirror a {
                    color: #A78BFA;
                    text-decoration: underline;
                }
                .ProseMirror a:hover {
                    color: #C4B5FD;
                }
            `}</style>
        </div>
    );
}

export default RichTextEditor;
