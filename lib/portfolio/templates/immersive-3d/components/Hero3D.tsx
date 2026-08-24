// @ts-nocheck
"use client";

import { Suspense, useRef } from "react";
import { useTemplateData } from "../context";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

function FloatingShape() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <MeshDistortMaterial
          color="#5EF7F0"
          emissive="#A78BFA"
          emissiveIntensity={0.25}
          roughness={0.15}
          metalness={0.7}
          distort={0.35}
          speed={1.8}
        />
      </mesh>
    </Float>
  );
}

export default function Hero3D() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { 
  contact = {},
  profile = {},
  marqueeItems = [],
  certifications = [],
  header = {},
  social = {},
  services = [],
  faq = [],
  milestones = [],
  globals = {},
  steps = [],
  about = {},
  experience = [],
  projects = [],
  skills = [],
  stats = [],
  stack = [],
  capabilities = [],
  education = []
 } = templateData || {};

  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 1.8]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1.4} color="#5EF7F0" />
          <pointLight position={[-5, -3, -5]} intensity={1} color="#A78BFA" />
          <Stars radius={60} depth={30} count={2000} factor={2} fade speed={0.6} />
          <FloatingShape />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.6}
            maxPolarAngle={Math.PI / 1.6}
            minPolarAngle={Math.PI / 2.6}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
