"use client";

import React from "react";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";

export function Testimonials() {
  return (
    <div className="py-14 md:py-20 flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <div className="text-center mb-8 md:mb-10 max-w-2xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-text-primary tracking-tight mb-3 md:mb-4">
          Trusted by Professionals
        </h2>
        <p className="text-text-secondary text-sm md:text-base">
          See what top engineers, designers, and creators are saying about their new cohesive professional identity.
        </p>
      </div>
      <div className="w-full flex flex-col antialiased items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </div>
    </div>
  );
}

const testimonials = [
  {
    quote:
      "Provia transformed my scattered GitHub commits and LinkedIn history into a cohesive, stunning portfolio in literally one click. The editorial templates are genuinely unmatched.",
    name: "Rahul Sharma",
    title: "Senior Frontend Engineer",
  },
  {
    quote:
      "The AI resume extraction is flawless. I uploaded my outdated PDF, and Provia perfectly mapped my career history and generated a gorgeous, typography-first web presence.",
    name: "Priya Patel",
    title: "Product Designer",
  },
  {
    quote:
      "I used to spend days tweaking my personal site. Now, my repositories sync automatically, and my portfolio is always up-to-date with my latest projects. Pure magic.",
    name: "Vikram Singh",
    title: "Full Stack Developer",
  },
  {
    quote:
      "Stand out to recruiters instantly? Absolutely. The Global Reach feature and custom Provia slug gave me the professional edge I needed to land my dream role.",
    name: "Anjali Desai",
    title: "Data Scientist",
  },
  {
    quote:
      "Finally, a platform that understands that a professional portfolio needs to look like a high-end editorial magazine, not just a generic template. Incredible aesthetic.",
    name: "Rohan Gupta",
    title: "UI/UX Architect",
  },
];
