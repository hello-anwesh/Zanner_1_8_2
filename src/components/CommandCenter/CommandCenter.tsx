import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Terminal, ChevronRight, Trash2, Sparkles } from "lucide-react";
import { commander, CommandHistoryItem, AppCommand } from "../../services/commander/CommanderService";

interface CommandCenterProps {
    isOpen: boolean;
    onClose: () => void;
    accent: string;
}

export function CommandCenter({ isOpen, onClose, accent }: CommandCenterProps) {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<CommandHistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isExecuting, setIsExecuting] = useState(false);
    const [suggestions, setSuggestions] = useState<AppCommand[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            // Show welcome on first open
            if (history.length === 0) {
                setHistory([{
                    id: "welcome",
                    cmd: "help",
                    args: [],
                    timestamp: Date.now(),
                    result: {
                        stdout: "Welcome to Command Center! Type 'help' to see all commands.",
                        stderr: "",
                        success: true,
                        timestamp: Date.now(),
                        isAppCommand: true
                    }
                }]);
            }
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    // Update suggestions as user types
    useEffect(() => {
        if (input.trim()) {
            const parts = input.split(" ");
            if (parts.length === 1) {
                setSuggestions(commander.getSuggestions(input.trim()));
                setSelectedSuggestion(0);
            } else {
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    }, [input]);

    const executeCommand = async (cmdString: string) => {
        if (!cmdString.trim()) return;

        const parts = cmdString.trim().split(" ");
        const cmd = parts[0];
        const args = parts.slice(1);

        const newItem: CommandHistoryItem = {
            id: crypto.randomUUID(),
            cmd,
            args,
            timestamp: Date.now()
        };

        setHistory(prev => [...prev, newItem]);
        setInput("");
        setHistoryIndex(-1);
        setSuggestions([]);
        setIsExecuting(true);

        const result = await commander.execute(cmd, args);

        // Handle special clear command
        if (result.stdout === "__CLEAR__") {
            setHistory([]);
            setIsExecuting(false);
            return;
        }

        setHistory(prev => prev.map(item =>
            item.id === newItem.id ? { ...item, result } : item
        ));
        setIsExecuting(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            if (suggestions.length > 0 && input.trim() && !input.includes(" ")) {
                // Auto-complete with selected suggestion
                setInput(suggestions[selectedSuggestion].name + " ");
                setSuggestions([]);
            } else {
                executeCommand(input);
            }
        } else if (e.key === "Tab" && suggestions.length > 0) {
            e.preventDefault();
            setInput(suggestions[selectedSuggestion].name + " ");
            setSuggestions([]);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (suggestions.length > 0) {
                setSelectedSuggestion(prev => Math.max(0, prev - 1));
            } else if (history.length > 0) {
                const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIndex);
                const reverseHistory = [...history].reverse();
                if (newIndex >= 0 && newIndex < reverseHistory.length) {
                    setInput(reverseHistory[newIndex].cmd + " " + reverseHistory[newIndex].args.join(" "));
                }
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (suggestions.length > 0) {
                setSelectedSuggestion(prev => Math.min(suggestions.length - 1, prev + 1));
            } else {
                const newIndex = historyIndex > -1 ? historyIndex - 1 : -1;
                setHistoryIndex(newIndex);
                if (newIndex === -1) {
                    setInput("");
                } else {
                    const reverseHistory = [...history].reverse();
                    setInput(reverseHistory[newIndex].cmd + " " + reverseHistory[newIndex].args.join(" "));
                }
            }
        } else if (e.key === "Escape") {
            if (suggestions.length > 0) {
                setSuggestions([]);
            } else {
                onClose();
            }
        }
    };

    if (!isOpen) return null;

    const categoryColors: Record<string, string> = {
        timer: "#10b981",
        music: "#8b5cf6",
        ai: "#f59e0b",
        app: "#3b82f6",
        system: "#6b7280"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
            <div
                className="w-[850px] h-[650px] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
                style={{
                    background: "linear-gradient(180deg, rgba(12,12,18,0.98) 0%, rgba(8,8,12,0.99) 100%)",
                    border: `1px solid ${accent}20`,
                    boxShadow: `0 0 100px ${accent}10, 0 0 40px rgba(0,0,0,0.5)`
                }}
            >
                {/* Title Bar */}
                <div
                    className="h-12 flex items-center justify-between px-5 select-none"
                    style={{
                        background: `linear-gradient(90deg, ${accent}08 0%, transparent 50%, ${accent}05 100%)`,
                        borderBottom: "1px solid rgba(255,255,255,0.05)"
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `${accent}20` }}
                        >
                            <Terminal size={16} style={{ color: accent }} />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-white/90">Command Center</span>
                            <span className="text-[10px] text-white/30 ml-2 font-mono">v2.0</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setHistory([])}
                            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400 transition-all"
                            title="Clear History"
                        >
                            <Trash2 size={14} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Output Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-5 font-mono text-sm space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                >
                    {history.map((item) => (
                        <div key={item.id} className="space-y-2">
                            {/* Command Input */}
                            <div className="flex items-start gap-3">
                                <span
                                    className="text-lg"
                                    style={{ color: accent }}
                                >
                                    ❯
                                </span>
                                <span className="text-white/90 font-semibold">{item.cmd}</span>
                                <span className="text-white/50">{item.args.join(" ")}</span>
                            </div>

                            {/* Result */}
                            {item.result ? (
                                <div
                                    className="ml-7 p-4 rounded-xl"
                                    style={{
                                        background: item.result.success
                                            ? "rgba(255,255,255,0.02)"
                                            : "rgba(239,68,68,0.1)",
                                        borderLeft: `3px solid ${item.result.success ? accent + "40" : "#ef4444"}`
                                    }}
                                >
                                    {item.result.stdout && (
                                        <pre className="whitespace-pre-wrap text-white/70 leading-relaxed">
                                            {item.result.stdout}
                                        </pre>
                                    )}
                                    {item.result.stderr && (
                                        <pre className="whitespace-pre-wrap text-red-400">
                                            {item.result.stderr}
                                        </pre>
                                    )}
                                </div>
                            ) : (
                                <div className="ml-7 flex items-center gap-2 text-white/30">
                                    <div
                                        className="w-2 h-2 rounded-full animate-pulse"
                                        style={{ background: accent }}
                                    />
                                    <span>Processing...</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Suggestions Popup */}
                {suggestions.length > 0 && (
                    <div
                        className="absolute left-5 right-5 bottom-24 rounded-xl overflow-hidden"
                        style={{
                            background: "rgba(20,20,28,0.98)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "0 -10px 40px rgba(0,0,0,0.3)"
                        }}
                    >
                        {suggestions.map((cmd, idx) => (
                            <div
                                key={cmd.name}
                                className={`px-4 py-3 flex items-center gap-4 cursor-pointer transition-all ${idx === selectedSuggestion ? "bg-white/10" : "hover:bg-white/5"
                                    }`}
                                onClick={() => {
                                    setInput(cmd.name + " ");
                                    setSuggestions([]);
                                    inputRef.current?.focus();
                                }}
                            >
                                <div
                                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                                    style={{
                                        background: `${categoryColors[cmd.category]}20`,
                                        color: categoryColors[cmd.category]
                                    }}
                                >
                                    {cmd.name[0].toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white/90">{cmd.name}</span>
                                        {cmd.aliases.length > 0 && (
                                            <span className="text-xs text-white/30">
                                                ({cmd.aliases.slice(0, 2).join(", ")})
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-white/40">{cmd.description}</p>
                                </div>
                                <span
                                    className="text-[10px] px-2 py-0.5 rounded-full"
                                    style={{
                                        background: `${categoryColors[cmd.category]}20`,
                                        color: categoryColors[cmd.category]
                                    }}
                                >
                                    {cmd.category}
                                </span>
                            </div>
                        ))}
                        <div className="px-4 py-2 text-[10px] text-white/30 border-t border-white/5 flex items-center gap-4">
                            <span>↑↓ Navigate</span>
                            <span>Tab Autocomplete</span>
                            <span>Enter Select</span>
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div
                    className="p-5"
                    style={{
                        background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.02) 100%)",
                        borderTop: "1px solid rgba(255,255,255,0.05)"
                    }}
                >
                    <div
                        className="flex items-center gap-4 p-4 rounded-2xl"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid ${accent}20`
                        }}
                    >
                        <ChevronRight size={20} style={{ color: accent }} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent border-none outline-none font-mono text-white/90 placeholder-white/20 text-base"
                            placeholder="Type a command or 'help'..."
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                        {isExecuting && (
                            <Sparkles size={16} className="text-white/40 animate-pulse" style={{ color: accent }} />
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-3 text-[10px] text-white/25">
                        <span>ESC Close</span>
                        <span>↑↓ History</span>
                        <span>TAB Complete</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
