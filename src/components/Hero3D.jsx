import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 5000 }) {
    const pointsRef = useRef();

    // Use useMemo to prevent recalculating particle positions every render
    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            // Create an expanding radius 
            const r = Math.random() * 5 + 1;
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(Math.random() * 2 - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        return positions;
    }, [count]);

    // React to mouse movement
    useFrame((state, delta) => {
        if (pointsRef.current) {
            // Slow rotation by default
            pointsRef.current.rotation.y -= delta * 0.05;
            // React to mouse smoothly
            pointsRef.current.rotation.x -= (state.pointer.y * 0.2 - pointsRef.current.rotation.x) * 0.05;
            pointsRef.current.rotation.y += (state.pointer.x * 0.2 - pointsRef.current.rotation.y) * 0.05;
        }
    });

    return (
        <Points ref={pointsRef} positions={particlesPosition} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#00f3ff"
                size={0.02}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

// Add a secondary system for amber accents
function AccentNetwork({ count = 500 }) {
    const pointsRef = useRef();

    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const rand = (min, max) => Math.random() * (max - min) + min;
        for (let i = 0; i < count; i++) {
            positions[i * 3] = rand(-4, 4);
            positions[i * 3 + 1] = rand(-4, 4);
            positions[i * 3 + 2] = rand(-4, 4);
        }
        return positions;
    }, [count]);

    // Use useFrame for subtle floating
    useFrame((state, delta) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.z += delta * 0.02;
            pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    return (
        <Points ref={pointsRef} positions={particlesPosition} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#fbbf24"
                size={0.03}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

export default function Hero3D() {
    // Detect mobile to gracefully degrade
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="fixed inset-0 z-0 bg-[#000810]">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }} className="absolute inset-0 z-0">
                <ambientLight intensity={0.2} />
                {/* Primary cyan particle field. Degrade particle count on mobile */}
                <ParticleField count={isMobile ? 1500 : 6000} />
                {/* Secondary amber particles */}
                <AccentNetwork count={isMobile ? 200 : 800} />
            </Canvas>

            {/* Glassmorphism safety overlay to sit securely behind foreground elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#000810]/80 backdrop-blur-[2px] pointer-events-none z-10" />
        </div>
    );
}
