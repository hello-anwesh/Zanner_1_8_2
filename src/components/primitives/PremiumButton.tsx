import { ButtonHTMLAttributes, ReactNode } from 'react';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    accent?: string;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    loading?: boolean;
}

/**
 * Premium button component with multiple variants
 * Matches the quality standard of the app's design system
 */
export function PremiumButton({
    variant = 'primary',
    size = 'md',
    accent = '#8B5CF6',
    icon,
    iconPosition = 'left',
    fullWidth = false,
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}: PremiumButtonProps) {
    const sizeMap = {
        sm: 'px-4 py-2 text-xs rounded-lg gap-2',
        md: 'px-5 py-3 text-sm rounded-xl gap-2.5',
        lg: 'px-6 py-4 text-base rounded-2xl gap-3'
    };

    const variantStyles = {
        primary: {
            background: `linear-gradient(135deg, ${accent} 0%, ${accent}E6 100%)`,
            border: `1px solid ${accent}`,
            color: '#000',
            boxShadow: `0 8px 24px ${accent}60, 0 0 0 1px rgba(255,255,255,0.2) inset`
        },
        secondary: {
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
        },
        ghost: {
            background: 'transparent',
            border: '1px solid transparent',
            color: '#fff',
            boxShadow: 'none'
        },
        danger: {
            background: 'linear-gradient(135deg, #F43F5E 0%, #DC2626 100%)',
            border: '1px solid #F43F5E',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(244, 63, 94, 0.5)'
        }
    };

    const isDisabled = disabled || loading;

    return (
        <button
            className={`
                relative overflow-hidden font-bold tracking-wide
                ${sizeMap[size]}
                ${fullWidth ? 'w-full' : ''}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}
                flex items-center justify-center
                transition-all duration-300 ease-out
                ${className}
            `}
            style={{
                ...(isDisabled
                    ? { ...variantStyles[variant], opacity: 0.5 }
                    : variantStyles[variant]
                ),
                backdropFilter: 'blur(20px)'
            }}
            onMouseEnter={(e) => {
                if (!isDisabled && variant === 'primary') {
                    e.currentTarget.style.boxShadow = `0 12px 32px ${accent}70, 0 0 0 1px rgba(255,255,255,0.3) inset`;
                } else if (!isDisabled && variant === 'danger') {
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(244, 63, 94, 0.6)';
                } else if (!isDisabled && variant !== 'ghost') {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
                }
            }}
            onMouseLeave={(e) => {
                if (!isDisabled) {
                    e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow;
                }
            }}
            disabled={isDisabled}
            {...props}
        >
            {/* Shimmer effect for primary variant */}
            {variant === 'primary' && !isDisabled && (
                <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    style={{
                        animation: 'shimmer 2s linear infinite'
                    }}
                />
            )}

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center gap-2">
                {loading && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {!loading && icon && iconPosition === 'left' && icon}
                {children}
                {!loading && icon && iconPosition === 'right' && icon}
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </button>
    );
}
