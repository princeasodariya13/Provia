// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      el!.style.setProperty("--x", `${e.clientX - rect.left}px`);
      el!.style.setProperty("--y", `${e.clientY - rect.top}px`);
    }

    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0 bg-glow pointer-events-none transition-[background] duration-300"
      style={{ ["--x" as string]: "50%", ["--y" as string]: "0%" }}
    />
  );
}
