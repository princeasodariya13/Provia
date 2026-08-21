"use client";
import React, { useRef } from "react";
import { useScroll, useMotionValueEvent, motion } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / (cardLength - 1 || 1));
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  // Framer Motion requires actual colors, not css variables for smooth interpolation
  // We use the Provia colors here directly
  const backgroundColors = [
    "#FFFFFF", // 1. background
    "#F5EFE8", // 2. surface-muted
    "#CC2936", // 3. brand (red)
    "#0EA5E9", // 4. sky blue
  ];

  const textColorsPrimary = [
    "#1A1A1A", // dark for 1
    "#1A1A1A", // dark for 2
    "#FFFFFF", // white for 3
    "#FFFFFF", // white for 4
  ];

  const textColorsSecondary = [
    "#6C6C6C", // gray for 1
    "#6C6C6C", // gray for 2
    "#FEE2E2", // light red for 3
    "#E0F2FE", // light blue for 4
  ];

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      transition={{ duration: 0.5 }}
      className="flex justify-center relative space-x-10 p-10 md:p-20 border border-border-light shadow-sm w-full transition-colors rounded-[2.5rem]"
      ref={ref}
    >
      <div className="relative flex items-start px-4 w-full md:w-1/2">
        <div className="max-w-xl w-full">
          {content.map((item, index) => (
            <div key={item.title + index} className="my-20 md:my-40">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                  color: textColorsPrimary[activeCard % textColorsPrimary.length],
                }}
                className="text-3xl md:text-5xl font-bold mb-6"
              >
                {item.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{
                  opacity: activeCard === index ? 1 : 0.3,
                  color: textColorsSecondary[activeCard % textColorsSecondary.length],
                }}
                className="text-lg leading-relaxed max-w-sm"
              >
                {item.description}
              </motion.p>
            </div>
          ))}
          <div className="h-10 md:h-20" />
        </div>
      </div>
      <div
        className={cn(
          "hidden lg:block h-96 w-96 rounded-2xl bg-white sticky top-40 overflow-hidden shadow-xl border border-border-strong",
          contentClassName
        )}
      >
        {content[activeCard].content ?? null}
      </div>
    </motion.div>
  );
};
