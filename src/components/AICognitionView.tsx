import { Brain, Lightbulb, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface AICognitionViewProps {
    accent: string;
}

export function AICognitionView({ accent }: AICognitionViewProps) {
    const cognitionModes = [
        {
            id: 'analytical',
            name: 'Analytical',
            icon: '🔬',
            description: 'Logical, data-driven approach',
            color: '#3B82F6'
        },
        {
            id: 'creative',
            name: 'Creative',
            icon: '🎨',
            description: 'Innovative, out-of-the-box thinking',
            color: '#EC4899'
        },
        {
            id: 'supportive',
            name: 'Supportive',
            icon: '💝',
            description: 'Empathetic and encouraging',
            color: '#10B981'
        }
    ];

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${accent}, ${accent}DD)`,
                        boxShadow: `0 4px 16px ${accent}40`
                    }}
                >
                    <Brain size={24} color="#000" strokeWidth={2} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white leading-none mb-1">AI Cognition</h2>
                    <p className="text-sm text-white/50">Choose your AI's thinking style</p>
                </div>
            </div>

            {/* Modes */}
            <div className="grid gap-4">
                {cognitionModes.map((mode, index) => (
                    <motion.div
                        key={mode.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                style={{
                                    background: `linear-gradient(135deg, ${mode.color}, ${mode.color}CC)`
                                }}
                            >
                                {mode.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-white mb-1">{mode.name}</h3>
                                <p className="text-sm text-white/60">{mode.description}</p>
                            </div>
                            <div
                                className="w-5 h-5 rounded-full border-2"
                                style={{ borderColor: mode.color }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Features */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Lightbulb size={16} style={{ color: accent }} />
                    Cognitive Features
                </h3>
                <div className="space-y-3">
                    {[
                        { label: 'Context Awareness', enabled: true },
                        { label: 'Pattern Recognition', enabled: true },
                        { label: 'Adaptive Learning', enabled: false }
                    ].map((feature) => (
                        <div key={feature.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-2">
                                <Zap size={14} className={feature.enabled ? 'text-green-400' : 'text-white/30'} />
                                <span className="text-sm font-medium text-white/80">{feature.label}</span>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${feature.enabled ? 'bg-green-400' : 'bg-white/20'}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 leading-relaxed">
                    💡 Select the cognition mode that best matches your work style and preferences.
                </p>
            </div>
        </div>
    );
}
