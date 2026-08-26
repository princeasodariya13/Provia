// @ts-nocheck
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";
import MagneticButton from "./MagneticButton";

export default function Contact() {
  const templateData = useTemplateData();
  const { profile = {}, contact = {}, socials = [] } = (templateData as any) || {};
  const [submitted, setSubmitted] = useState(false);

  const email = contact.email || profile.email || "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="section-pad py-28 border-t border-border relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient1 opacity-[0.10] blur-[130px] pointer-events-none" />
      <div className="absolute top-[10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-gradient2 opacity-[0.07] blur-[110px] pointer-events-none" />

      <div className="relative z-10 grid md:grid-cols-2 gap-16 items-start">

        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="eyebrow mb-5">Contact</p>
          <h2 className="font-display font-black tracking-tight leading-[0.95] mb-8 text-ink"
            style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)" }}
          >
            Let&apos;s build something <span className="text-gradient">fast.</span>
          </h2>

          {email && (
            <MagneticButton
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand text-white font-semibold text-sm px-7 py-3.5 mb-8 hover:shadow-[0_8px_30px_rgba(124,92,255,0.4)] transition-all hover:-translate-y-0.5"
            >
              {email}
            </MagneticButton>
          )}

          {socials.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6">
              {socials.map((s: any) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="me-tag hover:border-accent/50 hover:text-accent transition-colors"
                >
                  {s.label?.trim() || s.href?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"} ↗
                </a>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right: form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="me-card p-8"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-8 text-center"
            >
              <div className="text-4xl mb-3 text-gradient">✓</div>
              <p className="text-ink font-semibold">Got it!</p>
              <p className="text-ink-dim text-sm mt-2">I&apos;ll reply within a day or two.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-display text-xl font-black text-ink mb-6">Send a note</h3>
              <Field label="Name" />
              <Field label="Email" type="email" />
              <TextArea label="Project details" />
              <button
                type="submit"
                className="w-full rounded-full bg-gradient-brand text-white font-semibold text-sm py-3.5 mt-2 hover:shadow-[0_6px_24px_rgba(124,92,255,0.35)] transition-all hover:-translate-y-0.5"
              >
                Send message →
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
        className="w-full rounded-xl bg-surface2 border border-border px-4 py-3 text-sm text-ink outline-none focus:border-g1/50 transition-colors placeholder:text-muted"
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
        className="w-full rounded-xl bg-surface2 border border-border px-4 py-3 text-sm text-ink outline-none focus:border-g1/50 transition-colors resize-none placeholder:text-muted"
      />
    </label>
  );
}
