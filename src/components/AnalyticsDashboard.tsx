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
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-10" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center gap-6 mb-8 pl-2">
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${accent}, ${accent}DD)`,
                        boxShadow: `0 8px 32px ${accent}40`
                    }}
                >
                    <BarChart2 size={32} color="#000" strokeWidth={2} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-white leading-tight mb-2">Analytics Dashboard</h2>
                    <p className="text-base text-white/50 font-medium">Track your productivity journey and focus patterns</p>
                </div>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Focus Time Trend */}
                <ChartCard title="Focus Time Trend" subtitle="Last 7 days" icon={TrendingUp} accent={accent}>
                    <div className="h-72">
                        <Line data={lineChartData} options={chartOptions} />
                    </div>
                </ChartCard>

                {/* Sessions Per Day */}
                <ChartCard title="Sessions Per Day" subtitle="Last 7 days" icon={Calendar} accent={accent}>
                    <div className="h-72">
                        <Bar data={barChartData} options={chartOptions} />
                    </div>
                </ChartCard>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Completion Rate Donut */}
                <ChartCard title="Success Rate" subtitle="This week" icon={Award} accent={accent}>
                    <div className="h-56 flex items-center justify-center py-4">
                        <div className="w-48 h-48 relative">
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    ...chartOptions,
                                    cutout: '75%',
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
                                <p className="text-4xl font-black text-white">{stats.completionRate}%</p>
                                <p className="text-sm font-bold text-white/50 uppercase tracking-widest mt-1">Complete</p>
                            </div>
                        </div>
                    </div>
                </ChartCard>

                {/* Best Time */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between h-full"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-white/5"><Clock size={16} /></span>
                        Best Productivity Time
                    </h3>
                    <div className="space-y-5 flex-1">
                        {historical.bestTimes.length > 0 ? (
                            historical.bestTimes.map((slot, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <span className="text-base text-white/90 font-medium font-mono">{slot.time}</span>
                                    <div className="flex items-center gap-3 flex-1 justify-end">
                                        <div className="h-2 rounded-full bg-white/5 w-24 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500 group-hover:opacity-100 opacity-80"
                                                style={{
                                                    width: `${Math.min(slot.sessions * 10, 100)}%`,
                                                    background: slot.color
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-white/60 min-w-[2rem] text-right">{slot.sessions}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex items-center justify-center flex-col text-white/30 space-y-2">
                                <Activity size={32} />
                                <p className="text-sm font-medium">No data yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Weekly Summary */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between h-full"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-white/5"><Calendar size={16} /></span>
                        This Week
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-medium text-white/50 mb-2 uppercase tracking-wider">Total Focus Time</p>
                            <p className="text-4xl font-black text-white tracking-tight">{historical.weeklyTotal} <span className="text-lg text-white/40 font-normal">hrs</span></p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white/50 mb-2 uppercase tracking-wider">Average per Day</p>
                            <p className="text-3xl font-bold text-white tracking-tight">{historical.weeklyAverage} <span className="text-lg text-white/40 font-normal">hrs</span></p>
                        </div>
                        <div className="pt-6 border-t border-white/10 mt-auto">
                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                <span className="text-xl">{historical.weeklyChange > 0 ? '📈' : historical.weeklyChange < 0 ? '📉' : '➡️'}</span>
                                <p className="text-sm font-bold" style={{ color: accent }}>
                                    {historical.weeklyChange > 0 ? '+' : ''}{historical.weeklyChange}% <span className="text-white/40 font-medium">vs last week</span>
                                </p>
                            </div>
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
