import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Torus, Sphere } from "@react-three/drei";
import * as THREE from "three";

interface HoloTimerProps {
    progress: number;
    mode: "work" | "shortBreak" | "longBreak";
}

export function HoloTimer({ mode }: HoloTimerProps) {
    const outerRingRef = useRef<THREE.Mesh>(null);
    const midRingRef = useRef<THREE.Mesh>(null);
    const innerRingRef = useRef<THREE.Mesh>(null);
    const particlesRef = useRef<THREE.Group>(null);

    const mainColor = mode === "work" ? "#00f3ff" : mode === "shortBreak" ? "#ff00aa" : "#bd00ff";

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        if (outerRingRef.current) {
            outerRingRef.current.rotation.x = Math.sin(t * 0.2) * 0.5;
            outerRingRef.current.rotation.y = t * 0.3;
        }
        if (midRingRef.current) {
            midRingRef.current.rotation.x = Math.cos(t * 0.5) * 0.5;
            midRingRef.current.rotation.y = -t * 0.5;
        }
        if (innerRingRef.current) {
            innerRingRef.current.rotation.z = t * 0.8;
            // Pulse effect based on progress
            const scale = 1 + Math.sin(t * 2) * 0.02;
            innerRingRef.current.scale.set(scale, scale, scale);
        }
        if (particlesRef.current) {
            particlesRef.current.rotation.y = t * 0.1;
        }
    });

    return (
        <group position={[0, 0, 0]}>
            {/* Outer Glow Ring */}
            <Torus ref={outerRingRef} args={[2, 0.05, 16, 100]} rotation={[1, 0, 0]}>
                <meshStandardMaterial
                    color={mainColor}
                    emissive={mainColor}
                    emissiveIntensity={2}
                    transparent
                    opacity={0.6}
                    wireframe
                />
            </Torus>

            {/* Middle Data Ring */}
            <Torus ref={midRingRef} args={[1.6, 0.02, 16, 64]} rotation={[0, 1, 0]}>
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.3}
                />
            </Torus>

            {/* Progress Ring (Dynamic) */}
            <Torus ref={innerRingRef} args={[1.2, 0.08, 16, 100]} rotation={[0, 0, 0]}>
                <meshStandardMaterial
                    color={mainColor}
                    emissive={mainColor}
                    emissiveIntensity={4}
                    transparent
                    opacity={0.9}
                />
            </Torus>

            {/* Core Orb */}
            <Sphere args={[0.5, 32, 32]}>
                <meshStandardMaterial
                    color="#000000"
                    roughness={0}
                    metalness={1}
                    emissive={mainColor}
                    emissiveIntensity={0.5}
                />
            </Sphere>

            {/* Floating Particles */}
            <group ref={particlesRef}>
                {[...Array(20)].map((_, i) => (
                    <mesh key={i} position={[
                        (Math.random() - 0.5) * 5,
                        (Math.random() - 0.5) * 5,
                        (Math.random() - 0.5) * 2
                    ]}>
                        <sphereGeometry args={[0.02]} />
                        <meshBasicMaterial color={mainColor} transparent opacity={0.6} />
                    </mesh>
                ))}
            </group>

            {/* Lights */}
            <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
            <ambientLight intensity={0.2} />
        </group>
    );
}
