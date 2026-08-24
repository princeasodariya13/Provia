// @ts-nocheck
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Contact() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="section-pad py-24">
      <div className="grid md:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow mb-4">Contact</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-deep mb-6">
            Let&apos;s build something.
          </h2>
          <p className="text-muted leading-relaxed max-w-sm mb-8">
            Open to internships, freelance app builds, and backend contract
            work. Reach out and I&apos;ll get back within a day or two.
          </p>

          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${contact.email}`} className="eyebrow rounded-full border border-border bg-surface px-4 py-2 hover:border-accent transition-colors">
              Email
            </a>
            <a href={contact.githubUrl} className="eyebrow rounded-full border border-border bg-surface px-4 py-2 hover:border-accent transition-colors">
              GitHub
            </a>
            <a href={contact.linkedinUrl} className="eyebrow rounded-full border border-border bg-surface px-4 py-2 hover:border-accent transition-colors">
              LinkedIn
            </a>
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
            <p className="text-accent font-medium">Thanks — I&apos;ll be in touch soon.</p>
          ) : (
            <div className="space-y-4">
              <Field label="Name" />
              <Field label="Email" type="email" />
              <TextArea label="Message" />
              <button
                type="submit"
                className="w-full rounded-full bg-accent text-white py-3 text-sm font-medium hover:bg-deep transition-colors"
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
