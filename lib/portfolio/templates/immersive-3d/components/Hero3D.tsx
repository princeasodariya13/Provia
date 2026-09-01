// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";

export default function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      const W = parent ? parent.offsetWidth : window.innerWidth;
      const H = parent ? parent.offsetHeight : window.innerHeight;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Star field
    const stars: { x: number; y: number; r: number; op: number; twinkle: number }[] = [];
    for (let i = 0; i < 280; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() * 1.1 + 0.2,
        op: Math.random() * 0.5 + 0.1,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const cx = W / 2;
      const cy = H / 2;
      const minDim = Math.min(W, H);

      ctx.clearRect(0, 0, W, H);

      // ── Deep space bg ─────────────────────────────────────
      const bg = ctx.createRadialGradient(cx, cy * 0.9, 0, cx, cy, Math.max(W, H) * 0.75);
      bg.addColorStop(0, "rgba(12, 6, 40, 0.7)");
      bg.addColorStop(0.45, "rgba(5, 5, 18, 0.5)");
      bg.addColorStop(1, "rgba(5, 5, 8, 0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Stars ──────────────────────────────────────────────
      t += 0.009;
      stars.forEach((s) => {
        const twinkle = 0.6 + 0.4 * Math.sin(t * 1.5 + s.twinkle);
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.op * twinkle})`;
        ctx.fill();
      });

      // ── Outer ambient glow ─────────────────────────────────
      const ambR = minDim * 0.52;
      const amb = ctx.createRadialGradient(cx, cy, 0, cx, cy, ambR);
      amb.addColorStop(0, "rgba(94, 247, 240, 0.06)");
      amb.addColorStop(0.5, "rgba(167, 139, 250, 0.04)");
      amb.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = amb;
      ctx.beginPath();
      ctx.arc(cx, cy, ambR, 0, Math.PI * 2);
      ctx.fill();

      // ── Orbital Rings (4 rings, proper 3D tilt) ────────────
      const rings = [
        { baseR: minDim * 0.28, tiltPhase: 0.0,  speedMul: 1.00, color: "#5EF7F0", glow: "#5EF7F0", lw: 2.0, alpha: 0.90 },
        { baseR: minDim * 0.36, tiltPhase: 1.57,  speedMul: -0.72, color: "#A78BFA", glow: "#A78BFA", lw: 2.0, alpha: 0.80 },
        { baseR: minDim * 0.44, tiltPhase: 0.8,  speedMul: 0.48, color: "#ffffff",  glow: "#8080ff", lw: 1.2, alpha: 0.30 },
        { baseR: minDim * 0.50, tiltPhase: 2.3,  speedMul: -0.30, color: "#5EF7F0", glow: "#5EF7F0", lw: 0.8, alpha: 0.12 },
      ];

      rings.forEach(({ baseR, tiltPhase, speedMul, color, glow, lw, alpha }, ri) => {
        // 3D tilt: rings slowly rock on different axes
        const tilt = Math.sin(t * 0.22 + tiltPhase) * 0.72;
        const scaleY = Math.abs(Math.cos(tilt));
        const rot = t * 0.18 * speedMul + ri * 0.4;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.scale(1, scaleY < 0.08 ? 0.08 : scaleY);

        // Glow pass
        ctx.beginPath();
        ctx.ellipse(0, 0, baseR, baseR, 0, 0, Math.PI * 2);
        ctx.strokeStyle = glow;
        ctx.globalAlpha = alpha * 0.45;
        ctx.lineWidth = lw + 8;
        ctx.shadowColor = glow;
        ctx.shadowBlur = 28;
        ctx.stroke();

        // Core ring
        ctx.beginPath();
        ctx.ellipse(0, 0, baseR, baseR, 0, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = lw;
        ctx.shadowColor = glow;
        ctx.shadowBlur = 18;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();
        ctx.globalAlpha = 1;
      });

      // ── Orbiting satellite dots ────────────────────────────
      const dots = [
        { ringR: minDim * 0.28, speed: 0.22,  phase: 0,    color: "#5EF7F0", size: 4.5 },
        { ringR: minDim * 0.36, speed: -0.16, phase: 2.1,  color: "#A78BFA", size: 3.5 },
        { ringR: minDim * 0.28, speed: 0.22,  phase: Math.PI, color: "#ffffff", size: 2.5 },
      ];
      dots.forEach(({ ringR, speed, phase, color, size }) => {
        const angle = t * speed + phase;
        const tilt = Math.sin(t * 0.22) * 0.72;
        const scaleY = Math.abs(Math.cos(tilt));
        const dx = cx + Math.cos(angle) * ringR;
        const dy = cy + Math.sin(angle) * ringR * (scaleY < 0.08 ? 0.08 : scaleY);
        ctx.beginPath();
        ctx.arc(dx, dy, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── Central Orb ────────────────────────────────────────
      const orbR = minDim * 0.115;
      const orbPulse = orbR * (1 + Math.sin(t * 1.1) * 0.025);

      // Deep outer halo
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR * 3.2);
      halo.addColorStop(0, "rgba(94, 247, 240, 0.22)");
      halo.addColorStop(0.35, "rgba(167, 139, 250, 0.14)");
      halo.addColorStop(0.7, "rgba(94, 247, 240, 0.04)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, orbR * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Mid glow ring
      const midGlow = ctx.createRadialGradient(cx, cy, orbR * 0.6, cx, cy, orbR * 2);
      midGlow.addColorStop(0, "rgba(94, 247, 240, 0.28)");
      midGlow.addColorStop(0.5, "rgba(167, 139, 250, 0.18)");
      midGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = midGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, orbR * 2, 0, Math.PI * 2);
      ctx.fill();

      // Orb body — deep dark metallic
      const orbGrad = ctx.createRadialGradient(
        cx - orbR * 0.28, cy - orbR * 0.28, 0,
        cx, cy, orbPulse
      );
      orbGrad.addColorStop(0, "rgba(60, 140, 160, 0.55)");
      orbGrad.addColorStop(0.25, "rgba(20, 40, 90, 0.85)");
      orbGrad.addColorStop(0.6, "rgba(8, 10, 35, 0.95)");
      orbGrad.addColorStop(1, "rgba(5, 5, 15, 1.0)");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, orbPulse, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight (top-left)
      const spec = ctx.createRadialGradient(
        cx - orbR * 0.38, cy - orbR * 0.38, 0,
        cx - orbR * 0.22, cy - orbR * 0.22, orbR * 0.6
      );
      spec.addColorStop(0, "rgba(255,255,255,0.55)");
      spec.addColorStop(0.5, "rgba(255,255,255,0.10)");
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(cx, cy, orbPulse, 0, Math.PI * 2);
      ctx.fill();

      // Cyan rim light (bottom-right edge of orb)
      const rimLight = ctx.createRadialGradient(
        cx + orbR * 0.5, cy + orbR * 0.4, orbR * 0.5,
        cx + orbR * 0.5, cy + orbR * 0.4, orbR * 1.1
      );
      rimLight.addColorStop(0, "rgba(94, 247, 240, 0.3)");
      rimLight.addColorStop(1, "rgba(94, 247, 240, 0)");
      ctx.fillStyle = rimLight;
      ctx.beginPath();
      ctx.arc(cx, cy, orbPulse, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
