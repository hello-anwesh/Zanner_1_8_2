import { cn } from "../../lib/utils";
import { ReactNode } from "react";

interface HUDPanelProps {
    title: string;
    side: "left" | "right" | "center" | "bottom";
    children: ReactNode;
    className?: string;
}

export function HUDPanel({ title, side, children, className }: HUDPanelProps) {
    const alignment =
        side === "left" ? "self-start items-start" :
            side === "right" ? "self-end items-end" :
                side === "center" ? "self-center items-center" : "self-center items-center w-full max-w-2xl";

    return (
        <div className={cn(
            "backdrop-blur-xl p-6 pointer-events-auto rounded-2xl relative group transition-all duration-300",
            "flex flex-col gap-4",
            alignment,
            className
        )}
            style={{
                background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.08) 0%, rgba(0, 16, 21, 0.85) 100%)',
                border: '1px solid rgba(0, 243, 255, 0.25)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 243, 255, 0.15) inset'
            }}
        >
            {/* Subtle ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px]"
                    style={{ background: 'radial-gradient(circle, rgba(0, 243, 255, 0.15) 0%, transparent 70%)' }}
                />
            </div>

            {/* Title Tag */}
            <div className="relative z-10 text-xs uppercase tracking-wider font-bold text-[#00f3ff] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse"
                    style={{ boxShadow: '0 0 8px #00f3ff' }}
                />
                {title}
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
