import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Calendar, Flame, Clock, Target, Activity, Award } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface AnalyticsDashboardProps {
    accent: string;
    stats: {
        totalSessions: number;
        totalMinutes: number;
        completionRate: number;
        streak: number;
    };
    historical: {
        last7Days: string[];
        sessionsPerDay: number[];
        focusTimePerDay: number[];
        bestTimes: { time: string; sessions: number; color: string }[];
        weeklyTotal: number;
        weeklyAverage: number;
        weeklyChange: number;
    };
}

export function AnalyticsDashboard({ accent, stats, historical }: AnalyticsDashboardProps) {
    const lineChartData = {
        labels: historical.last7Days,
        datasets: [
            {
                label: 'Focus Time (min)',
                data: historical.focusTimePerDay,
                borderColor: accent,
                backgroundColor: `${accent}20`,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: accent,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }
        ]
    };

    const barChartData = {
        labels: historical.last7Days,
        datasets: [
            {
                label: 'Sessions',
                data: historical.sessionsPerDay,
                backgroundColor: `${accent}80`,
                borderColor: accent,
                borderWidth: 2,
                borderRadius: 8,
            }
        ]
    };

    const doughnutData = {
        labels: ['Completed', 'Abandoned'],
        datasets: [
            {
                data: [stats.completionRate, 100 - stats.completionRate],
                backgroundColor: [accent, 'rgba(255,255,255,0.1)'],
                borderWidth: 0,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                titleColor: '#fff',
                bodyColor: '#fff',
                cornerRadius: 8
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: 'rgba(255,255,255,0.5)',
                    font: {
                        size: 11,
                        weight: 600
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(255,255,255,0.05)'
                },
                ticks: {
                    color: 'rgba(255,255,255,0.5)',
                    font: {
                        size: 11,
                        weight: 600
                    }
                }
            }
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${accent}, ${accent}DD)`,
                        boxShadow: `0 4px 16px ${accent}40`
                    }}
                >
                    <BarChart2 size={24} color="#000" strokeWidth={2} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white leading-none mb-1">Analytics Dashboard</h2>
                    <p className="text-sm text-white/50">Track your productivity journey</p>
                </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    icon={Target}
                    label="Total Sessions"
                    value={stats.totalSessions}
                    suffix="sessions"
                    color="#3B82F6"
                    trend="+12%"
                />
                <StatCard
                    icon={Clock}
                    label="Focus Time"
                    value={stats.totalMinutes < 60 ? stats.totalMinutes : (stats.totalMinutes / 60).toFixed(1)}
                    suffix={stats.totalMinutes < 60 ? 'min' : 'hrs'}
                    color="#10B981"
                    trend="+8%"
                />
                <StatCard
                    icon={Activity}
                    label="Completion Rate"
                    value={stats.completionRate}
                    suffix="%"
                    color="#8B5CF6"
                    trend="+5%"
                />
                <StatCard
                    icon={Flame}
                    label="Current Streak"
                    value={stats.streak}
                    suffix="days"
                    color="#F59E0B"
                    trend="🔥"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-6">
                {/* Focus Time Trend */}
                <ChartCard title="Focus Time Trend" subtitle="Last 7 days" icon={TrendingUp} accent={accent}>
                    <div className="h-64">
                        <Line data={lineChartData} options={chartOptions} />
                    </div>
                </ChartCard>

                {/* Sessions Per Day */}
                <ChartCard title="Sessions Per Day" subtitle="Last 7 days" icon={Calendar} accent={accent}>
                    <div className="h-64">
                        <Bar data={barChartData} options={chartOptions} />
                    </div>
                </ChartCard>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-3 gap-6">
                {/* Completion Rate Donut */}
                <ChartCard title="Success Rate" subtitle="This week" icon={Award} accent={accent}>
                    <div className="h-48 flex items-center justify-center">
                        <div className="w-40 h-40 relative">
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    ...chartOptions,
                                    cutout: '70%',
                                    plugins: {
                                        ...chartOptions.plugins,
                                        tooltip: {
                                            ...chartOptions.plugins.tooltip,
                                            callbacks: {
                                                label: (context) => `${context.label}: ${context.parsed}%`
                                            }
                                        }
                                    }
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <p className="text-3xl font-black text-white">{stats.completionRate}%</p>
                                <p className="text-xs text-white/50">Complete</p>
                            </div>
                        </div>
                    </div>
                </ChartCard>

                {/* Best Time */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10"
                >
                    <h3 className="text-sm font-bold text-white/70 mb-4">Best Productivity Time</h3>
                    <div className="space-y-3">
                        {historical.bestTimes.length > 0 ? (
                            historical.bestTimes.map((slot, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-sm text-white/80">{slot.time}</span>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${slot.sessions * 3}px`,
                                                background: slot.color
                                            }}
                                        />
                                        <span className="text-xs font-bold text-white/60">{slot.sessions}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-white/40 text-center py-4">No data yet</p>
                        )}
                    </div>
                </motion.div>

                {/* Weekly Summary */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10"
                >
                    <h3 className="text-sm font-bold text-white/70 mb-4">This Week</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-white/50 mb-1">Total Focus Time</p>
                            <p className="text-2xl font-black text-white">{historical.weeklyTotal} hrs</p>
                        </div>
                        <div>
                            <p className="text-xs text-white/50 mb-1">Average per Day</p>
                            <p className="text-xl font-bold text-white">{historical.weeklyAverage} hrs</p>
                        </div>
                        <div className="pt-3 border-t border-white/10">
                            <p className="text-xs font-medium" style={{ color: accent }}>
                                {historical.weeklyChange > 0 ? '📈' : historical.weeklyChange < 0 ? '📉' : '➡️'} {historical.weeklyChange > 0 ? '+' : ''}{historical.weeklyChange}% vs last week
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, suffix, color, trend }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            className="p-5 rounded-xl bg-white/5 border border-white/10 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icon size={40} />
            </div>
            <div className="relative z-10">
                <p className="text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">{label}</p>
                <div className="flex items-end gap-2 mb-1">
                    <p className="text-3xl font-black text-white leading-none">{value}</p>
                    <p className="text-sm text-white/50 mb-0.5">{suffix}</p>
                </div>
                <div className="flex items-center gap-1">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                    />
                    <p className="text-xs font-bold" style={{ color }}>
                        {trend}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function ChartCard({ title, subtitle, icon: Icon, accent, children }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-6 rounded-xl bg-white/5 border border-white/10"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-white leading-none mb-1">{title}</h3>
                    <p className="text-xs text-white/50">{subtitle}</p>
                </div>
                <Icon size={20} style={{ color: accent }} />
            </div>
            {children}
        </motion.div>
    );
}
