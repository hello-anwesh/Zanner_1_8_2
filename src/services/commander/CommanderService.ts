import { invoke } from "@tauri-apps/api/core";

export interface CommandResult {
    stdout: string;
    stderr: string;
    success: boolean;
    timestamp: number;
}

export interface CommandHistoryItem {
    id: string;
    cmd: string;
    args: string[];
    result?: CommandResult;
    timestamp: number;
}

class CommanderServiceClass {
    async execute(cmd: string, args: string[] = []): Promise<CommandResult> {
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

    async executeScript(script: string): Promise<CommandResult> {
        // Wrapper for AppleScript generically
        // Backend handles osascript -e
        // Actually, backend expects osascript in run_shell_cmd? Or run_applescript_generic?
        // Let's use run_shell_cmd("osascript", ["-e", script]) for maximum control or use a dedicated method
        // But lib.rs has specific spotify methods.
        // It doesn't seem to expose raw generic applescript yet?
        // Wait, I saw run_applescript in lib.rs implementation but it wasn't exposed as a generic command unless I add it.
        // I'll stick to run_shell_cmd('osascript', ['-e', script]) which I enabled.

        return this.execute("osascript", ["-e", script]);
    }
}

export const commander = new CommanderServiceClass();
