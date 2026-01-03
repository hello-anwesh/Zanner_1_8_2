import { Canvas } from "@react-three/fiber";
import { Environment, Stars } from "@react-three/drei";
import { HoloTimer } from "./HoloTimer";
import { TimerMode } from "../../hooks/useTimer";

interface SceneProps {
    progress: number;
    mode: TimerMode;
    children: React.ReactNode;
}

export function Scene({ progress, mode, children }: SceneProps) {
    return (
        <div className="relative w-full h-screen bg-black overflow-hidden font-['Orbitron']">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a1a] to-[#050510] z-0" />

            {/* Scanlines Effect */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-10"
                style={{ backgroundImage: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 2px, 3px 100%" }}
            />

            {/* 3D Canvas */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <HoloTimer progress={progress} mode={mode} />
                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* HUD Overlay Layer */}
            <div className="relative z-20 w-full h-full flex flex-col justify-between p-8 pointer-events-none">
                {children}
            </div>
        </div>
    );
}
