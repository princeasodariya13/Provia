"use client";
import { cn } from "@/lib/utils";
import React from "react";
import dynamic from "next/dynamic";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import {
  IconBoxAlignRightFilled,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { motion } from "motion/react";

export function FeaturesBento() {
  return (
    <BentoGrid className="max-w-6xl mx-auto md:auto-rows-[22rem]">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={item.className}
          icon={item.icon}
        />
      ))}
    </BentoGrid>
  );
}

const SkeletonOne = () => {
  const variants = {
    initial: { x: 0 },
    animate: { x: 10, rotate: 2, transition: { duration: 0.2 } },
  };
  const variantsSecond = {
    initial: { x: 0 },
    animate: { x: -10, rotate: -2, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] bg-surface-muted rounded-lg flex-col space-y-3 p-4 justify-center"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-border-light p-2 items-center space-x-2 bg-background shadow-sm"
      >
        <div className="h-6 w-6 rounded-full bg-brand shrink-0" />
        <div className="w-full bg-surface-muted h-4 rounded-full" />
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-border-light p-2 items-center space-x-2 w-3/4 ml-auto bg-background shadow-sm"
      >
        <div className="w-full bg-surface-muted h-4 rounded-full" />
        <div className="h-6 w-6 rounded-full bg-accent shrink-0" />
      </motion.div>
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-border-light p-2 items-center space-x-2 bg-background shadow-sm"
      >
        <div className="h-6 w-6 rounded-full bg-taupe shrink-0" />
        <div className="w-full bg-surface-muted h-4 rounded-full" />
      </motion.div>
    </motion.div>
  );
};

const SkeletonTwo = () => {
  const variants = {
    initial: { width: 0 },
    animate: { width: "100%", transition: { duration: 0.2 } },
    hover: { width: ["0%", "100%"], transition: { duration: 2 } },
  };
  const arr = new Array(6).fill(0);
  const widths = ["60%", "85%", "45%", "90%", "70%", "50%"];
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] bg-surface-muted rounded-lg flex-col space-y-2 p-6 justify-center"
    >
      {arr.map((_, i) => (
        <motion.div
          key={"skeleton-two" + i}
          variants={variants}
          style={{ maxWidth: widths[i % widths.length] }}
          className="flex flex-row rounded-full border border-border-light p-2 items-center space-x-2 bg-background w-full h-4"
        ></motion.div>
      ))}
    </motion.div>
  );
};

const SkeletonThree = () => {
  const variants = {
    initial: { backgroundPosition: "0 50%" },
    animate: { backgroundPosition: ["0, 50%", "100% 50%", "0 50%"] },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
      className="flex flex-1 w-full h-full min-h-[6rem] rounded-lg flex-col space-y-2 relative overflow-hidden"
      style={{
        background: "linear-gradient(-45deg, #CC2936, #080708, #EBF5EE, #283044)",
        backgroundSize: "400% 400%",
      }}
    >
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
      <motion.div className="h-full w-full rounded-lg flex items-center justify-center relative z-10">
        <span className="text-white font-bold text-xl tracking-widest uppercase mix-blend-overlay">Provia UI</span>
      </motion.div>
    </motion.div>
  );
};

const SkeletonFour = () => {
  const first = {
    initial: { x: 20, rotate: -5 },
    hover: { x: 0, rotate: 0 },
  };
  const second = {
    initial: { x: -20, rotate: 5 },
    hover: { x: 0, rotate: 0 },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] bg-surface-muted rounded-lg flex-row space-x-2 p-4 items-center justify-center overflow-hidden"
    >
      <motion.div
        variants={first}
        className="h-[80%] w-1/3 rounded-2xl bg-background p-4 border border-border-light flex flex-col items-center justify-center shadow-sm"
      >
        <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center mb-3">
          <IconClipboardCopy className="w-5 h-5 text-white" />
        </div>
        <p className="sm:text-sm text-xs text-center font-bold text-text-primary">
          Resume Parser
        </p>
        <p className="bg-brand-muted text-brand text-[10px] font-bold rounded-full px-2 py-0.5 mt-2 uppercase">
          AI Engine
        </p>
      </motion.div>
      <motion.div className="h-full relative z-20 w-1/3 rounded-2xl bg-background p-4 border border-border-light flex flex-col items-center justify-center shadow-md">
        <div className="w-12 h-12 rounded-full bg-text-primary flex items-center justify-center mb-4">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </div>
        <p className="sm:text-sm text-xs text-center font-bold text-text-primary">
          GitHub Integration
        </p>
        <p className="bg-success-muted text-success text-[10px] font-bold rounded-full px-2 py-0.5 mt-2 uppercase">
          Synced
        </p>
      </motion.div>
      <motion.div
        variants={second}
        className="h-[80%] w-1/3 rounded-2xl bg-background p-4 border border-border-light flex flex-col items-center justify-center shadow-sm"
      >
        <div className="w-10 h-10 rounded-full bg-[#0077b5] flex items-center justify-center mb-3">
          <IconSignature className="w-5 h-5 text-white" />
        </div>
        <p className="sm:text-sm text-xs text-center font-bold text-text-primary">
          LinkedIn Data
        </p>
        <p className="bg-success-muted text-success text-[10px] font-bold rounded-full px-2 py-0.5 mt-2 uppercase">
          Synced
        </p>
      </motion.div>
    </motion.div>
  );
};

const SkeletonFive = () => {
  const variants = {
    initial: { x: 0 },
    animate: { x: 10, rotate: 5, transition: { duration: 0.2 } },
  };
  const variantsSecond = {
    initial: { x: 0 },
    animate: { x: -10, rotate: -5, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] bg-surface-muted rounded-lg flex-col space-y-2 p-4 justify-center"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-2xl border border-border-light p-3 items-start space-x-3 bg-background shadow-sm"
      >
        <div className="h-8 w-8 rounded bg-taupe shrink-0" />
        <p className="text-xs text-text-secondary leading-relaxed">
          Generate a fully responsive, editorial-grade web portfolio in exactly one click based on your synced profile.
        </p>
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-border-light p-2 items-center justify-end space-x-2 w-3/4 ml-auto bg-background shadow-sm"
      >
        <p className="text-xs font-bold text-text-primary">Public Link Ready.</p>
        <div className="h-6 w-6 rounded-full bg-brand shrink-0" />
      </motion.div>
    </motion.div>
  );
};


const World = dynamic(() => import("../ui/globe").then((m) => m.World), {
  ssr: false,
});

const SkeletonGlobe = () => {
  const globeConfig = {
    pointSize: 4,
    globeColor: "#1a1a1a",
    showAtmosphere: true,
    atmosphereColor: "#ffffff",
    atmosphereAltitude: 0.1,
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.7)",
    ambientLight: "#ffffff",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    autoRotate: true,
    autoRotateSpeed: 0.5,
  };
  const colors = ["#06b6d4", "#3b82f6", "#6366f1"];
  const sampleArcs = [
    {
      order: 1,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -22.9068,
      endLng: -43.1729,
      arcAlt: 0.1,
      color: colors[0],
    },
    {
      order: 2,
      startLat: 51.5072,
      startLng: -0.1276,
      endLat: 3.139,
      endLng: 101.6869,
      arcAlt: 0.3,
      color: colors[1],
    },
    {
      order: 3,
      startLat: 40.7128,
      startLng: -74.006,
      endLat: 51.5072,
      endLng: -0.1276,
      arcAlt: 0.3,
      color: colors[2],
    },
    {
      order: 4,
      startLat: 35.6762,
      startLng: 139.6503,
      endLat: -33.8688,
      endLng: 151.2093,
      arcAlt: 0.2,
      color: colors[0],
    }
  ];

  return (
    <div className="flex flex-1 w-full h-full min-h-[12rem] bg-surface-muted rounded-lg flex-col overflow-hidden relative">
      <div className="absolute w-full bottom-0 inset-x-0 h-24 bg-gradient-to-b pointer-events-none select-none from-transparent to-surface-muted z-40" />
      <div className="absolute w-full h-full md:h-[150%] -bottom-10 md:-bottom-16 z-10">
        <World data={sampleArcs} globeConfig={globeConfig} />
      </div>
    </div>
  );
};

const items = [
  {
    title: "AI Resume Extraction",
    description: (
      <span className="text-sm">
        Upload your existing PDF and let our AI instantly map your career history.
      </span>
    ),
    header: <SkeletonOne />,
    className: "md:col-span-1",
    icon: <IconClipboardCopy className="h-4 w-4 text-brand" />,
  },
  {
    title: "Automated Synchronization",
    description: (
      <span className="text-sm">
        Keep your portfolio up-to-date automatically by connecting your repositories.
      </span>
    ),
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    icon: <IconFileBroken className="h-4 w-4 text-brand" />,
  },
  {
    title: "Editorial Templates",
    description: (
      <span className="text-sm">
        Stop using generic templates. Switch to typography-first professional designs.
      </span>
    ),
    header: <SkeletonThree />,
    className: "md:col-span-1",
    icon: <IconSignature className="h-4 w-4 text-brand" />,
  },
  {
    title: "Unified Professional Identity",
    description: (
      <span className="text-sm">
        Bring your GitHub commits, LinkedIn history, and Resume into one cohesive command center.
      </span>
    ),
    header: <SkeletonFour />,
    className: "md:col-span-2",
    icon: <IconTableColumn className="h-4 w-4 text-brand" />,
  },
  {
    title: "Global Reach",
    description: (
      <span className="text-sm">
        Share your portfolio everywhere. Stand out to global recruiters instantly.
      </span>
    ),
    header: <SkeletonGlobe />,
    className: "md:col-span-1",
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-brand" />,
  },
  {
    title: "One-Click Publishing",
    description: (
      <span className="text-sm">
        Instantly deploy your portfolio to the public web with a custom Provia slug, ready to impress.
      </span>
    ),
    header: <SkeletonFive />,
    className: "md:col-span-3",
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-brand" />,
  },
];
