import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ============================================================================
// THEME DEFINITIONS - 5 Completely Distinct Themes
// ============================================================================

export type ThemeName = 'midnight' | 'ocean' | 'rose' | 'amber' | 'emerald';

export interface Theme {
    name: string;
    // Colors
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: {
            main: string;
            card: string;
            sidebar: string;
        };
        text: {
            primary: string;
            secondary: string;
            muted: string;
        };
        border: string;
        glow: string;
    };
    // Typography
    fonts: {
        heading: string;
        body: string;
        mono: string;
    };
    // Sizes
    sizing: {
        borderRadius: {
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
        spacing: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
    };
    // Animations
    animations: {
        duration: {
            fast: string;
            normal: string;
            slow: string;
        };
        easing: string;
        hover: {
            scale: number;
            translateY: number;
        };
    };
    // Effects
    effects: {
        blur: string;
        shadow: {
            sm: string;
            md: string;
            lg: string;
            glow: string;
        };
        glass: {
            background: string;
            border: string;
        };
    };
}

export const THEMES: Record<ThemeName, Theme> = {
    // 🌙 MIDNIGHT - Dark, mysterious, elegant (Violet theme)
    midnight: {
        name: 'Midnight Violet',
        colors: {
            primary: '#8B5CF6',
            secondary: '#A78BFA',
            accent: '#8B5CF6',
            background: {
                main: 'linear-gradient(180deg, #0a0a0f 0%, #16151d 100%)',
                card: 'rgba(139, 92, 246, 0.08)',
                sidebar: 'rgba(10, 10, 15, 0.95)',
            },
            text: {
                primary: '#FFFFFF',
                secondary: 'rgba(255, 255, 255, 0.8)',
                muted: 'rgba(255, 255, 255, 0.5)',
            },
            border: 'rgba(139, 92, 246, 0.2)',
            glow: 'rgba(139, 92, 246, 0.5)',
        },
        fonts: {
            heading: "'Outfit', sans-serif",
            body: "'Inter', sans-serif",
            mono: "'JetBrains Mono', monospace",
        },
        sizing: {
            borderRadius: {
                sm: '0.75rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
            },
            spacing: {
                xs: '0.5rem',
                sm: '0.75rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
            },
        },
        animations: {
            duration: {
                fast: '150ms',
                normal: '300ms',
                slow: '500ms',
            },
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            hover: {
                scale: 1.02,
                translateY: -2,
            },
        },
        effects: {
            blur: '40px',
            shadow: {
                sm: '0 2px 8px rgba(139, 92, 246, 0.1)',
                md: '0 4px 16px rgba(139, 92, 246, 0.2)',
                lg: '0 8px 32px rgba(139, 92, 246, 0.3)',
                glow: '0 0 40px rgba(139, 92, 246, 0.6)',
            },
            glass: {
                background: 'rgba(139, 92, 246, 0.1)',
                border: 'rgba(139, 92, 246, 0.2)',
            },
        },
    },

    // 🌊 OCEAN - Calm, fluid, professional (Cyan theme)
    ocean: {
        name: 'Ocean Breeze',
        colors: {
            primary: '#06B6D4',
            secondary: '#22D3EE',
            accent: '#06B6D4',
            background: {
                main: 'linear-gradient(180deg, #0a1219 0%, #0f1821 100%)',
                card: 'rgba(6, 182, 212, 0.08)',
                sidebar: 'rgba(10, 18, 25, 0.95)',
            },
            text: {
                primary: '#F0FDFF',
                secondary: 'rgba(240, 253, 255, 0.85)',
                muted: 'rgba(240, 253, 255, 0.5)',
            },
            border: 'rgba(6, 182, 212, 0.25)',
            glow: 'rgba(6, 182, 212, 0.5)',
        },
        fonts: {
            heading: "'Poppins', sans-serif",
            body: "'Roboto', sans-serif",
            mono: "'Fira Code', monospace",
        },
        sizing: {
            borderRadius: {
                sm: '0.5rem',
                md: '0.75rem',
                lg: '1.25rem',
                xl: '1.75rem',
            },
            spacing: {
                xs: '0.375rem',
                sm: '0.625rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2.25rem',
            },
        },
        animations: {
            duration: {
                fast: '200ms',
                normal: '350ms',
                slow: '600ms',
            },
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            hover: {
                scale: 1.03,
                translateY: -4,
            },
        },
        effects: {
            blur: '50px',
            shadow: {
                sm: '0 2px 12px rgba(6, 182, 212, 0.15)',
                md: '0 4px 20px rgba(6, 182, 212, 0.25)',
                lg: '0 8px 40px rgba(6, 182, 212, 0.35)',
                glow: '0 0 50px rgba(6, 182, 212, 0.7)',
            },
            glass: {
                background: 'rgba(6, 182, 212, 0.12)',
                border: 'rgba(6, 182, 212, 0.25)',
            },
        },
    },

    // 🌹 ROSE - Warm, passionate, energetic (Rose theme)
    rose: {
        name: 'Velvet Rose',
        colors: {
            primary: '#F43F5E',
            secondary: '#FB7185',
            accent: '#F43F5E',
            background: {
                main: 'linear-gradient(180deg, #1a0a0f 0%, #1f1114 100%)',
                card: 'rgba(244, 63, 94, 0.08)',
                sidebar: 'rgba(26, 10, 15, 0.95)',
            },
            text: {
                primary: '#FFF1F2',
                secondary: 'rgba(255, 241, 242, 0.9)',
                muted: 'rgba(255, 241, 242, 0.55)',
            },
            border: 'rgba(244, 63, 94, 0.25)',
            glow: 'rgba(244, 63, 94, 0.6)',
        },
        fonts: {
            heading: "'Playfair Display', serif",
            body: "'Lato', sans-serif",
            mono: "'Source Code Pro', monospace",
        },
        sizing: {
            borderRadius: {
                sm: '1rem',
                md: '1.25rem',
                lg: '1.75rem',
                xl: '2.5rem',
            },
            spacing: {
                xs: '0.625rem',
                sm: '0.875rem',
                md: '1.25rem',
                lg: '1.75rem',
                xl: '2.5rem',
            },
        },
        animations: {
            duration: {
                fast: '120ms',
                normal: '280ms',
                slow: '450ms',
            },
            easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            hover: {
                scale: 1.05,
                translateY: -3,
            },
        },
        effects: {
            blur: '35px',
            shadow: {
                sm: '0 3px 10px rgba(244, 63, 94, 0.2)',
                md: '0 6px 18px rgba(244, 63, 94, 0.3)',
                lg: '0 10px 35px rgba(244, 63, 94, 0.4)',
                glow: '0 0 45px rgba(244, 63, 94, 0.8)',
            },
            glass: {
                background: 'rgba(244, 63, 94, 0.1)',
                border: 'rgba(244, 63, 94, 0.3)',
            },
        },
    },

    // ⚡ AMBER - Bold, energetic, modern (Amber theme)
    amber: {
        name: 'Golden Amber',
        colors: {
            primary: '#F59E0B',
            secondary: '#FBBF24',
            accent: '#F59E0B',
            background: {
                main: 'linear-gradient(180deg, #1a1108 0%, #1f1a0a 100%)',
                card: 'rgba(245, 158, 11, 0.08)',
                sidebar: 'rgba(26, 17, 8, 0.95)',
            },
            text: {
                primary: '#FFFBEB',
                secondary: 'rgba(255, 251, 235, 0.85)',
                muted: 'rgba(255, 251, 235, 0.5)',
            },
            border: 'rgba(245, 158, 11, 0.25)',
            glow: 'rgba(245, 158, 11, 0.6)',
        },
        fonts: {
            heading: "'Montserrat', sans-serif",
            body: "'Open Sans', sans-serif",
            mono: "'Inconsolata', monospace",
        },
        sizing: {
            borderRadius: {
                sm: '0.375rem',
                md: '0.625rem',
                lg: '1rem',
                xl: '1.5rem',
            },
            spacing: {
                xs: '0.5rem',
                sm: '0.75rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
            },
        },
        animations: {
            duration: {
                fast: '100ms',
                normal: '250ms',
                slow: '400ms',
            },
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            hover: {
                scale: 1.04,
                translateY: -2,
            },
        },
        effects: {
            blur: '30px',
            shadow: {
                sm: '0 2px 10px rgba(245, 158, 11, 0.2)',
                md: '0 4px 18px rgba(245, 158, 11, 0.3)',
                lg: '0 8px 35px rgba(245, 158, 11, 0.4)',
                glow: '0 0 50px rgba(245, 158, 11, 0.7)',
            },
            glass: {
                background: 'rgba(245, 158, 11, 0.1)',
                border: 'rgba(245, 158, 11, 0.25)',
            },
        },
    },

    // 🌿 EMERALD - Fresh, natural, balanced (Emerald theme)
    emerald: {
        name: 'Forest Emerald',
        colors: {
            primary: '#10B981',
            secondary: '#34D399',
            accent: '#10B981',
            background: {
                main: 'linear-gradient(180deg, #0a1910 0%, #0f1f15 100%)',
                card: 'rgba(16, 185, 129, 0.08)',
                sidebar: 'rgba(10, 25, 16, 0.95)',
            },
            text: {
                primary: '#F0FDF4',
                secondary: 'rgba(240, 253, 244, 0.85)',
                muted: 'rgba(240, 253, 244, 0.5)',
            },
            border: 'rgba(16, 185, 129, 0.25)',
            glow: 'rgba(16, 185, 129, 0.5)',
        },
        fonts: {
            heading: "'Raleway', sans-serif",
            body: "'Nunito', sans-serif",
            mono: "'Ubuntu Mono', monospace",
        },
        sizing: {
            borderRadius: {
                sm: '0.625rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
            },
            spacing: {
                xs: '0.5rem',
                sm: '0.75rem',
                md: '1.125rem',
                lg: '1.625rem',
                xl: '2.25rem',
            },
        },
        animations: {
            duration: {
                fast: '180ms',
                normal: '320ms',
                slow: '550ms',
            },
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            hover: {
                scale: 1.02,
                translateY: -3,
            },
        },
        effects: {
            blur: '45px',
            shadow: {
                sm: '0 2px 10px rgba(16, 185, 129, 0.15)',
                md: '0 4px 20px rgba(16, 185, 129, 0.25)',
                lg: '0 8px 38px rgba(16, 185, 129, 0.35)',
                glow: '0 0 48px rgba(16, 185, 129, 0.65)',
            },
            glass: {
                background: 'rgba(16, 185, 129, 0.1)',
                border: 'rgba(16, 185, 129, 0.25)',
            },
        },
    },
};

// ============================================================================
// THEME CONTEXT
// ============================================================================

interface ThemeContextType {
    currentTheme: Theme;
    themeName: ThemeName;
    setTheme: (name: ThemeName) => void;
    themes: typeof THEMES;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeName, setThemeName] = useState<ThemeName>(() => {
        const stored = localStorage.getItem('theme');
        return (stored as ThemeName) || 'midnight';
    });

    useEffect(() => {
        localStorage.setItem('theme', themeName);
    }, [themeName]);

    const currentTheme = THEMES[themeName];

    const value: ThemeContextType = {
        currentTheme,
        themeName,
        setTheme: setThemeName,
        themes: THEMES,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
