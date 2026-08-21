"use client";
import React from "react";
import { ContainerScroll } from "../ui/container-scroll-animation";
import { motion } from "motion/react";

export function HeroScroll() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <motion.h1
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="text-4xl md:text-[3.5rem] font-bold text-text-primary mb-0 tracking-tight text-center leading-[1.1]"
            >
              A command center for your <br />
              <span className="text-[5rem] md:text-[8rem] font-black mt-0 leading-none text-brand inline-block">
                Career
              </span>
            </motion.h1>
          </>
        }
      >
        <img
          src="/dashboard-mockup.png"
          alt="Provia Dashboard Interface"
          className="mx-auto rounded-2xl object-cover h-full object-left-top"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
