import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Catches JavaScript errors and displays a recovery UI
 * Prevents the entire app from crashing with a white screen
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error);
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

        this.setState({ errorInfo });

        // Could send to analytics/error tracking service here
        // e.g., Sentry, LogRocket, etc.
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    private handleClearData = () => {
        if (confirm('This will clear your local settings and reload. Your session data in the database will be preserved. Continue?')) {
            // Clear only localStorage (database is safe)
            localStorage.clear();
            window.location.reload();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: '100vh',
                        background: 'linear-gradient(180deg, #0a0a0f 0%, #16151d 100%)',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
                        fontFamily: 'Inter, system-ui, sans-serif'
                    }}
                >
                    {/* Error Icon */}
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 20,
                            background: 'rgba(244, 63, 94, 0.15)',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 24
                        }}
                    >
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>

                    <h1 style={{
                        fontSize: 24,
                        fontWeight: 600,
                        marginBottom: 8,
                        color: '#fff'
                    }}>
                        Something went wrong
                    </h1>

                    <p style={{
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: 24,
                        textAlign: 'center',
                        maxWidth: 400
                    }}>
                        Zenner encountered an unexpected error. Don't worry - your data is safe.
                    </p>

                    {/* Error Details (collapsible) */}
                    <details
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 24,
                            maxWidth: 500,
                            width: '100%'
                        }}
                    >
                        <summary style={{
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.5)',
                            fontSize: 14
                        }}>
                            Technical Details
                        </summary>
                        <pre style={{
                            marginTop: 12,
                            padding: 12,
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: 8,
                            fontSize: 11,
                            overflow: 'auto',
                            maxHeight: 200,
                            color: '#F43F5E'
                        }}>
                            {this.state.error?.toString()}
                            {'\n\n'}
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </details>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={this.handleReload}
                            style={{
                                padding: '12px 24px',
                                borderRadius: 12,
                                border: 'none',
                                background: '#8B5CF6',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: 14
                            }}
                        >
                            Reload App
                        </button>

                        <button
                            onClick={this.handleReset}
                            style={{
                                padding: '12px 24px',
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'transparent',
                                color: '#fff',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontSize: 14
                            }}
                        >
                            Try Again
                        </button>

                        <button
                            onClick={this.handleClearData}
                            style={{
                                padding: '12px 24px',
                                borderRadius: 12,
                                border: '1px solid rgba(244, 63, 94, 0.3)',
                                background: 'transparent',
                                color: 'rgba(255,255,255,0.5)',
                                fontWeight: 500,
                                cursor: 'pointer',
                                fontSize: 14
                            }}
                        >
                            Clear Settings
                        </button>
                    </div>

                    <p style={{
                        marginTop: 32,
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: 12
                    }}>
                        If this keeps happening, try Settings → Backup → Restore from a backup
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
