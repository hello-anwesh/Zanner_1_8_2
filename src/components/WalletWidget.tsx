/**
 * Wallet Widget Component
 * Shows user's token wallet balance and usage
 * For desktop app integration
 */

import React, { useState, useEffect } from 'react';
import { Wallet, TrendingDown, Zap, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface WalletData {
    balance: number;
    formatted_balance: string;
    usage_today: number;
    usage_this_month: number;
    daily_limit: number;
    monthly_limit: number;
    daily_remaining: number;
    monthly_remaining: number;
}

interface WalletWidgetProps {
    apiUrl?: string;
    apiKey?: string;
    compact?: boolean;
    accent?: string;
    onLowBalance?: (balance: number) => void;
}

export const WalletWidget: React.FC<WalletWidgetProps> = ({
    apiUrl = '',
    apiKey = '',
    compact = false,
    accent = '#10b981',
    onLowBalance,
}) => {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWallet = async () => {
        if (!apiUrl || !apiKey) {
            setError('API not configured');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${apiUrl}/api/v1/wallet`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch wallet');
            }

            const data = await res.json();
            setWallet(data.wallet);

            // Check for low balance
            if (data.wallet.balance < 1.0 && onLowBalance) {
                onLowBalance(data.wallet.balance);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
        // Refresh every 5 minutes
        const interval = setInterval(fetchWallet, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [apiUrl, apiKey]);

    const formatCurrency = (amount: number) => {
        if (amount >= 1) return `$${amount.toFixed(2)}`;
        return `$${amount.toFixed(4)}`;
    };

    const getBalanceColor = (balance: number) => {
        if (balance < 0.5) return '#ef4444';
        if (balance < 2) return '#f59e0b';
        return accent;
    };

    const getDailyProgress = () => {
        if (!wallet) return 0;
        return Math.min((wallet.usage_today / wallet.daily_limit) * 100, 100);
    };

    if (compact) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                fontSize: '13px',
            }}>
                <Wallet size={14} style={{ color: accent, opacity: 0.8 }} />
                {loading ? (
                    <Loader2 size={14} className="animate-spin" style={{ opacity: 0.5 }} />
                ) : error ? (
                    <span style={{ color: '#ef4444', fontSize: '11px' }}>Error</span>
                ) : wallet ? (
                    <span style={{ fontWeight: 600, color: getBalanceColor(wallet.balance) }}>
                        {formatCurrency(wallet.balance)}
                    </span>
                ) : null}
            </div>
        );
    }

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${accent}15, transparent)`,
                pointerEvents: 'none',
            }} />

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: `${accent}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Wallet size={18} style={{ color: accent }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>Token Wallet</span>
                </div>
                <button
                    onClick={fetchWallet}
                    disabled={loading}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px',
                        opacity: 0.5,
                    }}
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Loading State */}
            {loading && !wallet && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Loader2 size={24} className="animate-spin" style={{ opacity: 0.5 }} />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'rgba(239,68,68,0.1)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#ef4444',
                }}>
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* Wallet Content */}
            {wallet && (
                <>
                    {/* Balance */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px' }}>
                            Available Balance
                        </div>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 700,
                            color: getBalanceColor(wallet.balance),
                            letterSpacing: '-0.02em',
                        }}>
                            {formatCurrency(wallet.balance)}
                        </div>
                        {wallet.balance < 1 && (
                            <div style={{
                                fontSize: '11px',
                                color: '#f59e0b',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}>
                                <AlertCircle size={12} />
                                Low balance - consider adding credits
                            </div>
                        )}
                    </div>

                    {/* Usage Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '16px',
                    }}>
                        <div style={{
                            padding: '12px',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '10px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <Zap size={12} style={{ color: accent }} />
                                <span style={{ fontSize: '11px', opacity: 0.6 }}>Today</span>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 600 }}>
                                {formatCurrency(wallet.usage_today)}
                            </div>
                        </div>
                        <div style={{
                            padding: '12px',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '10px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <TrendingDown size={12} style={{ color: '#a855f7' }} />
                                <span style={{ fontSize: '11px', opacity: 0.6 }}>This Month</span>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 600 }}>
                                {formatCurrency(wallet.usage_this_month)}
                            </div>
                        </div>
                    </div>

                    {/* Daily Limit Progress */}
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '11px',
                            opacity: 0.6,
                            marginBottom: '6px',
                        }}>
                            <span>Daily Limit</span>
                            <span>{formatCurrency(wallet.daily_remaining)} remaining</span>
                        </div>
                        <div style={{
                            height: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                width: `${getDailyProgress()}%`,
                                height: '100%',
                                background: getDailyProgress() > 80 ? '#ef4444' : accent,
                                borderRadius: '3px',
                                transition: 'width 0.3s ease',
                            }} />
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default WalletWidget;
