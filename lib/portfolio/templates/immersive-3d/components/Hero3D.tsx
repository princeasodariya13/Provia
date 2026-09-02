// @ts-nocheck
"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Sparkles, MeshDistortMaterial, Lightformer } from "@react-three/drei";
import * as THREE from "three";

function Scene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Orb slow self-rotation
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.08;
      meshRef.current.rotation.y += delta * 0.12;
    }

    // Gentle floating for the whole group via glow ring
    if (glowRef.current) {
      glowRef.current.position.y = Math.sin(t * 0.6) * 0.15;
    }

    // Ring animations
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.sin(t * 0.3) * 0.8;
      ring1Ref.current.rotation.y += delta * 0.22;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = Math.cos(t * 0.25) * 0.8;
      ring2Ref.current.rotation.x -= delta * 0.18;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z -= delta * 0.12;
      ring3Ref.current.rotation.x = Math.sin(t * 0.2) * 0.5;
    }
  });

  // Orb radius: 1.0 | Rings: 1.7, 2.0, 2.3 — all fit comfortably with camera z=14, fov=55
  return (
    <group position={[0, 0, 0]}>
      {/* Core glowing orb */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.0, 64]} />
        <MeshDistortMaterial
          color="#050510"
          emissive="#0a0a20"
          roughness={0.05}
          metalness={1.0}
          distort={0.4}
          speed={2.0}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Cyan orbital ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.7, 0.014, 32, 128]} />
        <meshStandardMaterial
          color="#5EF7F0"
          emissive="#5EF7F0"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      {/* Purple orbital ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[2.0, 0.014, 32, 128]} />
        <meshStandardMaterial
          color="#A78BFA"
          emissive="#A78BFA"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      {/* White dim outer ring */}
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 3, 0]}>
        <torusGeometry args={[2.3, 0.010, 32, 128]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.0}
          opacity={0.3}
          transparent
          toneMapped={false}
        />
      </mesh>

      {/* Glow halo behind orb */}
      <mesh ref={glowRef} position={[0, 0, -0.5]}>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial
          color="#5EF7F0"
          emissive="#5EF7F0"
          emissiveIntensity={0.5}
          opacity={0.08}
          transparent
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export default function Hero3D() {
  return (
    // Full-bleed canvas over the hero section
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, 14], fov: 55 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <Suspense fallback={null}>
          {/* Lights */}
          <ambientLight intensity={0.1} />
          <directionalLight position={[6, 6, 4]} intensity={2.5} color="#5EF7F0" />
          <directionalLight position={[-6, -6, -4]} intensity={2.5} color="#A78BFA" />
          <pointLight position={[0, 0, 5]} intensity={1} color="#ffffff" />
          <pointLight position={[0, -3, 1]} intensity={2} color="#5EF7F0" />

          {/* Lighting environment */}
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={3} position={[0, 6, 0]} scale={[12, 12, 1]} rotation-x={Math.PI / 2} />
            <Lightformer form="rect" intensity={5} color="#5EF7F0" position={[-10, 0, 3]} scale={[10, 20, 1]} rotation-y={Math.PI / 4} />
            <Lightformer form="rect" intensity={5} color="#A78BFA" position={[10, 0, 3]} scale={[10, 20, 1]} rotation-y={-Math.PI / 4} />
          </Environment>

          {/* Star field */}
          <Sparkles count={400} scale={22} size={1.0} speed={0.2} opacity={0.4} color="#5EF7F0" />
          <Sparkles count={200} scale={28} size={1.5} speed={0.1} opacity={0.15} color="#A78BFA" />
          <Sparkles count={150} scale={16} size={0.7} speed={0.35} opacity={0.3} color="#ffffff" />

          <Scene />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.6}
            minPolarAngle={Math.PI / 2.4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
