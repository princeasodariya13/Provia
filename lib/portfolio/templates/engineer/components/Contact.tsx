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
    <section id="contact" className="section-pad py-24 border-t border-border">
      <div className="grid md:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow mb-4">[06] Contact</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Let&apos;s talk.
          </h2>
          <p className="text-muted leading-relaxed max-w-sm mb-10">
            Direct line, no account manager in between. Tell me about your
            project and I&apos;ll reply within a day with concrete next steps.
          </p>

          <dl className="space-y-6">
            <Row label="Email" value={contact.email} href={`mailto:${contact.email}`} />
            <Row label="Phone" value={contact.phone} href={`tel:${contact.phone.replace(/\s/g, "")}`} />
            <Row label="Base" value={contact.base} />
            <Row label="Response" value={contact.reply} />
          </dl>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl border border-border bg-surface p-8"
        >
          <h3 className="font-display text-xl font-semibold mb-6">
            Send a short briefing.
          </h3>

          {submitted ? (
            <p className="text-accent font-mono text-sm">
              Thanks — that&apos;s in. I&apos;ll be in touch soon.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First name *" />
                <Field label="Last name *" />
              </div>
              <Field label="Email *" type="email" />
              <Field label="Company (optional)" />
              <TextArea label="Message (optional)" />
              <button
                type="submit"
                className="w-full rounded-full bg-accent text-base font-mono text-sm font-medium py-3 mt-2 hover:opacity-90 transition-opacity"
              >
                Send request →
              </button>
            </div>
          )}
        </motion.form>
      </div>
    </section>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = href ? (
    <a href={href} className="hover:text-accent transition-colors">
      {value}
    </a>
  ) : (
    value
  );
  return (
    <div className="flex items-center justify-between border-b border-border pb-3">
      <dt className="eyebrow">{label}</dt>
      <dd className="font-mono text-sm text-ink">{content}</dd>
    </div>
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
        rows={3}
        className="w-full rounded-lg bg-surface2 border border-border px-4 py-2.5 text-sm text-ink focus:border-accent outline-none transition-colors resize-none"
      />
    </label>
  );
}
