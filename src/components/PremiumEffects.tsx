import { useEffect, useRef, useState, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    life: number;
    maxLife: number;
}

interface ParticleSystemProps {
    accentColor?: string;
    particleCount?: number;
    mouseInfluence?: number;
}

export function ParticleSystem({
    accentColor = '#22D3EE',
    particleCount = 80,
    mouseInfluence = 150
}: ParticleSystemProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0, active: false });
    const animationRef = useRef<number | undefined>(undefined);

    const createParticle = useCallback((x?: number, y?: number, burst = false): Particle => {
        const canvas = canvasRef.current;
        if (!canvas) return {} as Particle;

        const colors = [accentColor, '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
        return {
            x: x ?? Math.random() * canvas.width,
            y: y ?? Math.random() * canvas.height,
            vx: burst ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 0.5,
            vy: burst ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 0.5,
            size: burst ? Math.random() * 4 + 2 : Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: burst ? 1 : Math.random() * 0.5 + 0.2,
            life: burst ? 60 : Infinity,
            maxLife: burst ? 60 : Infinity,
        };
    }, [accentColor]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Initialize particles
        particlesRef.current = Array.from({ length: particleCount }, () => createParticle());

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            const mouse = mouseRef.current;

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                // Mouse influence
                if (mouse.active) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouseInfluence) {
                        const force = (mouseInfluence - dist) / mouseInfluence;
                        const angle = Math.atan2(dy, dx);
                        p.vx += Math.cos(angle) * force * 0.3;
                        p.vy += Math.sin(angle) * force * 0.3;
                    }
                }

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Friction
                p.vx *= 0.98;
                p.vy *= 0.98;

                // Life decay for burst particles
                if (p.life !== Infinity) {
                    p.life--;
                    p.alpha = (p.life / p.maxLife) * 0.8;
                    if (p.life <= 0) {
                        particles.splice(i, 1);
                        continue;
                    }
                }

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw particle with glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
                ctx.shadowBlur = 15;
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(255,255,255,${0.1 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        // Mouse handlers
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        const handleClick = (e: MouseEvent) => {
            // Burst effect on click
            for (let i = 0; i < 15; i++) {
                particlesRef.current.push(createParticle(e.clientX, e.clientY, true));
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('click', handleClick);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [createParticle, mouseInfluence, particleCount]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    );
}

// Parallax background with mouse movement
export function ParallaxBackground() {
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 40;
            const y = (e.clientY / window.innerHeight - 0.5) * 40;
            setOffset({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Layer 1 - Deepest, slowest */}
            <div
                className="absolute inset-0 transition-transform duration-700 ease-out"
                style={{
                    transform: `translate(${offset.x * 0.3}px, ${offset.y * 0.3}px)`,
                    background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 53, 195, 0.3), transparent)',
                }}
            />

            {/* Layer 2 - Mid depth */}
            <div
                className="absolute inset-0 transition-transform duration-500 ease-out"
                style={{
                    transform: `translate(${offset.x * 0.5}px, ${offset.y * 0.5}px)`,
                    background: 'radial-gradient(ellipse 60% 40% at 80% 20%, rgba(34, 211, 238, 0.2), transparent)',
                }}
            />

            {/* Layer 3 - Closest, fastest response */}
            <div
                className="absolute inset-0 transition-transform duration-300 ease-out"
                style={{
                    transform: `translate(${offset.x * 0.8}px, ${offset.y * 0.8}px)`,
                    background: 'radial-gradient(ellipse 40% 30% at 20% 80%, rgba(236, 72, 153, 0.15), transparent)',
                }}
            />

            {/* Animated mesh gradient */}
            <div className="absolute inset-0 animate-gradient-shift" style={{
                background: `
          radial-gradient(at 40% 20%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(34, 211, 238, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(236, 72, 153, 0.1) 0px, transparent 50%),
          radial-gradient(at 80% 50%, rgba(16, 185, 129, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(245, 158, 11, 0.1) 0px, transparent 50%)
        `,
                animation: 'gradient-shift 15s ease infinite',
            }} />

            {/* Floating orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full animate-float-slow" style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
                filter: 'blur(40px)',
                transform: `translate(${offset.x * 1.2}px, ${offset.y * 1.2}px)`,
            }} />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full animate-float-delayed" style={{
                background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)',
                filter: 'blur(30px)',
                transform: `translate(${offset.x * -0.8}px, ${offset.y * -0.8}px)`,
            }} />
        </div>
    );
}

// Micro-interaction button with spring physics
interface SpringButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
    variant?: 'primary' | 'secondary' | 'ghost';
}

export function SpringButton({ children, onClick, className = '', style, variant = 'primary' }: SpringButtonProps) {
    const [pressed, setPressed] = useState(false);
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setRipples(prev => [...prev, { x, y, id: Date.now() }]);
        setTimeout(() => setRipples(prev => prev.slice(1)), 600);

        onClick?.();
    };

    const baseStyles = variant === 'primary'
        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
        : variant === 'secondary'
            ? 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
            : 'bg-transparent text-white/70 hover:text-white hover:bg-white/5';

    return (
        <button
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onClick={handleClick}
            className={`relative overflow-hidden transition-all duration-200 ${baseStyles} ${className}`}
            style={{
                ...style,
                transform: pressed ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
        >
            {children}
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full bg-white/30 animate-ripple"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            ))}
        </button>
    );
}

// Magnetic hover effect
interface MagneticProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
}

export function Magnetic({ children, className = '', strength = 0.3 }: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * strength;
        const y = (e.clientY - rect.top - rect.height / 2) * strength;
        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div
            ref={ref}
            className={`transition-transform duration-200 ease-out ${className}`}
            style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
}

// Glow card with tilt effect
interface GlowCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
}

export function GlowCard({ children, className = '', glowColor = 'rgba(34, 211, 238, 0.3)' }: GlowCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
            background: `radial-gradient(circle at ${x}px ${y}px, ${glowColor}, transparent 50%)`,
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: 'perspective(1000px) rotateX(0) rotateY(0) scale(1)',
            background: 'transparent',
        });
    };

    return (
        <div
            ref={ref}
            className={`relative transition-all duration-300 ease-out ${className}`}
            style={style}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10" />
            <div className="relative z-10">{children}</div>
        </div>
    );
}

// Text reveal animation
export function TextReveal({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setRevealed(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <span className={`inline-block overflow-hidden ${className}`}>
            {text.split('').map((char, i) => (
                <span
                    key={i}
                    className="inline-block transition-all duration-500"
                    style={{
                        transform: revealed ? 'translateY(0)' : 'translateY(100%)',
                        opacity: revealed ? 1 : 0,
                        transitionDelay: `${i * 30}ms`,
                    }}
                >
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </span>
    );
}
export function ThreeDTiltContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const [transform, setTransform] = useState('');

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
            const y = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

            // Subtle 3D rotation
            const rotateX = -y * 2; // Max 2deg rotation
            const rotateY = x * 2;

            setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            className={`transition-transform duration-100 ease-out will-change-transform ${className}`}
            style={{ transform }}
        >
            {children}
        </div>
    );
}
