import React, { useState, useEffect, useRef } from 'react';
import { Network, Database, Code, Cloud, ChevronRight, Cpu, Layers, Maximize, ArrowRight, X, Terminal as TerminalIcon, Loader2, Target, Crosshair, Activity, AlertTriangle } from 'lucide-react';

// --- GEMINI API INTEGRATION ---
const apiKey = ""; // Provided by execution environment

const generateArchitecture = async (problemDescription) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: `You are an elite Senior AI & Data Architect at Berix Systems. A potential client has described their business challenge: "${problemDescription}". Provide a highly technical, bleeding-edge architecture proposal to solve it.`
            }]
        }],
        systemInstruction: {
            parts: [{
                text: "You are an elite AI architect. Provide responses in strict JSON format. Use buzzwords appropriately but remain technically sound (e.g., Kubernetes, Kafka, Transformers, Edge AI, Vector DBs)."
            }]
        },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    executiveSummary: { type: "STRING", description: "A punchy, one-sentence summary of the solution." },
                    coreEngine: { type: "STRING", description: "The specific AI/ML models and neural network architectures recommended." },
                    dataIngestion: { type: "STRING", description: "The recommended data pipeline, ETL, and storage architecture." },
                    infrastructure: { type: "STRING", description: "The cloud, compute, and deployment strategy." }
                },
                required: ["executiveSummary", "coreEngine", "dataIngestion", "infrastructure"]
            }
        }
    };

    const delays = [1000, 2000, 4000, 8000, 16000];

    for (let attempt = 0; attempt < 6; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return JSON.parse(textResponse);
        } catch (error) {
            if (attempt === 5) {
                throw new Error("Failed to connect to Berix AI core after multiple attempts. Please try again later.");
            }
            await new Promise(res => setTimeout(res, delays[attempt]));
        }
    }
};

// --- CUSTOM HOOKS ---
const useThreeJS = () => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (window.THREE) {
            setLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => setLoaded(true);
        document.head.appendChild(script);
    }, []);

    return loaded;
};

const useScrollReveal = (options = { threshold: 0.1 }) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        if (ref.current) observer.observe(ref.current);
        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [options]);

    return [ref, isVisible];
};

const useMouseParallax = (multiplier = 0.05) => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (window.innerWidth / 2 - e.clientX) * multiplier;
            const y = (window.innerHeight / 2 - e.clientY) * multiplier;
            setOffset({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [multiplier]);

    return offset;
};

// --- 3D BACKGROUND COMPONENT ---
const ThreeBackground = () => {
    const mountRef = useRef(null);
    const isThreeLoaded = useThreeJS();

    useEffect(() => {
        if (!isThreeLoaded || !mountRef.current) return;

        const THREE = window.THREE;
        let width = window.innerWidth;
        let height = window.innerHeight;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000810, 0.0015);

        const camera = new THREE.PerspectiveCamera(60, width / height, 1, 3000);
        camera.position.set(0, 200, 800);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.setClearColor(0x000810, 1);
        mountRef.current.appendChild(renderer.domElement);

        const gridHelper = new THREE.GridHelper(4000, 100, 0x00f3ff, 0x002233);
        gridHelper.position.y = -300;
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.3;
        scene.add(gridHelper);

        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const colors = [];
        const color = new THREE.Color();

        const clusters = [
            { x: -400, y: 100, z: -200, radius: 250, count: 1500 },
            { x: 500, y: -50, z: -400, radius: 300, count: 1800 },
            { x: 0, y: 300, z: -600, radius: 200, count: 1000 },
            { x: 200, y: 0, z: 200, radius: 150, count: 700 }
        ];

        clusters.forEach(cluster => {
            for (let i = 0; i < cluster.count; i++) {
                const u = Math.random();
                const v = Math.random();
                const theta = 2 * Math.PI * u;
                const phi = Math.acos(2 * v - 1);
                const r = cluster.radius * Math.cbrt(Math.random());

                const px = cluster.x + r * Math.sin(phi) * Math.cos(theta);
                const py = cluster.y + r * Math.sin(phi) * Math.sin(theta);
                const pz = cluster.z + r * Math.cos(phi);

                vertices.push(px, py, pz);

                if (Math.random() > 0.8) {
                    color.setHex(0xffb000);
                } else {
                    color.setHex(0x00f3ff);
                }
                colors.push(color.r, color.g, color.b);
            }
        });

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        const drones = [];
        const droneGeo = new THREE.ConeGeometry(8, 24, 4);
        const droneMat = new THREE.MeshBasicMaterial({ color: 0xffb000, wireframe: true, transparent: true, opacity: 0.6 });

        for (let i = 0; i < 15; i++) {
            const mesh = new THREE.Mesh(droneGeo, droneMat);
            const targetCluster = clusters[Math.floor(Math.random() * clusters.length)];

            mesh.position.set(
                targetCluster.x + (Math.random() - 0.5) * 400,
                targetCluster.y + (Math.random() - 0.5) * 400,
                targetCluster.z + (Math.random() - 0.5) * 400
            );

            scene.add(mesh);
            drones.push({
                mesh,
                cluster: targetCluster,
                angle: Math.random() * Math.PI * 2,
                speed: 0.005 + Math.random() * 0.01,
                radius: 150 + Math.random() * 200,
                yOffset: Math.random() * Math.PI * 2
            });
        }

        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;
        let scrollY = 0;

        const onDocumentMouseMove = (event) => {
            mouseX = (event.clientX - width / 2) * 1.5;
            mouseY = (event.clientY - height / 2) * 1.5;
        };

        const onScroll = () => {
            scrollY = window.scrollY;
        };

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        window.addEventListener('scroll', onScroll, false);

        let time = 0;
        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.005;

            particles.rotation.y = Math.sin(time * 0.1) * 0.1;
            gridHelper.position.z = (time * 100) % 100;

            drones.forEach(drone => {
                drone.angle += drone.speed;

                const nx = drone.cluster.x + Math.cos(drone.angle) * drone.radius;
                const nz = drone.cluster.z + Math.sin(drone.angle) * drone.radius;
                const ny = drone.cluster.y + Math.sin(time + drone.yOffset) * 50;

                drone.mesh.position.set(nx, ny, nz);
                drone.mesh.lookAt(
                    drone.cluster.x + Math.cos(drone.angle + 0.1) * drone.radius,
                    ny,
                    drone.cluster.z + Math.sin(drone.angle + 0.1) * drone.radius
                );
                drone.mesh.rotateX(Math.PI / 2);
            });

            targetX = mouseX * 0.5;
            targetY = mouseY * 0.5;
            camera.position.x += (targetX - camera.position.x) * 0.05;
            camera.position.y += (-targetY - camera.position.y) * 0.05 + Math.sin(time) * 0.5;

            const targetZ = 800 - (scrollY * 0.8);
            camera.position.z += (targetZ - camera.position.z) * 0.05;

            camera.lookAt(scene.position);
            renderer.render(scene, camera);
        };

        animate();

        const onWindowResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', onWindowResize, false);

        return () => {
            document.removeEventListener('mousemove', onDocumentMouseMove);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onWindowResize);
            if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            geometry.dispose();
            material.dispose();
            droneGeo.dispose();
            droneMat.dispose();
        };
    }, [isThreeLoaded]);

    return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-[#000810]" />;
};

// --- CUSTOM CURSOR ---
const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPointer, setIsPointer] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            const target = e.target;
            setIsPointer(
                window.getComputedStyle(target).cursor === 'pointer' ||
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('button') !== null
            );
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="hidden md:block pointer-events-none z-[100]">
            <div
                className="fixed top-0 left-0 w-1.5 h-1.5 bg-amber-400 mix-blend-screen transition-transform duration-75 ease-out"
                style={{ transform: `translate3d(${position.x - 3}px, ${position.y - 3}px, 0)` }}
            />
            <div
                className="fixed top-0 left-0 w-12 h-12 transition-all duration-200 ease-out"
                style={{
                    transform: `translate3d(${position.x - 24}px, ${position.y - 24}px, 0) scale(${isPointer ? 1.3 : 1}) rotate(${isPointer ? '45deg' : '0deg'})`,
                    opacity: isPointer ? 1 : 0.6
                }}
            >
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>
            </div>
            <div
                className="fixed top-0 left-0 text-[10px] font-mono text-cyan-400/70 ml-6 mt-4 transition-all duration-75"
                style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
            >
                X: {position.x.toString().padStart(4, '0')} <br />
                Y: {position.y.toString().padStart(4, '0')}
            </div>
        </div>
    );
};

// --- PROJECT DATA ---
const projectsData = [
    { id: 'AX-01', title: 'GLOBAL PAYROLL API', desc: 'Engineered an enterprise-level payroll integration system currently utilized seamlessly across 20+ countries.', status: 'DEPLOYED', color: 'text-cyan-400', border: 'border-cyan-500', latency: '4ms', nodes: '8,192', arch: 'Microservices & GCP', logs: ['[SYS] INIT_NODE_AX01...', '[NET] ESTABLISHING_SECURE_TUNNEL...', '[DATA] INGEST_RATE: OPTIMAL', '[API] AUTH_VERIFIED', '[SEC] ENCRYPTION_LAYER_ACTIVE', '[SYS] CYCLE_COMPLETE.'] },
    { id: 'NX-99', title: 'B2B LEGAL-TECH SEARCH', desc: 'Built a specialized B2B legal platform equipped with vector-based semantic search for rapid document retrieval.', status: 'ACTIVE', color: 'text-amber-400', border: 'border-amber-500', latency: '12ms', nodes: '4,096', arch: 'Vector DB & LLMs', logs: ['[SYS] WAKING_NEXUS_NODES...', '[DATA] SYNCING_EMBEDDINGS...', '[NET] INDEXING_LEGAL_CORPUS...', '[OPT] SEARCH_EFFICIENCY: 99.9%', '[SYS] INTEGRITY_CHECK: PASSED.'] },
    { id: 'SV-V4', title: 'HIGH-SPEED FINTECH AI', desc: 'Developed automated market-analysis logic for high-speed financial ecosystems to detect real-time anomalies.', status: 'OPTIMIZING', color: 'text-cyan-600', border: 'border-cyan-700', latency: '1ms', nodes: '128 (EDGE)', arch: 'Streaming ETL & Kinesis', logs: ['[EDGE] DEPLOYING_SCORING_LOGIC...', '[AI] MARKET_MODEL_V4_LOADED...', '[SENSORS] STREAM_ACTIVE...', '[SYS] LATENCY_OPTIMIZED: 0.8ms', '[SYS] AWAITING_COMMAND...'] }
];

// --- PROJECT OVERRIDE HUD ---
const ProjectHUD = ({ project, onClose }) => {
    const [phase, setPhase] = useState('flash');
    const [scrambleText, setScrambleText] = useState('');
    const [logIndex, setLogIndex] = useState(0);

    useEffect(() => {
        if (!project) return;
        setPhase('flash');
        const t1 = setTimeout(() => setPhase('boot'), 300);
        const t2 = setTimeout(() => setPhase('active'), 2000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [project]);

    useEffect(() => {
        if (phase === 'boot') {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
            const interval = setInterval(() => {
                setScrambleText(Array(15).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join(''));
            }, 50);
            return () => clearInterval(interval);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'active' && project) {
            setLogIndex(0);
            const interval = setInterval(() => {
                setLogIndex(prev => Math.min(prev + 1, project.logs.length));
            }, 800);
            return () => clearInterval(interval);
        }
    }, [phase, project]);

    if (!project) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
            <div className={`absolute inset-0 bg-white z-[110] transition-opacity duration-1000 ${phase === 'flash' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
            <div className={`absolute inset-0 bg-[#000810] transition-opacity duration-300 ${phase !== 'flash' ? 'opacity-100' : 'opacity-0'}`} />
            <div className="absolute inset-0 scanlines opacity-60 pointer-events-none z-0" />

            {phase === 'boot' && (
                <div className="relative z-10 flex flex-col items-center justify-center text-amber-400 font-mono animate-shake">
                    <Target className="w-32 h-32 animate-spin-slow mb-8 opacity-80" />
                    <h2 className="text-2xl font-bold tracking-[0.5em] mb-4 text-center">TACTICAL OVERRIDE INITIATED</h2>
                    <p className="text-xl tracking-widest opacity-80 mb-2">DECRYPTING TELEMETRY...</p>
                    <p className="text-cyan-400 text-lg tracking-widest">{scrambleText}</p>
                    <div className="w-64 h-1 bg-amber-900/50 mt-8 overflow-hidden">
                        <div className="h-full bg-amber-400 w-full animate-progress-fast" />
                    </div>
                </div>
            )}

            {phase === 'active' && (
                <div className="relative z-10 w-full h-full p-6 md:p-12 lg:p-16 flex flex-col animate-fade-in text-cyan-500 font-mono overflow-y-auto custom-scrollbar">
                    <div className="fixed top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-amber-500/70 pointer-events-none" />
                    <div className="fixed top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-amber-500/70 pointer-events-none" />
                    <div className="fixed bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-amber-500/70 pointer-events-none" />
                    <div className="fixed bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-amber-500/70 pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-cyan-900/50 pb-6 gap-6">
                        <div>
                            <p className="text-amber-400 text-xs tracking-[0.3em] mb-2 animate-pulse">[ SECURE UPLINK ESTABLISHED ]</p>
                            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-widest uppercase">{project.title}</h2>
                            <p className="text-cyan-400/70 mt-2 tracking-widest text-xs md:text-sm uppercase">ID: {project.id} // {project.arch}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 border-2 border-red-900/50 text-red-500 hover:bg-red-900/30 hover:text-red-400 font-bold tracking-widest text-xs uppercase transition-colors flex items-center gap-2 flex-shrink-0"
                        >
                            <X className="w-4 h-4" /> Terminate Connection
                        </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                        <div className="flex flex-col gap-8 lg:border-r border-cyan-900/30 lg:pr-8">
                            <div className="relative w-full aspect-square max-w-[280px] mx-auto flex items-center justify-center border border-cyan-900/50 rounded-full bg-cyan-950/10 overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.05)]">
                                <div className="absolute inset-0 border border-cyan-800/50 rounded-full m-4" />
                                <div className="absolute inset-0 border border-cyan-800/30 rounded-full m-12" />
                                <div className="absolute inset-0 border border-cyan-800/20 rounded-full m-20" />
                                <div className="absolute top-1/2 left-1/2 w-[50%] h-[2px] bg-gradient-to-r from-transparent to-cyan-400 origin-left animate-radar-spin" />
                                <Target className={`w-8 h-8 ${project.color} animate-pulse z-10`} />
                                <div className="absolute top-[30%] left-[60%] w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                                <div className="absolute top-[70%] left-[40%] w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-cyan-950/30 border border-cyan-900/50 p-4">
                                    <p className="text-[10px] text-cyan-600 tracking-widest mb-1">NETWORK LATENCY</p>
                                    <p className="text-xl text-white flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /> {project.latency}</p>
                                </div>
                                <div className="bg-cyan-950/30 border border-cyan-900/50 p-4">
                                    <p className="text-[10px] text-cyan-600 tracking-widest mb-1">ACTIVE NODES</p>
                                    <p className="text-xl text-white flex items-center gap-2"><Network className="w-4 h-4 text-cyan-400" /> {project.nodes}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 lg:col-span-1">
                            <div className="border border-cyan-900/50 bg-black/40 p-6 relative">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-amber-500/50 to-transparent" />
                                <h3 className="text-amber-400 text-xs tracking-[0.2em] mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> CURRENT STATUS</h3>
                                <p className="text-2xl text-white tracking-widest">{project.status}</p>
                            </div>

                            <div className="border border-cyan-900/50 bg-black/40 p-6 flex-1">
                                <h3 className="text-cyan-500 text-xs tracking-[0.2em] mb-4">SYSTEM DIRECTIVE</h3>
                                <p className="text-cyan-100/70 text-sm leading-relaxed tracking-wide">{project.desc}</p>

                                <div className="mt-8 space-y-4">
                                    <div className="flex justify-between items-center text-xs border-b border-cyan-900/50 pb-2">
                                        <span className="text-cyan-600 tracking-widest">DATA_THROUGHPUT</span>
                                        <span className="text-cyan-300">OPTIMAL</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs border-b border-cyan-900/50 pb-2">
                                        <span className="text-cyan-600 tracking-widest">ENCRYPTION_LAYER</span>
                                        <span className="text-cyan-300">QUANTUM-RESISTANT</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs border-b border-cyan-900/50 pb-2">
                                        <span className="text-cyan-600 tracking-widest">CORE_TEMP</span>
                                        <span className="text-cyan-300">32.4°C</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#000408] border border-cyan-900/50 p-6 flex flex-col font-mono text-xs overflow-hidden relative min-h-[300px]">
                            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#000408] to-transparent z-10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#000408] to-transparent z-10 pointer-events-none" />
                            <h3 className="text-cyan-600 tracking-[0.2em] mb-4 border-b border-cyan-900/50 pb-2 flex-shrink-0">LIVE_TERMINAL_FEED</h3>
                            <div className="flex-1 overflow-y-auto flex flex-col justify-end gap-3 text-cyan-400/80 custom-scrollbar pb-2">
                                {project.logs.slice(0, logIndex).map((log, i) => (
                                    <div key={i} className="animate-fade-in break-words flex gap-2">
                                        <span className="text-cyan-700 flex-shrink-0">{`>`}</span>
                                        <span className="tracking-wide">{log}</span>
                                    </div>
                                ))}
                                {logIndex < project.logs.length && (
                                    <div className="animate-pulse text-amber-500 tracking-widest">_</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- TILT CARD COMPONENT ---
const TiltCard = ({ icon: Icon, title, description, delay = 0 }) => {
    const cardRef = useRef(null);
    const [revealRef, isVisible] = useScrollReveal();
    const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    };

    const handleMouseLeave = () => setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');

    return (
        <div ref={revealRef} className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${delay}ms` }}>
            <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="h-full bg-black/60 backdrop-blur-md border border-cyan-900/50 p-8 cursor-pointer relative group"
                style={{ transform, transition: 'transform 0.1s ease-out, box-shadow 0.3s ease', transformStyle: 'preserve-3d' }}
            >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400 opacity-50"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,243,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
                    <div className="mb-6 text-cyan-500 group-hover:text-cyan-300 transition-colors">
                        <Icon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 tracking-wide uppercase font-mono">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-mono group-hover:text-gray-300 transition-colors">{description}</p>
                </div>
            </div>
        </div>
    );
};

// --- GEMINI TERMINAL MODAL ---
const ArchitectureTerminal = ({ isOpen, onClose }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const arch = await generateArchitecture(input);
            setResult(arch);
        } catch (err) {
            setError(err.message || 'An error occurred while generating the architecture.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-4xl bg-[#000810] border border-cyan-500/50 shadow-[0_0_50px_rgba(0,243,255,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/30 bg-cyan-950/40">
                    <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-amber-400 animate-spin-slow" />
                        <span className="font-mono text-cyan-400 font-bold tracking-widest text-sm uppercase">BERIX_UPLINK // AI_SYNTHESIZER</span>
                    </div>
                    <button onClick={onClose} className="text-cyan-600 hover:text-amber-400 transition-colors p-1">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1))] bg-[length:100%_4px] pointer-events-none z-0" />

                    <div className="relative z-10">
                        {!result && !isLoading && (
                            <div className="animate-fade-in">
                                <p className="text-cyan-100/70 font-mono mb-6 text-sm md:text-base leading-relaxed">
                                    <span className="text-amber-400">[{'>'}] STATUS:</span> Secure connection established.<br />
                                    <span className="text-amber-400">[{'>'}] DIRECTIVE:</span> Input structural data parameters, identified bottlenecks, or strategic intelligence targets. LLM array will dynamically engineer a deployment blueprint.
                                </p>

                                <div className="relative">
                                    <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-cyan-400"></div>
                                    <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-cyan-400"></div>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="e.g., Target: Process 5TB of decentralized supply chain logs daily to preemptively calculate shipping disruptions..."
                                        className="w-full h-32 bg-black/60 border border-cyan-900/50 p-6 text-cyan-50 font-mono text-sm placeholder:text-cyan-800 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none mb-6"
                                    />
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={!input.trim()}
                                    className="px-8 py-3 bg-cyan-950/50 hover:bg-cyan-900/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 font-mono font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group uppercase tracking-widest"
                                >
                                    <Target className="w-4 h-4 group-hover:text-amber-400" /> Execute Synthesis
                                </button>
                            </div>
                        )}

                        {isLoading && (
                            <div className="flex flex-col items-center justify-center h-48 space-y-4">
                                <Crosshair className="w-12 h-12 text-cyan-400 animate-spin" />
                                <p className="font-mono text-amber-400 animate-pulse text-sm tracking-widest">CALCULATING CLUSTER TOPOLOGY...</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-950/30 border border-red-500/50 p-6 text-red-400 font-mono text-sm">
                                <p>[!] CRITICAL ERROR: {error}</p>
                                <button onClick={() => setError('')} className="mt-4 text-white underline hover:text-amber-400">Re-initialize</button>
                            </div>
                        )}

                        {result && !isLoading && (
                            <div className="space-y-6 animate-fade-in font-mono">
                                <div className="bg-cyan-950/20 border-l-2 border-amber-400 p-6">
                                    <h4 className="text-amber-400 text-xs uppercase tracking-widest mb-2">[ EXECUTIVE_SUMMARY ]</h4>
                                    <p className="text-cyan-50 text-base leading-relaxed">{result.executiveSummary}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-black/40 border border-cyan-900/50 p-5 relative">
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                                        <h4 className="text-cyan-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><Database className="w-4 h-4" /> Data Ingestion</h4>
                                        <p className="text-cyan-100/70 text-xs leading-relaxed">{result.dataIngestion}</p>
                                    </div>

                                    <div className="bg-black/40 border border-cyan-900/50 p-5 relative">
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                                        <h4 className="text-cyan-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><Cpu className="w-4 h-4" /> Core AI Engine</h4>
                                        <p className="text-cyan-100/70 text-xs leading-relaxed">{result.coreEngine}</p>
                                    </div>

                                    <div className="bg-black/40 border border-cyan-900/50 p-5 relative">
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                                        <h4 className="text-cyan-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-2"><Cloud className="w-4 h-4" /> Infrastructure</h4>
                                        <p className="text-cyan-100/70 text-xs leading-relaxed">{result.infrastructure}</p>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <button
                                        onClick={() => setResult(null)}
                                        className="px-6 py-2 border border-cyan-800 hover:border-cyan-500 text-cyan-400 text-xs uppercase tracking-widest transition-colors"
                                    >
                                        [ Reset Parameters ]
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- LOGO COMPONENT ---
const BerixLogo = ({ className = "w-10 h-10" }) => {
    const circuits = [];
    const pseudoRandom = (seed) => {
        let value = Math.sin(seed * 1.234) * 10000;
        return value - Math.floor(value);
    };

    for (let i = 0; i < 60; i++) {
        const angle = (i * (360 / 60)) * (Math.PI / 180);

        // Skip angles that overlap with the text box (Center is 50,50, Text width is approx ~70, height is ~20)
        if (Math.abs(angle - 0) < 0.4 || Math.abs(angle - Math.PI * 2) < 0.4) continue;
        if (Math.abs(angle - Math.PI) < 0.4) continue;

        const rand1 = pseudoRandom(i);
        const rand2 = pseudoRandom(i + 100);

        const innerRadius = 22 + rand1 * 5;
        const outRadius1 = innerRadius + 8 + rand2 * 8;
        const outRadius2 = outRadius1 + 5 + pseudoRandom(i + 200) * 10;

        const sx = 50 + Math.cos(angle) * innerRadius;
        const sy = 50 + Math.sin(angle) * innerRadius;

        const bendAngle = Math.round(angle / (Math.PI / 8)) * (Math.PI / 8);

        const mx = 50 + Math.cos(bendAngle) * outRadius1;
        const my = 50 + Math.sin(bendAngle) * outRadius1;

        const ex = 50 + Math.cos(bendAngle) * outRadius2;
        const ey = 50 + Math.sin(bendAngle) * outRadius2;

        circuits.push(
            <g key={i}>
                <polyline points={`${sx},${sy} ${mx},${my} ${ex},${ey}`} stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={ex} cy={ey} r="1.5" fill="currentColor" stroke="none" />
            </g>
        );
    }

    return (
        <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
            <g className="text-cyan-600 opacity-80">
                {circuits}
            </g>
            <g fill="currentColor" transform="translate(14, 56) scale(0.6)">
                {/* B */}
                <path d="M 0 0 V -28 h 9 c 4.5 0, 7.5 2, 7.5 6 c 0 3, -2 4.5, -4.5 5.5 c 3.5 1, 5.5 3, 5.5 6.5 c 0 4.5, -3.5 10, -9 10 H 0 Z M 3.5 -4 h 5.5 c 2.5 0, 4.5 -1.5, 4.5 -4.5 c 0 -2.5, -1.5 -4.5, -4.5 -4.5 H 3.5 V -4 Z M 3.5 -16.5 h 4.5 c 2.5 0, 4 -1.5, 4 -3.5 c 0 -2.5, -1.5 -3.5, -4 -3.5 H 3.5 V -16.5 Z" />
                {/* E */}
                <path d="M 22 0 V -28 h 13 v 3.5 H 25.5 v 7 h 8 v 3.5 h -8 v 10.5 h 9.5 v 3.5 H 22 Z" />
                {/* R */}
                <path d="M 43 0 V -28 h 9.5 c 5.5 0, 9 2.5, 9 8.5 c 0 4, -2 6.5, -5.5 7.5 l 6.5 12 H 58.5 l -5.5 -11 h -4.5 v 11 H 43 Z M 46.5 -15 h 4.5 c 2.5 0, 5.5 -1, 5.5 -4.5 c 0 -3.5, -2.5 -5, -5.5 -5 h -4.5 V -15 Z" />
                {/* > (Cyan color) */}
                <path d="M 68 -26 L 81 -14 L 68 -2 l 2.5 2.5 l 14.5 -14.5 l -14.5 -14.5 Z" className="text-cyan-400" fill="currentColor" />
                {/* X */}
                <path d="M 88 -28 L 93 -28 L 102 -15 L 111 -28 L 116 -28 L 105 -12 L 118 0 L 112 0 L 102 -10 L 92 0 L 86 0 L 99 -12 Z" />
            </g>
        </svg>
    )
}

// --- MAIN APP COMPONENT ---
export default function App() {
    const [heroRef, heroVisible] = useScrollReveal();
    const [servicesRef, servicesVisible] = useScrollReveal();
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const heroParallax = useMouseParallax(0.04);
    const backgroundParallax = useMouseParallax(0.01);

    return (
        <div className="bg-transparent min-h-screen text-white font-sans selection:bg-amber-500/30 overflow-x-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
        body { margin: 0; cursor: none; background: #000810; }
        @media (max-width: 768px) { body { cursor: auto; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000810; }
        ::-webkit-scrollbar-thumb { background: #00f3ff; }
        .scanlines {
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.15));
          background-size: 100% 4px;
          pointer-events: none;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 30;
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite; }
        .animate-radar-spin { animation: spin 3s linear infinite; }
        .animate-progress-fast { animation: progress 2s ease-in-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }
      `}} />

            <div className="scanlines" />
            <CustomCursor />
            <ThreeBackground />
            <ArchitectureTerminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
            <ProjectHUD project={selectedProject} onClose={() => setSelectedProject(null)} />

            <nav className="fixed top-0 left-0 w-full z-40 px-8 py-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center relative">
                        <BerixLogo className="text-white w-14 h-14" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-widest text-white uppercase font-mono leading-none">
                            Berix <span className="text-cyan-400">Systems</span>
                        </span>
                        <span className="text-[10px] text-cyan-600 font-mono tracking-widest mt-1">NODE: ACTIVE</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsTerminalOpen(true)}
                    className="px-6 py-2 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/40 hover:border-cyan-300 transition-all font-mono text-xs tracking-widest flex items-center gap-2 group uppercase"
                >
                    <Target className="w-4 h-4 group-hover:text-amber-400 transition-colors" /> Establish Uplink
                </button>
            </nav>

            <main className="relative z-40 flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20 overflow-hidden">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-900/30 rounded-full opacity-30 pointer-events-none"
                    style={{ transform: `translate(-50%, -50%) translate3d(${backgroundParallax.x}px, ${backgroundParallax.y}px, 0)` }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-dashed border-cyan-900/20 rounded-full opacity-20 pointer-events-none animate-[spin_60s_linear_infinite]"
                />

                <div
                    ref={heroRef}
                    className={`transition-all duration-1000 transform relative ${heroVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    style={{ transform: `translate3d(${heroParallax.x}px, ${heroParallax.y}px, 0)` }}
                >
                    <div className="inline-flex items-center gap-2 mb-8 px-4 py-1 border border-cyan-900/50 bg-black/40 text-xs font-mono text-cyan-500 tracking-widest uppercase">
                        <span className="w-2 h-2 bg-amber-400 animate-pulse"></span>
                        Global Data Clustering Array
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-none uppercase font-mono">
                        Engineering <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-700">
                            Intelligent Solutions.
                        </span>
                    </h1>
                    <p className="text-sm md:text-base text-cyan-100/60 max-w-2xl mx-auto font-mono mb-12 tracking-wide leading-relaxed">
                        Transforming complex business challenges into streamlined, scalable, and intelligent digital solutions. We are a technology firm focused on end-to-end Software, Data, and AI Engineering.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 font-mono">
                        <button
                            onClick={() => setIsTerminalOpen(true)}
                            className="group relative px-8 py-4 bg-cyan-950/40 border border-cyan-400 text-cyan-50 font-bold text-sm tracking-widest overflow-hidden hover:bg-cyan-900/80 transition-all uppercase"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Target className="w-4 h-4 text-amber-400" /> Init Data Swarm
                            </span>
                        </button>
                        <button className="px-8 py-4 border border-cyan-900/50 hover:border-cyan-500 text-cyan-500 hover:text-cyan-300 text-sm tracking-widest transition-all uppercase">
                            View Telemetry
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50">
                    <span className="text-[10px] font-mono mb-2 uppercase tracking-widest text-cyan-500">Descend</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-cyan-500 to-transparent animate-pulse" />
                </div>
            </main>

            <section className="relative z-40 px-6 md:px-12 py-32 max-w-7xl mx-auto">
                <div ref={servicesRef} className={`mb-20 transition-all duration-1000 ${servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-[1px] w-12 bg-amber-400"></div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-widest font-mono uppercase">
                            Core <span className="text-cyan-500">Capabilities</span>
                        </h2>
                    </div>
                    <p className="text-sm text-cyan-100/50 max-w-2xl font-mono leading-relaxed">
                        Whether you need to automate backend processes, build robust data infrastructure, or integrate cutting-edge AI into your product, we provide the technical foundation to scale your business.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <TiltCard icon={Code} title="Advanced Software Engineering" description="Backend development (Python, FastAPI), complex APIs, and modernizing enterprise digital landscapes via Google Cloud." delay={0} />
                    <TiltCard icon={Database} title="Data Engineering & Infrastructure" description="High-performance data pipelines (Databricks, Spark, Airflow), Data Lakes, and real-time streaming with AWS Kinesis." delay={100} />
                    <TiltCard icon={Network} title="Applied AI & Machine Learning" description="Integrating AI (LangChain, Pinecone, LLMs) and deploying locally trained models (CodeBERT) into core business processes." delay={200} />
                </div>
            </section>

            <section className="relative z-40 py-32 px-6 overflow-hidden min-h-screen flex flex-col justify-center border-t border-cyan-900/30 bg-black/40">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-cyan-900/30 rounded-full opacity-30 pointer-events-none"
                    style={{ transform: `translate(-50%, -50%) translate3d(${backgroundParallax.x * -1}px, ${backgroundParallax.y * -1}px, 0)` }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-dashed border-cyan-900/20 rounded-full opacity-20 pointer-events-none animate-[spin_90s_linear_infinite_reverse]"
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1300px] h-[1300px] border border-cyan-900/10 rounded-full opacity-10 pointer-events-none animate-[spin_120s_linear_infinite]"
                />

                <div className="max-w-7xl mx-auto w-full relative z-10" style={{ transform: `translate3d(${heroParallax.x * 0.5}px, ${heroParallax.y * 0.5}px, 0)` }}>
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-[1px] w-12 bg-amber-400"></div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-widest font-mono uppercase">
                            Proven <span className="text-cyan-500">Track Record</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {projectsData.map((proj, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedProject(proj)}
                                className="bg-black/60 border border-cyan-900/50 p-8 relative group hover:bg-cyan-950/40 transition-colors cursor-pointer"
                            >
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500 opacity-50"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500 opacity-50"></div>
                                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,243,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                <div className="flex justify-between items-start mb-6">
                                    <span className={`font-mono text-xs tracking-widest ${proj.color}`}>[{proj.id}]</span>
                                    <span className="font-mono text-[10px] uppercase tracking-widest bg-cyan-950/50 text-cyan-500 px-2 py-1 border border-cyan-900/50">
                                        {proj.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4 tracking-wide uppercase font-mono group-hover:text-amber-400 transition-colors">{proj.title}</h3>
                                <p className="text-cyan-100/60 text-sm leading-relaxed font-mono">{proj.desc}</p>
                                <div className="mt-8 pt-4 border-t border-cyan-900/30 flex items-center justify-between">
                                    <button className="text-[10px] text-cyan-500 group-hover:text-amber-400 uppercase tracking-widest font-mono flex items-center gap-2 transition-colors">
                                        OVERRIDE UPLINK <Target className="w-3 h-3 group-hover:animate-spin-slow" />
                                    </button>
                                    <Layers className={`w-4 h-4 ${proj.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="relative z-40 border-t border-cyan-900/30 bg-black/80 pt-24 pb-12 overflow-hidden backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <Target className="w-12 h-12 text-cyan-900 mx-auto mb-6 animate-pulse" />
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-widest font-mono uppercase">
                        Deploy <span className="text-cyan-500">Framework?</span>
                    </h2>
                    <p className="text-sm text-cyan-100/50 mb-12 max-w-xl mx-auto font-mono leading-relaxed">
                        Transmit your operational requirements to our AI Synthesizer. We will construct a bespoke architectural grid tailored to your parameters.
                    </p>
                    <button
                        onClick={() => setIsTerminalOpen(true)}
                        className="group relative px-10 py-4 border border-amber-500/50 hover:border-amber-400 bg-amber-950/20 text-amber-400 font-bold text-sm tracking-widest transition-all uppercase font-mono"
                    >
                        <span className="flex items-center justify-center gap-3 group-hover:text-amber-300">
                            <TerminalIcon className="w-5 h-5" /> Open Command Channel
                        </span>
                    </button>
                </div>

                <div className="mt-32 px-6 flex flex-col md:flex-row items-center justify-between text-cyan-900 font-mono text-[10px] uppercase tracking-widest max-w-7xl mx-auto border-t border-cyan-900/30 pt-6">
                    <p>[ © 2026 BERIX SYSTEMS LLC. SECURE NETWORK. ]</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-cyan-400 transition-colors">GITHUB</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">LINKEDIN</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">SYS_ADMIN</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}