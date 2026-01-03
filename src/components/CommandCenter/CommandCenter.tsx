import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { X, Terminal, ChevronRight, Trash2 } from "lucide-react";
import { commander, CommandHistoryItem } from "../../services/commander/CommanderService";

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

    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

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
        setIsExecuting(true);

        // AI/Aliases expansion logic can go here later
        // For now, raw shell
        const result = await commander.execute(cmd, args);

        setHistory(prev => prev.map(item =>
            item.id === newItem.id ? { ...item, result } : item
        ));
        setIsExecuting(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            executeCommand(input);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIndex);
                // History is stored oldest first, but arrow up usually means "previous command"
                // Let's interpret historyIndex 0 as most recent
                const reverseHistory = [...history].reverse();
                if (newIndex >= 0 && newIndex < reverseHistory.length) {
                    setInput(reverseHistory[newIndex].cmd + " " + reverseHistory[newIndex].args.join(" "));
                }
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            const newIndex = historyIndex > -1 ? historyIndex - 1 : -1;
            setHistoryIndex(newIndex);
            if (newIndex === -1) {
                setInput("");
            } else {
                const reverseHistory = [...history].reverse();
                setInput(reverseHistory[newIndex].cmd + " " + reverseHistory[newIndex].args.join(" "));
            }
        } else if (e.key === "Escape") {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="w-[800px] h-[600px] bg-[#0c0c12] rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden relative">

                {/* Title Bar */}
                <div className="h-10 bg-white/5 border-b border-white/5 flex items-center justify-between px-4 select-none">
                    <div className="flex items-center gap-2">
                        <Terminal size={14} style={{ color: accent }} />
                        <span className="text-xs font-mono text-white/70">COMMAND_CENTER :: GOD_MODE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setHistory([])} className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-red-400 transition-colors" title="Clear History">
                            <Trash2 size={12} />
                        </button>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Output Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                >
                    <div className="text-white/30 text-xs mb-4">
                        System initialized. Shell access granted.
                        Use 'CAUTION': Commands execute directly on host OS.
                    </div>

                    {history.map((item) => (
                        <div key={item.id} className="space-y-1">
                            <div className="flex items-start gap-2 text-white/80">
                                <span style={{ color: accent }}>❯</span>
                                <span>{item.cmd} {item.args.join(" ")}</span>
                            </div>
                            {item.result ? (
                                <div className={`pl-4 border-l-2 ${item.result.success ? "border-white/10" : "border-red-500/50"}`}>
                                    {item.result.stdout && (
                                        <pre className="whitespace-pre-wrap text-white/60">{item.result.stdout}</pre>
                                    )}
                                    {item.result.stderr && (
                                        <pre className="whitespace-pre-wrap text-red-400">{item.result.stderr}</pre>
                                    )}
                                    <p className="text-[10px] text-white/20 mt-1">
                                        [Exited with {item.result.success ? "success" : "error"}]
                                    </p>
                                </div>
                            ) : (
                                <div className="pl-4 text-white/30 animate-pulse">Running...</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/2 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <ChevronRight size={18} style={{ color: accent }} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent border-none outline-none font-mono text-white/90 placeholder-white/20"
                            placeholder="Enter command..."
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                        {isExecuting && <div className="text-xs text-white/40 animate-pulse">BUSY</div>}
                    </div>
                </div>

                {/* Warning Stripe */}
                <div className="h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
