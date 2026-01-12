/**
 * SettingsBackButton - Back to Settings Hub button
 */

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface SettingsBackButtonProps {
    onBack: () => void;
    accent?: string;
}

export function SettingsBackButton({ onBack, accent = '#8B5CF6' }: SettingsBackButtonProps) {
    return (
        <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 mb-6 group"
        >
            <ArrowLeft
                size={16}
                className="text-white/50 group-hover:text-white/80 transition-colors"
                style={{ color: accent }}
            />
            <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">
                Back to Settings
            </span>
        </motion.button>
    );
}
