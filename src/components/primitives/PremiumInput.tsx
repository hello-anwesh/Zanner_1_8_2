import { InputHTMLAttributes, forwardRef } from 'react';

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    accent?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

/**
 * Premium input component with glassmorphic styling
 * Designed to match the app's premium aesthetic
 */
export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
    ({ label, accent = '#8B5CF6', error, helperText, icon, className = '', ...props }, ref) => {
        return (
            <div className={`flex flex-col gap-2 ${className}`}>
                {label && (
                    <label className="text-sm font-semibold text-white/80 tracking-wide">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                            {icon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-medium text-white placeholder-white/30 transition-all duration-300 focus:scale-[1.01] ${icon ? 'pl-12' : ''
                            }`}
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: error
                                ? '1px solid rgba(244, 63, 94, 0.5)'
                                : '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                            outline: 'none'
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.boxShadow = error
                                ? '0 0 0 2px rgba(244, 63, 94, 0.4), 0 8px 24px rgba(0,0,0,0.4)'
                                : `0 0 0 2px ${accent}40, 0 8px 24px rgba(0,0,0,0.4)`;
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
                        }}
                        {...props}
                    />
                </div>

                {(error || helperText) && (
                    <p className={`text-xs font-medium ${error ? 'text-red-400' : 'text-white/50'
                        }`}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

PremiumInput.displayName = 'PremiumInput';
