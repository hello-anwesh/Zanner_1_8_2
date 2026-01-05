import { invoke } from "@tauri-apps/api/core";
import { eventBus } from "../events/EventBus";

export interface CommandResult {
    stdout: string;
    stderr: string;
    success: boolean;
    timestamp: number;
    isAppCommand?: boolean;
}

export interface CommandHistoryItem {
    id: string;
    cmd: string;
    args: string[];
    result?: CommandResult;
    timestamp: number;
}

export interface AppCommand {
    name: string;
    aliases: string[];
    description: string;
    category: "timer" | "music" | "ai" | "app" | "system";
    usage: string;
    handler: (args: string[]) => Promise<CommandResult>;
}

class CommanderService {
    private appCommands: Map<string, AppCommand> = new Map();

    // Callbacks for app state control (set by App.tsx)
    private callbacks: {
        startTimer?: () => void;
        pauseTimer?: () => void;
        resetTimer?: () => void;
        setMode?: (mode: "focus" | "shortBreak" | "longBreak") => void;
        setTheme?: (theme: string) => void;
        playMusic?: (url: string, name: string) => void;
        stopMusic?: () => void;
        openView?: (view: string) => void;
        toggleCoach?: () => void;
    } = {};

    constructor() {
        this.registerBuiltInCommands();
    }

    setCallbacks(cbs: typeof this.callbacks) {
        this.callbacks = { ...this.callbacks, ...cbs };
    }

    private registerBuiltInCommands() {
        // === TIMER COMMANDS ===
        this.register({
            name: "start",
            aliases: ["s", "go", "begin"],
            description: "Start the timer",
            category: "timer",
            usage: "start",
            handler: async () => {
                if (this.callbacks.startTimer) {
                    this.callbacks.startTimer();
                    eventBus.emit({ type: "SESSION_START", mode: "focus" });
                    return this.success("▶️ Timer started");
                }
                return this.error("Timer not connected");
            }
        });

        this.register({
            name: "pause",
            aliases: ["p", "stop", "halt"],
            description: "Pause the timer",
            category: "timer",
            usage: "pause",
            handler: async () => {
                if (this.callbacks.pauseTimer) {
                    this.callbacks.pauseTimer();
                    return this.success("⏸️ Timer paused");
                }
                return this.error("Timer not connected");
            }
        });

        this.register({
            name: "reset",
            aliases: ["r", "restart"],
            description: "Reset the timer",
            category: "timer",
            usage: "reset",
            handler: async () => {
                if (this.callbacks.resetTimer) {
                    this.callbacks.resetTimer();
                    return this.success("🔄 Timer reset");
                }
                return this.error("Timer not connected");
            }
        });

        this.register({
            name: "focus",
            aliases: ["f", "work"],
            description: "Switch to focus mode",
            category: "timer",
            usage: "focus",
            handler: async () => {
                if (this.callbacks.setMode) {
                    this.callbacks.setMode("focus");
                    return this.success("🎯 Focus mode activated");
                }
                return this.error("Timer not connected");
            }
        });

        this.register({
            name: "break",
            aliases: ["b", "rest"],
            description: "Switch to short break",
            category: "timer",
            usage: "break",
            handler: async () => {
                if (this.callbacks.setMode) {
                    this.callbacks.setMode("shortBreak");
                    return this.success("☕ Short break mode");
                }
                return this.error("Timer not connected");
            }
        });

        // === MUSIC COMMANDS ===
        this.register({
            name: "play",
            aliases: ["music"],
            description: "Play focus music",
            category: "music",
            usage: "play [track-name]",
            handler: async (_args) => {
                // For now just emit play event, later can search by name
                return this.success("🎵 Use the music player or coach for track selection");
            }
        });

        this.register({
            name: "mute",
            aliases: ["quiet", "silence"],
            description: "Stop all audio",
            category: "music",
            usage: "mute",
            handler: async () => {
                if (this.callbacks.stopMusic) {
                    this.callbacks.stopMusic();
                    return this.success("🔇 Audio muted");
                }
                return this.success("🔇 No active audio");
            }
        });

        // === APP COMMANDS ===
        this.register({
            name: "theme",
            aliases: ["t", "color"],
            description: "Change app theme",
            category: "app",
            usage: "theme <name>",
            handler: async (args) => {
                if (!args[0]) {
                    return this.error("Usage: theme <name>\nAvailable: midnight, ocean, forest, sunset, lavender, ember, arctic, cyber, mint, rose");
                }
                if (this.callbacks.setTheme) {
                    this.callbacks.setTheme(args[0]);
                    return this.success(`🎨 Theme changed to "${args[0]}"`);
                }
                return this.error("Theme controller not connected");
            }
        });

        this.register({
            name: "stats",
            aliases: ["analytics", "history"],
            description: "View session statistics",
            category: "app",
            usage: "stats",
            handler: async () => {
                if (this.callbacks.openView) {
                    this.callbacks.openView("stats");
                    return this.success("📊 Opening analytics...");
                }
                return this.error("Navigation not connected");
            }
        });

        this.register({
            name: "coach",
            aliases: ["ai", "zen", "zenner"],
            description: "Toggle AI coach panel",
            category: "ai",
            usage: "coach",
            handler: async () => {
                if (this.callbacks.toggleCoach) {
                    this.callbacks.toggleCoach();
                    return this.success("🧘 Toggling coach...");
                }
                return this.error("Coach not connected");
            }
        });

        this.register({
            name: "home",
            aliases: ["h", "dashboard"],
            description: "Go to home/timer view",
            category: "app",
            usage: "home",
            handler: async () => {
                if (this.callbacks.openView) {
                    this.callbacks.openView("home");
                    return this.success("🏠 Going home...");
                }
                return this.error("Navigation not connected");
            }
        });

        this.register({
            name: "integrations",
            aliases: ["int", "connect"],
            description: "Open integrations hub",
            category: "app",
            usage: "integrations",
            handler: async () => {
                if (this.callbacks.openView) {
                    this.callbacks.openView("integrations");
                    return this.success("🔌 Opening integrations...");
                }
                return this.error("Navigation not connected");
            }
        });

        this.register({
            name: "frequencies",
            aliases: ["freq", "hz", "binaural"],
            description: "Open frequency generator",
            category: "app",
            usage: "frequencies",
            handler: async () => {
                if (this.callbacks.openView) {
                    this.callbacks.openView("frequencies");
                    return this.success("🔊 Opening frequencies...");
                }
                return this.error("Navigation not connected");
            }
        });

        // === HELP ===
        this.register({
            name: "help",
            aliases: ["?", "commands", "h"],
            description: "Show all available commands",
            category: "app",
            usage: "help [command]",
            handler: async (args) => {
                if (args[0]) {
                    const cmd = this.appCommands.get(args[0]) ||
                        [...this.appCommands.values()].find(c => c.aliases.includes(args[0]));
                    if (cmd) {
                        return this.success(
                            `${cmd.name.toUpperCase()}\n` +
                            `├─ ${cmd.description}\n` +
                            `├─ Usage: ${cmd.usage}\n` +
                            `├─ Aliases: ${cmd.aliases.join(", ") || "none"}\n` +
                            `└─ Category: ${cmd.category}`
                        );
                    }
                    return this.error(`Unknown command: ${args[0]}`);
                }

                const categories = new Map<string, AppCommand[]>();
                for (const cmd of this.appCommands.values()) {
                    if (!categories.has(cmd.category)) {
                        categories.set(cmd.category, []);
                    }
                    categories.get(cmd.category)!.push(cmd);
                }

                let output = "╭─────────────────────────────────╮\n";
                output += "│     COMMAND CENTER - HELP       │\n";
                output += "╰─────────────────────────────────╯\n\n";

                const icons: Record<string, string> = {
                    timer: "⏱️",
                    music: "🎵",
                    ai: "🤖",
                    app: "📱",
                    system: "💻"
                };

                for (const [cat, cmds] of categories) {
                    output += `${icons[cat] || "📌"} ${cat.toUpperCase()}\n`;
                    for (const cmd of cmds) {
                        output += `   ${cmd.name.padEnd(12)} ${cmd.description}\n`;
                    }
                    output += "\n";
                }

                output += "💡 Type 'help <command>' for details\n";
                output += "💡 Use shell commands directly (ls, git, etc.)";

                return this.success(output);
            }
        });

        this.register({
            name: "clear",
            aliases: ["cls", "clr"],
            description: "Clear terminal history",
            category: "app",
            usage: "clear",
            handler: async () => {
                // This is handled specially in the component
                return { stdout: "__CLEAR__", stderr: "", success: true, timestamp: Date.now(), isAppCommand: true };
            }
        });
    }

    register(command: AppCommand) {
        this.appCommands.set(command.name, command);
        for (const alias of command.aliases) {
            this.appCommands.set(alias, command);
        }
    }

    getCommands(): AppCommand[] {
        // Deduplicate (aliases point to same command)
        const seen = new Set<string>();
        const result: AppCommand[] = [];
        for (const cmd of this.appCommands.values()) {
            if (!seen.has(cmd.name)) {
                seen.add(cmd.name);
                result.push(cmd);
            }
        }
        return result;
    }

    getSuggestions(partial: string): AppCommand[] {
        const lower = partial.toLowerCase();
        return this.getCommands().filter(cmd =>
            cmd.name.startsWith(lower) ||
            cmd.aliases.some(a => a.startsWith(lower))
        ).slice(0, 5);
    }

    async execute(cmd: string, args: string[] = []): Promise<CommandResult> {
        const lowerCmd = cmd.toLowerCase();

        // Check app commands first
        const appCmd = this.appCommands.get(lowerCmd);
        if (appCmd) {
            const result = await appCmd.handler(args);
            result.isAppCommand = true;
            return result;
        }

        // Fall back to shell
        try {
            const stdout = await invoke<string>("run_shell_cmd", { cmd, args });
            return {
                stdout,
                stderr: "",
                success: true,
                timestamp: Date.now()
            };
        } catch (error) {
            return {
                stdout: "",
                stderr: String(error),
                success: false,
                timestamp: Date.now()
            };
        }
    }

    private success(msg: string): CommandResult {
        return { stdout: msg, stderr: "", success: true, timestamp: Date.now() };
    }

    private error(msg: string): CommandResult {
        return { stdout: "", stderr: msg, success: false, timestamp: Date.now() };
    }
}

export const commander = new CommanderService();
