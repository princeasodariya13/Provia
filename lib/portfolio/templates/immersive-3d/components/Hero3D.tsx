// @ts-nocheck
"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Environment, Sparkles, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function CoreShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.12;
      meshRef.current.rotation.y += delta * 0.15;
    }
    const t = state.clock.getElapsedTime();
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.sin(t / 4) * Math.PI;
      ring1Ref.current.rotation.y += delta * 0.25;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = Math.cos(t / 4) * Math.PI;
      ring2Ref.current.rotation.x -= delta * 0.25;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z -= delta * 0.15;
      ring3Ref.current.rotation.y += Math.sin(t / 3) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <group>
        {/* Core dark glass distorted orb */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.5, 4]} />
          <MeshDistortMaterial
            color="#050505"
            emissive="#0a1a24"
            emissiveIntensity={0.5}
            roughness={0.05}
            metalness={1}
            distort={0.4}
            speed={2}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        
        {/* Intricate Orbital Rings */}
        <mesh ref={ring1Ref}>
          <torusGeometry args={[2.5, 0.015, 32, 100]} />
          <meshStandardMaterial color="#5EF7F0" emissive="#5EF7F0" emissiveIntensity={2} />
        </mesh>
        
        <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.9, 0.015, 32, 100]} />
          <meshStandardMaterial color="#A78BFA" emissive="#A78BFA" emissiveIntensity={2} />
        </mesh>
        
        <mesh ref={ring3Ref} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[3.4, 0.01, 32, 100]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} opacity={0.2} transparent />
        </mesh>
      </group>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 8.5], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          
          {/* Neon rim lights */}
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#5EF7F0" />
          <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#A78BFA" />
          <pointLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />
          
          {/* Photorealistic HDRI reflections */}
          <Environment preset="city" />
          
          {/* High-end particle effects */}
          <Sparkles count={250} scale={14} size={1.5} speed={0.4} opacity={0.4} color="#5EF7F0" />
          <Sparkles count={150} scale={18} size={2.5} speed={0.2} opacity={0.2} color="#A78BFA" />
          <Sparkles count={100} scale={10} size={1} speed={0.6} opacity={0.5} color="#ffffff" />

          <CoreShape />
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.8}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 2.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
