/**
 * Shared Icon Components
 * Raw SVG icons to ensure consistent visibility across the app
 */

interface IconProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
    style?: React.CSSProperties;
}

export function CloseIcon({ size = 16, color = 'rgba(255,255,255,0.6)', strokeWidth = 2, style }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

export function PlayIcon({ size = 16, color = '#fff', strokeWidth = 2, style }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    );
}

export function PauseIcon({ size = 16, color = '#fff', strokeWidth = 2, style }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
        </svg>
    );
}

export function SkipForwardIcon({ size = 16, color = 'rgba(255,255,255,0.6)', strokeWidth = 2, style }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
        </svg>
    );
}

export function MaximizeIcon({ size = 16, color = 'rgba(255,255,255,0.5)', strokeWidth = 2, style }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
    );
}

export function PlusIcon({ size = 16, color = 'rgba(255,255,255,0.6)', strokeWidth = 2, style }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}
