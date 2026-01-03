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
            "bg-[#001015]/60 border border-[#00f3ff]/30 backdrop-blur-md p-4 pointer-events-auto rounded-none clip-path-polygon relative group transition-all duration-300 hover:border-[#00f3ff]/60",
            "flex flex-col gap-2",
            alignment,
            className
        )}>
            {/* Corner Decals */}
            <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-[#00f3ff]" />
            <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-[#00f3ff]" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-[#00f3ff]" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-[#00f3ff]" />

            {/* Title Tag */}
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#00f3ff] mb-2 pl-1 border-l-2 border-[#00f3ff]/50">
                {title} // SYSTEM_READY
            </div>

            {children}
        </div>
    );
}
