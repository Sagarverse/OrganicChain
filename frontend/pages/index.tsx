import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { FaLeaf, FaTractor, FaIndustry, FaStore, FaQrcode, FaShieldAlt, FaChartLine, FaNetworkWired, FaServer, FaCubes } from 'react-icons/fa';
import * as THREE from 'three';

// --- Background Particle Animation ---
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 30;

    // Create Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      // Spread particles across a wide area
      posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const material = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x10b981, // Emerald 500
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX);
      mouseY = (event.clientY - windowHalfY);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      targetX = mouseX * 0.001;
      targetY = mouseY * 0.001;

      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0002;

      // Smoothly move particles towards mouse
      particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
      particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      renderer.dispose();
      particlesGeometry.dispose();
      material.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />;
};

// --- Mock Live Transactions Feed ---
const LiveTransactions = () => {
  const [txns, setTxns] = useState<any[]>([]);

  useEffect(() => {
    // Generate initial dummy txns
    const actions = ['Batch Registered', 'Quality Inspected', 'Ownership Transferred', 'Temperature Logged', 'Certificate Issued'];
    const roles = ['Farmer 0x2A...', 'Processor 0x8B...', 'Inspector 0xF1...', 'Retailer 0x9C...', 'Sensor IoT_Hub'];

    const initial = Array.from({ length: 8 }).map((_, i) => ({
      id: Math.random().toString(36).substring(7),
      action: actions[Math.floor(Math.random() * actions.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      time: `${Math.floor(Math.random() * 60)}s ago`,
      hash: `0x${Math.random().toString(16).substring(2, 10)}...`
    }));
    setTxns(initial);

    // Simulate incoming new transactions
    const interval = setInterval(() => {
      setTxns(prev => {
        const newTxn = {
          id: Math.random().toString(36).substring(7),
          action: actions[Math.floor(Math.random() * actions.length)],
          role: roles[Math.floor(Math.random() * roles.length)],
          time: 'Just now',
          hash: `0x${Math.random().toString(16).substring(2, 10)}...`
        };
        return [newTxn, ...prev].slice(0, 8); // Keep last 8
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute right-8 top-1/4 w-80 glass-card p-4 hidden xl:block shadow-[0_0_50px_rgba(16,185,129,0.1)] border-emerald-500/20 z-20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
        <h3 className="text-sm font-bold text-gray-300 font-mono tracking-wider">LIVE NETWORK FEED</h3>
      </div>
      <div className="space-y-3 overflow-hidden relative h-[320px]">
        {/* Gradient mask for fading out bottom items */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-dark-100 to-transparent z-10 pointer-events-none"></div>

        {txns.map((tx, idx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: 20, height: 0 }}
            animate={{ opacity: 1 - (idx * 0.15), x: 0, height: 'auto' }}
            transition={{ type: "spring", stiffness: 100 }}
            className={`p-3 rounded border border-gray-700/50 ${idx === 0 ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-gray-800/30'}`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-xs font-bold ${idx === 0 ? 'text-emerald-400' : 'text-gray-400'}`}>{tx.action}</span>
              <span className="text-[10px] text-gray-500">{tx.time}</span>
            </div>
            <p className="text-xs text-gray-300 font-mono">{tx.role}</p>
            <p className="text-[10px] text-gray-500 font-mono mt-1">Tx: {tx.hash}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};


export default function Home() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const features = [
    {
      icon: <FaNetworkWired />,
      title: 'Decentralized Architecture',
      description: 'Zero single point of failure. Smart contracts govern state transitions autonomously across the EVM network.',
    },
    {
      icon: <FaQrcode />,
      title: 'Cryptographic Verification',
      description: 'Physical assets mapped to digital twins via secure NFC/QR codes tied to immutable block hashes.',
    },
    {
      icon: <FaChartLine />,
      title: 'IoT Telemetry Hooks',
      description: 'Direct integration with Oracle networks for real-time temperature, humidity, and location sensor data ingestion.',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Zero-Knowledge Proofs',
      description: 'Verify organic certifications and inspector credentials without exposing sensitive proprietary trade data.',
    },
  ];

  const roles = [
    {
      title: 'Farmer Dashboard',
      subtitle: 'Origin Genesis',
      icon: <FaTractor />,
      description: 'Mint new digital twins for physical yields. Attach IPFS-pinned organic certifications.',
      link: '/farmer',
      color: 'from-emerald-600 to-emerald-400',
      glow: 'emerald',
    },
    {
      title: 'Processor Gateway',
      subtitle: 'State Transition',
      icon: <FaServer />,
      description: 'Execute composite manufacturing Smart Contracts. Append sensor arrays and combine batch IDs.',
      link: '/processor',
      color: 'from-blue-600 to-blue-400',
      glow: 'blue',
    },
    {
      title: 'Retailer Portal',
      subtitle: 'Final Custody',
      icon: <FaStore />,
      description: 'Accept cryptographic handoffs. Trigger automated wholesale payments via stablecoin escrows.',
      link: '/retailer',
      color: 'from-purple-600 to-purple-400',
      glow: 'purple',
    },
    {
      title: 'Consumer DApp',
      subtitle: 'Public Ledger',
      icon: <FaQrcode />,
      description: 'Scan items to recursively traverse the Merkle tree and validate authenticity scores in real-time.',
      link: '/scan',
      color: 'from-yellow-600 to-yellow-400',
      glow: 'yellow',
    },
  ];

  return (
    <div className="relative overflow-hidden bg-obsidian">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 bg-transparent">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
      </div>

      <ParticleBackground />

      {/* Main Content */}
      <div className="relative z-10">

        {/* --- HERO SECTION --- */}
        <section className="min-h-screen flex items-center justify-center relative pt-20">
          <motion.div
            style={{ y: yHero, opacity: opacityHero }}
            className="text-center max-w-5xl px-4 relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="inline-flex items-center gap-3 mb-8 px-6 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
              <span className="text-emerald-300 font-mono text-sm tracking-widest uppercase">EVM Network Live</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-7xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tighter"
            >
              <span className="text-white">Organic</span>
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">Chain</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light"
            >
              The industry-grade Web3 protocol for immutable supply chain state tracking. Cryptographically verifying farm-to-table provenance at global scale.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/explorer">
                <button className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-obsidian font-bold rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] overflow-hidden">
                  <div className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    <FaCubes /> View Global Ledger
                  </span>
                </button>
              </Link>
              <Link href="/scan">
                <button className="group px-8 py-4 bg-transparent border border-gray-600 hover:border-emerald-400 text-white font-bold rounded-lg transition-all duration-300 hover:bg-emerald-400/10 backdrop-blur-sm">
                  <span className="flex items-center gap-2 group-hover:text-emerald-300 transition-colors">
                    <FaQrcode /> Launch Consumer Scanner
                  </span>
                </button>
              </Link>
            </motion.div>
          </motion.div>

          <LiveTransactions />

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 flex flex-col items-center"
          >
            <span className="text-xs font-mono uppercase tracking-widest mb-2">Initialize System</span>
            <div className="w-px h-16 bg-gradient-to-b from-emerald-500/50 to-transparent"></div>
          </motion.div>
        </section>

        {/* --- ARCHITECTURE DIAGRAM / STATS --- */}
        <section className="py-32 relative border-t border-gray-800/50 bg-black/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Trustless Infrastructure</h2>
              <p className="text-gray-400 max-w-2xl mx-auto font-mono text-sm">Validating 10K+ assets through decentralized consensus mechanisms</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-20">
              {[
                { value: '100%', label: 'Uptime', sub: 'EVM Network' },
                { value: '< 2s', label: 'Finality', sub: 'Block Confirmation' },
                { value: 'Zero', label: 'Data Manipulation', sub: 'Cryptographic Guarantee' },
                { value: 'IPFS', label: 'Storage Layers', sub: 'Distributed File Sys' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 md:p-8 text-center relative overflow-hidden group border-gray-700/50 hover:border-emerald-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-3xl md:text-5xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors">{stat.value}</p>
                  <p className="text-sm font-bold text-gray-300 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xs font-mono text-gray-500 mt-2">{stat.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Architecture Flow */}
            <div className="relative p-8 rounded-2xl border border-gray-800 bg-obsidian/80 backdrop-blur-xl">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <FaNetworkWired className="text-emerald-400" />
                    Distributed Network
                  </h3>
                  <p className="text-gray-400">Our smart contracts execute complex state transitions based on multi-signature approvals from farmers, processing facilities, and USDA organic inspectors.</p>
                  <ul className="space-y-3 font-mono text-sm text-gray-500">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Solidity SHA-256 Hashing</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Decentralized Identity (DID)</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> IPFS Content Addressing</li>
                  </ul>
                </div>

                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                  {/* Decorative connection lines */}
                  <div className="hidden md:block absolute top-1/2 left-10 right-10 h-0.5 bg-gray-800 -z-10 -translate-y-1/2">
                    <motion.div
                      className="h-full bg-emerald-500/50"
                      animate={{ width: ['0%', '100%', '0%'], left: ['0%', '0%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>

                  {roles.map((r, i) => (
                    <div key={i} className="bg-dark-100 border border-gray-700/80 rounded-xl p-4 text-center z-10 shadow-lg">
                      <div className={`w-12 h-12 mx-auto rounded-lg bg-${r.glow}-900/30 border border-${r.glow}-500/30 flex items-center justify-center text-xl text-${r.glow}-400 mb-3`}>
                        {r.icon}
                      </div>
                      <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-1">{r.title.split(' ')[0]}</p>
                      <p className="text-[10px] text-gray-500 font-mono">Node {i + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PROTOCOL FEATURES --- */}
        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-white">
              Protocol Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-8 group hover:bg-dark-100/80 transition-all border-gray-800"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gray-800/50 border border-gray-700 flex items-center justify-center text-2xl text-white group-hover:text-emerald-400 group-hover:border-emerald-500/30 mb-6 transition-all ring-4 ring-black">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SYSTEM INTERFACES (ROLES) --- */}
        <section className="py-32 bg-black/60 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">System Interfaces</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Access role-based smart contract gateways restricted by cryptographic signatures.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((role, index) => (
                <Link key={index} href={role.link}>
                  <motion.div
                    className="relative group h-full cursor-pointer"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Glowing background effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${role.color} rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500`}></div>

                    <div className="relative h-full bg-obsidian border border-gray-700/80 rounded-2xl p-8 flex flex-col transition-all">
                      <div className={`text-4xl mb-6 bg-gradient-to-br ${role.color} text-transparent bg-clip-text`}>
                        {role.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                        {role.title}
                      </h3>
                      <p className="text-xs font-mono text-gray-500 mb-4">{role.subtitle}</p>
                      <p className="text-gray-400 text-sm flex-grow leading-relaxed">{role.description}</p>

                      <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors">Access Portal</span>
                        <svg className="w-4 h-4 text-gray-600 group-hover:text-white transform group-hover:translate-x-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA FOOTER --- */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent pointer-events-none"></div>

          <motion.div
            className="max-w-4xl mx-auto text-center px-6 relative z-10"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8 mb-8 backdrop-blur-xl">
              <FaShieldAlt className="text-4xl text-emerald-400" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">Deploy the Trust Layer</h2>
            <p className="text-xl text-gray-400 mb-10 font-light">
              Stop relying on opaque spreadsheets. Start leveraging cryptographic truth for your global supply chain infrastructure.
            </p>
            <Link href="/admin">
              <button className="px-10 py-5 bg-white text-black hover:bg-emerald-400 font-bold text-lg rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(52,211,153,0.5)]">
                Initialize Admin Genesis
              </button>
            </Link>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
