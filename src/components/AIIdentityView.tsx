import { User, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface AIIdentityViewProps {
    accent: string;
}

export function AIIdentityView({ accent }: AIIdentityViewProps) {
    const [name, setName] = useState('Zeni');
    const [role, setRole] = useState('Productivity Expert');

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
                    <User size={24} color="#000" strokeWidth={2} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white leading-none mb-1">AI Identity</h2>
                    <p className="text-sm text-white/50">Configure your AI coach's personality</p>
                </div>
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-5"
            >
                <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">Coach Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-all"
                        placeholder="Enter coach name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">Role/Expertise</label>
                    <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-all"
                        placeholder="e.g., Productivity Expert, Focus Coach"
                    />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-white/10">
                    <p className="text-xs text-white/40">Changes save automatically</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2"
                        style={{
                            background: `linear-gradient(135deg, ${accent}, ${accent}DD)`,
                            color: '#000'
                        }}
                    >
                        <Save size={16} />
                        Save Changes
                    </motion.button>
                </div>
            </motion.div>

            {/* Info */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 leading-relaxed">
                    💡 Customize your AI coach's identity to match your preferences and working style.
                </p>
            </div>
        </div>
    );
}
