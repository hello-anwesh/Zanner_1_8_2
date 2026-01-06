import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Torus } from "@react-three/drei";
import * as THREE from "three";

interface HoloTimerProps {
    progress: number;
    mode: "work" | "shortBreak" | "longBreak";
}

export function HoloTimer({ progress, mode }: HoloTimerProps) {
    const mainColor = mode === "work" ? "#00d4ff" : mode === "shortBreak" ? "#ff6b9d" : "#a78bfa";

    // Refs for subtle animation
    const outerRingRef = useRef<THREE.Mesh>(null);
    const progressRingRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Subtle breathing rotation
        if (outerRingRef.current) {
            outerRingRef.current.rotation.z = t * 0.08;
        }

        // Progress ring subtle pulse
        if (progressRingRef.current) {
            const scale = 1 + Math.sin(t * 2) * 0.02;
            progressRingRef.current.scale.setScalar(scale);
        }

        // Gentle glow pulse
        if (glowRef.current) {
            const intensity = 0.6 + Math.sin(t * 1.5) * 0.2;
            (glowRef.current.material as THREE.MeshBasicMaterial).opacity = intensity;
        }
    });

    // Calculate progress angle
    const progressAngle = progress * Math.PI * 2;

    return (
        <group>
            {/* Soft ambient glow */}
            <mesh ref={glowRef} position={[0, 0, -0.5]}>
                <ringGeometry args={[3, 4.5, 64]} />
                <meshBasicMaterial
                    color={mainColor}
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Outer decorative ring */}
            <Torus ref={outerRingRef} args={[3.5, 0.03, 16, 100]}>
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={0.12}
                />
            </Torus>

            {/* Main ring background */}
            <Torus args={[2.8, 0.12, 16, 100]}>
                <meshStandardMaterial
                    color="#1a1a1a"
                    emissive="#0a0a0a"
                    emissiveIntensity={0.5}
                    metalness={0.8}
                    roughness={0.2}
                />
            </Torus>

            {/* Progress ring */}
            <Torus
                ref={progressRingRef}
                args={[2.8, 0.14, 16, 100, progressAngle]}
            >
                <meshStandardMaterial
                    color={mainColor}
                    emissive={mainColor}
                    emissiveIntensity={2.5}
                    toneMapped={false}
                    transparent
                    opacity={0.95}
                />
            </Torus>

            {/* Progress end cap for smooth finish */}
            {progress > 0 && (
                <mesh
                    position={[
                        Math.cos(progressAngle - Math.PI / 2) * 2.8,
                        Math.sin(progressAngle - Math.PI / 2) * 2.8,
                        0
                    ]}
                >
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial
                        color={mainColor}
                        emissive={mainColor}
                        emissiveIntensity={3}
                        toneMapped={false}
                    />
                </mesh>
            )}

            {/* Subtle accent ring */}
            <Torus args={[2.2, 0.02, 16, 64]}>
                <meshBasicMaterial
                    color={mainColor}
                    transparent
                    opacity={0.25}
                />
            </Torus>

            {/* Soft lighting */}
            <pointLight position={[0, 0, 2]} intensity={1.5} color={mainColor} distance={8} decay={2} />
            <ambientLight intensity={0.2} />
        </group>
    );
}
