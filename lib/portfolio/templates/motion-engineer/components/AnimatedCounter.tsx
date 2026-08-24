// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";
import { useInView, animate } from "framer-motion";

export default function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!isInView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        node.textContent = Math.round(latest).toString();
      },
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span className="inline-flex items-baseline">
      <span ref={ref}>0</span>
      <span>{suffix}</span>
    </span>
  );
}
