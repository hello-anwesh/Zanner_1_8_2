import { motion } from 'framer-motion';
import { Book, Target, Headphones, Users, Heart, Zap, ExternalLink } from 'lucide-react';

interface PhilosophyViewProps {
    accent: string;
}

export function PhilosophyView({ accent }: PhilosophyViewProps) {
    return (
        <div className="p-12 max-w-6xl mx-auto space-y-12" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Header */}
            <div className="text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block mb-8"
                >
                    <div
                        className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center mb-6"
                        style={{
                            background: `linear-gradient(135deg, ${accent}20 0%, ${accent}10 100%)`,
                            border: `2px solid ${accent}40`
                        }}
                    >
                        <Book size={48} style={{ color: accent }} strokeWidth={2} />
                    </div>
                    <h1 className="text-6xl font-black text-white mb-4 tracking-tight">Zenner V2.0.1</h1>
                    <p className="text-xl font-medium text-white/60 mb-6">Focus. Flow. Freedom.</p>
                    <div className="flex items-center justify-center gap-3 text-base text-white/50">
                        <span>Created by</span>
                        <a
                            href="https://anwe.sh"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold hover:text-white transition-colors flex items-center gap-2"
                            style={{ color: accent }}
                        >
                            Anwesh Rath
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Philosophy Sections */}
            <div className="space-y-16">
                {/* English Philosophy */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                        <span className="text-4xl">🧘</span>
                        The Philosophy
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Solo Deep Work */}
                        <PhilosophyCard
                            icon={Target}
                            title="Solo Deep Work"
                            accent={accent}
                        >
                            <p className="text-white/70 leading-relaxed mb-4">
                                True focus happens alone. No distractions, no interruptions - just you and your work.
                                Zenner creates a sacred space for deep, uninterrupted flow states.
                            </p>
                            <p className="text-white/70 leading-relaxed">
                                When you're alone with your thoughts and your purpose, magic happens. This is where
                                breakthroughs occur, problems get solved, and great work emerges.
                            </p>
                        </PhilosophyCard>

                        {/* Sonic Frequencies */}
                        <PhilosophyCard
                            icon={Headphones}
                            title="Sonic Frequencies"
                            accent={accent}
                        >
                            <p className="text-white/70 leading-relaxed mb-4">
                                Sound shapes consciousness. Binaural beats, isochronic tones, and Schumann resonance
                                (7.83Hz) can induce specific mental states - focus, relaxation, creativity.
                            </p>
                            <p className="text-white/70 leading-relaxed">
                                Zenner harnesses the power of frequency to optimize your brain state. Whether you need
                                deep focus (40Hz gamma), relaxation (10Hz alpha), or healing (528Hz), the right
                                frequency amplifies your intention.
                            </p>
                        </PhilosophyCard>

                        {/* AI Accountability */}
                        <PhilosophyCard
                            icon={Users}
                            title="AI Accountability Partner"
                            accent={accent}
                        >
                            <p className="text-white/70 leading-relaxed mb-4">
                                You need someone who knows your goals, tracks your progress, and holds you accountable.
                                But not just anyone - someone intelligent, available 24/7, and solely devoted to your success.
                            </p>
                            <p className="text-white/70 leading-relaxed">
                                Zeni is that partner. She knows your patterns, understands your struggles, celebrates your
                                wins, and gently pushes you when you need it. An AI that truly cares about your growth.
                            </p>
                        </PhilosophyCard>

                        {/* Systems Over Willpower */}
                        <PhilosophyCard
                            icon={Zap}
                            title="Systems Over Willpower"
                            accent={accent}
                        >
                            <p className="text-white/70 leading-relaxed mb-4">
                                Motivation fades. Willpower depletes. But systems compound. Zenner isn't about forcing yourself
                                to work - it's about creating an environment where deep work becomes effortless.
                            </p>
                            <p className="text-white/70 leading-relaxed">
                                Track sessions, build streaks, analyze patterns, optimize timing. When the system is right,
                                productivity isn't a battle - it's a natural flow.
                            </p>
                        </PhilosophyCard>
                    </div>
                </motion.div>

                {/* Hindi Philosophy */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-10 rounded-3xl"
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.08)'
                    }}
                >
                    <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                        <span className="text-4xl">🇮🇳</span>
                        दर्शन (Philosophy in Hindi)
                    </h2>

                    <div className="space-y-8 text-white/70 leading-relaxed text-lg">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4" style={{ color: accent }}>
                                एकांत में गहन कार्य
                            </h3>
                            <p className="mb-3">
                                सच्चा फोकस तब आता है जब आप अकेले होते हैं। बिना किसी विकर्षण के, बिना रुकावट के -
                                सिर्फ आप और आपका काम। जब आप अपने विचारों और उद्देश्य के साथ अकेले होते हैं,
                                तभी असली जादू होता है।
                            </p>
                            <p>
                                यही वह समय है जब breakthrough होते हैं, समस्याएं हल होती हैं, और महान काम उभरता है।
                            </p>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4" style={{ color: accent }}>
                                ध्वनि आवृत्तियाँ (Sonic Frequencies)
                            </h3>
                            <p className="mb-3">
                                ध्वनि चेतना को आकार देती है। Binaural beats, Schumann resonance (7.83Hz), और
                                isochronic tones विशेष मानसिक अवस्थाओं को प्रेरित कर सकते हैं।
                            </p>
                            <p>
                                चाहे आपको गहन फोकस चाहिए (40Hz gamma), विश्राम (10Hz alpha), या रचनात्मकता -
                                सही आवृत्ति आपके इरादे को बढ़ा देती है।
                            </p>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4" style={{ color: accent }}>
                                AI जवाबदेही साथी
                            </h3>
                            <p className="mb-3">
                                आपको किसी ऐसे की ज़रूरत है जो आपके लक्ष्यों को जानता हो, आपकी प्रगति को track करे,
                                और आपको जवाबदेह बनाए। पर सिर्फ कोई नहीं - कोई बुद्धिमान, 24/7 उपलब्ध, और केवल
                                आपकी सफलता के लिए समर्पित।
                            </p>
                            <p>
                                Zeni वह साथी है। वह आपके patterns जानती है, आपके संघर्षों को समझती है,
                                आपकी जीत का जश्न मनाती है, और जब ज़रूरत हो तो धीरे से आपको आगे बढ़ाती है।
                            </p>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4" style={{ color: accent }}>
                                इच्छाशक्ति से ज़्यादा, सिस्टम
                            </h3>
                            <p className="mb-3">
                                प्रेरणा फीकी पड़ जाती है। इच्छाशक्ति समाप्त हो जाती है। लेकिन systems compound होते हैं।
                                Zenner आपको खुद को काम करने के लिए मजबूर करने के बारे में नहीं है।
                            </p>
                            <p>
                                यह एक ऐसा environment बनाने के बारे में है जहाँ गहन कार्य सहज हो जाए।
                                Sessions track करें, streaks बनाएं, patterns का विश्लेषण करें, timing optimize करें।
                                जब system सही होता है, तो productivity एक battle नहीं - एक natural flow है।
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Core Principles */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                        <Heart size={32} style={{ color: accent }} />
                        Core Principles
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PrincipleCard accent={accent} number="1">
                            <p className="font-bold text-white mb-2">Quality Over Quantity</p>
                            <p className="text-sm text-white/60">One hour of deep focus beats 8 hours of distracted work</p>
                        </PrincipleCard>

                        <PrincipleCard accent={accent} number="2">
                            <p className="font-bold text-white mb-2">Track, Analyze, Optimize</p>
                            <p className="text-sm text-white/60">What gets measured gets improved</p>
                        </PrincipleCard>

                        <PrincipleCard accent={accent} number="3">
                            <p className="font-bold text-white mb-2">Rest is Productive</p>
                            <p className="text-sm text-white/60">Recovery is part of the system, not a break from it</p>
                        </PrincipleCard>

                        <PrincipleCard accent={accent} number="4">
                            <p className="font-bold text-white mb-2">Context Switching Kills</p>
                            <p className="text-sm text-white/60">Single-task deep work {'>'}Multi-task shallow work</p>
                        </PrincipleCard>

                        <PrincipleCard accent={accent} number="5">
                            <p className="font-bold text-white mb-2">Environment Matters</p>
                            <p className="text-sm text-white/60">Sound, visuals, and ambiance shape your focus</p>
                        </PrincipleCard>

                        <PrincipleCard accent={accent} number="6">
                            <p className="font-bold text-white mb-2">AI as Partner, Not Tool</p>
                            <p className="text-sm text-white/60">Zeni knows you, guides you, grows with you</p>
                        </PrincipleCard>
                    </div>
                </motion.div>

                {/* Version Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center pt-8 border-t border-white/10"
                >
                    <p className="text-sm text-white/40 mb-2">
                        Zenner V2.0.1 • Built with React, Tauri, TypeScript
                    </p>
                    <p className="text-sm text-white/40">
                        © 2026 <a href="https://anwe.sh" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: accent }}>Anwesh Rath</a> • All rights reserved
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

function PhilosophyCard({ icon: Icon, title, children, accent }: any) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="p-8 rounded-2xl"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)'
            }}
        >
            <div className="flex items-center gap-4 mb-6">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                        background: `${accent}15`,
                        border: `1px solid ${accent}30`
                    }}
                >
                    <Icon size={24} style={{ color: accent }} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <div className="text-base">
                {children}
            </div>
        </motion.div>
    );
}

function PrincipleCard({ number, children, accent }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            className="p-6 rounded-xl relative overflow-hidden"
            style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)'
            }}
        >
            <div
                className="absolute top-0 right-0 text-8xl font-black opacity-5"
                style={{ color: accent }}
            >
                {number}
            </div>
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
