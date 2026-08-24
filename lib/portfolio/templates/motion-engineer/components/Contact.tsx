// @ts-nocheck
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import MagneticButton from "./MagneticButton";

export default function Contact() {
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

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="section-pad py-28 relative overflow-hidden">
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[420px] h-[420px] rounded-full bg-gradient1 opacity-[0.12] blur-[110px] pointer-events-none"
        aria-hidden
      />

      <div className="relative grid md:grid-cols-2 gap-16 items-end">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow mb-4">Contact</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Let&apos;s build<br />something <span className="text-gradient">fast.</span>
          </h2>

          <MagneticButton
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient1 px-7 py-3.5 font-medium text-sm text-white"
          >
            {profile.email}
          </MagneticButton>

          <div className="flex gap-5 mt-8">
            {socials.map((s) => (
              <a key={s.href} href={s.href} className="eyebrow hover:text-accent transition-colors">
                {s.label}
              </a>
            ))}
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-border bg-surface p-8"
        >
          {submitted ? (
            <p className="text-accent font-medium">
              Got it — I&apos;ll reply within a day or two.
            </p>
          ) : (
            <div className="space-y-4">
              <Field label="Name" />
              <Field label="Email" type="email" />
              <TextArea label="Project details" />
              <button
                type="submit"
                className="w-full rounded-full bg-ink text-base py-3 font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Send message
              </button>
            </div>
          )}
        </motion.form>
      </div>
    </section>
  );
}

function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      <input
        type={type}
        className="w-full rounded-lg bg-surface2 border border-border px-4 py-2.5 text-sm text-ink focus:border-accent outline-none transition-colors"
      />
    </label>
  );
}

function TextArea({ label }: { label: string }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      <textarea
        rows={4}
        className="w-full rounded-lg bg-surface2 border border-border px-4 py-2.5 text-sm text-ink focus:border-accent outline-none transition-colors resize-none"
      />
    </label>
  );
}
