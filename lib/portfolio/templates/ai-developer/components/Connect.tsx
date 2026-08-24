// @ts-nocheck
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Connect() {
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
    <section id="connect" className="section-pad py-24">
      <div className="grid md:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="hud mb-4">Let&apos;s Connect</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Always open to build.
          </h2>
          <p className="text-muted leading-relaxed max-w-sm mb-10">
            Always open to discussing new projects, ideas, or opportunities to
            collaborate on smarter tools. Feel free to shoot a message.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${contact.email}`}
              className="hud rounded-full border border-border px-4 py-2 hover:border-accent hover:text-accent transition-colors"
            >
              Email
            </a>
            {socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="hud rounded-full border border-border px-4 py-2 hover:border-accent hover:text-accent transition-colors"
              >
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
          <p className="hud mb-6 text-accent">Secure COM-LINK Terminal</p>

          {submitted ? (
            <p className="text-accent font-mono text-sm">
              Transmission received. I&apos;ll reply soon.
            </p>
          ) : (
            <div className="space-y-4">
              <Field label="Sender Name" />
              <Field label="Email Address" type="email" />
              <TextArea label="Transmission Details" />
              <button
                type="submit"
                className="w-full rounded-full bg-accent text-base hud font-medium py-3 mt-2 hover:opacity-90 transition-opacity"
              >
                Submit Message
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
      <span className="hud block mb-2">{label}</span>
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
      <span className="hud block mb-2">{label}</span>
      <textarea
        rows={4}
        className="w-full rounded-lg bg-surface2 border border-border px-4 py-2.5 text-sm text-ink focus:border-accent outline-none transition-colors resize-none"
      />
    </label>
  );
}
