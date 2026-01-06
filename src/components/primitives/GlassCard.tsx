import { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverable?: boolean;
    accent?: string;
    onClick?: () => void;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    style?: CSSProperties;
}

/**
 * Premium glassmorphic card component
 * Matches the quality standard of PremiumSidebar
 */
export function GlassCard({
    children,
    className = '',
    hoverable = false,
    accent,
    onClick,
    padding = 'lg',
    style = {}
}: GlassCardProps) {
    const paddingMap = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
        xl: 'p-8'
    };

    const baseStyles: CSSProperties = {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(40px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        ...style
    };

    const hoverStyles = hoverable ? {
        whileHover: {
            scale: 1.01,
            boxShadow: accent
                ? `0 12px 48px ${accent}30, 0 8px 32px rgba(0,0,0,0.4)`
                : '0 12px 48px rgba(0,0,0,0.5)'
        },
        whileTap: { scale: 0.99 }
    } : {};

    return (
        <motion.div
            className={`rounded-2xl overflow-hidden ${paddingMap[padding]} ${className}`}
            style={baseStyles}
            onClick={onClick}
            {...hoverStyles}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
            {/* Subtle ambient glow when accent is provided */}
            {accent && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-[120px]"
                        style={{ background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)` }}
                    />
                </div>
            )}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
