// @ts-nocheck
"use client";

import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import AnimatedCounter from "./AnimatedCounter";

export default function GithubActivity() {
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

  const githubStats = { contributions: 0, longestStreak: 0, publicRepos: 0 };

  return (
    <section className="section-pad py-24 border-b border-border">
      <p className="hud mb-4">Live Activity</p>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-14">
        Code activity.
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-surface p-8"
        >
          <div className="font-display text-4xl font-bold text-accent">
            <AnimatedCounter value={githubStats.contributions} />
          </div>
          <p className="hud mt-3">Total Contributions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-border bg-surface p-8"
        >
          <div className="font-display text-4xl font-bold text-accent">
            {githubStats.longestStreak}
          </div>
          <p className="hud mt-3">Longest Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-border bg-surface p-8"
        >
          <div className="font-display text-4xl font-bold text-accent">
            <AnimatedCounter value={githubStats.publicRepos} />
          </div>
          <p className="hud mt-3">Public Repos</p>
        </motion.div>
      </div>
    </section>
  );
}
