import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaLeaf, FaTractor, FaIndustry, FaStore, FaQrcode, FaShieldAlt, FaChartLine } from 'react-icons/fa';
import * as THREE from 'three';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Three.js Globe Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / 600, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true 
    });

    renderer.setSize(Math.min(window.innerWidth, 600), 600);
    camera.position.z = 3;

    // Create Globe
    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: 0x40826d,
      emissive: 0x2d5a3a,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add markers (small spheres)
    const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x99cbb7 });
    
    const markerPositions = [
      [1, 0.5, 0.5],
      [-0.8, 1, 0.3],
      [0.5, -1, 0.8],
      [-0.5, 0.8, -1],
      [1.2, -0.3, -0.7],
    ];

    markerPositions.forEach((pos) => {
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(pos[0], pos[1], pos[2]);
      sphere.add(marker);
    });

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, 2));

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      sphere.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
    };
  }, []);

  const features = [
    {
      icon: <FaShieldAlt />,
      title: 'Immutable Records',
      description: 'Blockchain-secured data that cannot be tampered with',
    },
    {
      icon: <FaQrcode />,
      title: 'QR Verification',
      description: 'Instant product verification with smartphone scan',
    },
    {
      icon: <FaChartLine />,
      title: 'AI Fraud Detection',
      description: 'Advanced algorithms detect anomalies and fraud',
    },
    {
      icon: <FaLeaf />,
      title: 'Carbon Tracking',
      description: 'Monitor environmental impact from farm to table',
    },
  ];

  const roles = [
    {
      title: 'Farmer',
      icon: <FaTractor />,
      description: 'Register and track your organic produce',
      link: '/farmer',
      color: 'from-green-600 to-green-500',
    },
    {
      title: 'Processor',
      icon: <FaIndustry />,
      description: 'Process batches and add quality data',
      link: '/processor',
      color: 'from-blue-600 to-blue-500',
    },
    {
      title: 'Retailer',
      icon: <FaStore />,
      description: 'Receive and sell verified products',
      link: '/retailer',
      color: 'from-purple-600 to-purple-500',
    },
    {
      title: 'Consumer',
      icon: <FaQrcode />,
      description: 'Scan and verify product authenticity',
      link: '/consumer/1',
      color: 'from-yellow-600 to-yellow-500',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <canvas ref={canvasRef} />
        </div>

        <div className="relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <FaLeaf className="text-6xl text-primary-400 animate-float" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text">
              OrganicChain
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-8">
              Blockchain-Powered Supply Chain Traceability
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Building trust from farm to table with immutable records, AI-powered verification,
              and complete transparency for organic produce.
            </p>

            <div className="flex gap-6 justify-center">
              <Link href="/farmer">
                <motion.button
                  className="glass-button text-lg px-8 py-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </Link>
              <Link href="/consumer/1">
                <motion.button
                  className="glass-button text-lg px-8 py-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Verify Product
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '10K+', label: 'Products Tracked' },
            { value: '99.9%', label: 'Authenticity Rate' },
            { value: '500+', label: 'Verified Farms' },
            { value: '50K', label: 'QR Scans' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="glass-card text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <p className="text-4xl font-bold gradient-text mb-2">{stat.value}</p>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-center mb-4 gradient-text">
            Why Choose OrganicChain?
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Advanced technology meets sustainable agriculture
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="glass-card p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -10 }}
              >
                <div className="text-5xl text-primary-400 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Roles Section */}
      <section className="py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-center mb-4 gradient-text">
            Select Your Role
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Access tailored dashboards for each stakeholder in the supply chain
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <Link key={index} href={role.link}>
                <motion.div
                  className={`glass-card p-8 text-center cursor-pointer bg-gradient-to-br ${role.color} bg-opacity-10`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className="text-6xl mb-4 flex justify-center">{role.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{role.title}</h3>
                  <p className="text-gray-300 text-sm">{role.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <motion.div
          className="glass-card p-12 text-center bg-gradient-to-r from-primary-600/20 to-primary-500/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the future of organic supply chain transparency
          </p>
          <Link href="/farmer">
            <motion.button
              className="glass-button text-lg px-12 py-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Launch Dashboard
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </>
  );
}
