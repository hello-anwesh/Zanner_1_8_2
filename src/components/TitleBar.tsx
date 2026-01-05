import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { X, Minus, Square } from "lucide-react";

export function TitleBar() {
    const [appWindow, setAppWindow] = useState<any>(null);

    useEffect(() => {
        // Dynamic import to avoid SSR issues if any, though standard import works in pure SPA
        setAppWindow(getCurrentWindow());
    }, []);

    return (
        <div
            data-tauri-drag-region
            className="h-10 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-[100] transition-colors duration-300 hover:bg-white/5 group"
        >
            {/* Left spacer / Title */}
            <div className="flex items-center gap-2 pointer-events-none select-none opacity-0 group-hover:opacity-60 transition-opacity">
                <img src="/logo.png" className="w-4 h-4 opacity-50 grayscale" alt="" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-white/40">ZENNER</span>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => appWindow?.minimize()}
                    className="p-1.5 rounded-md hover:bg-white/10 opacity-40 hover:opacity-100 transition-all text-white"
                    title="Minimize"
                >
                    <Minus size={14} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => appWindow?.toggleMaximize()}
                    className="p-1.5 rounded-md hover:bg-white/10 opacity-40 hover:opacity-100 transition-all text-white"
                    title="Maximize"
                >
                    <Square size={12} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => appWindow?.close()}
                    className="p-1.5 rounded-md hover:bg-red-500/20 hover:text-red-400 opacity-40 hover:opacity-100 transition-all text-white"
                    title="Close"
                >
                    <X size={14} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}
