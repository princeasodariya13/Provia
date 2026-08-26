// @ts-nocheck
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Connect() {
  const templateData = useTemplateData();
  const { profile = {}, email = "", social = [] } = (templateData as any) || {};
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="connect" className="section-pad py-28 relative overflow-hidden">
      {/* Glow from bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[radial-gradient(ellipse,rgba(56,189,248,0.06),transparent)] pointer-events-none" />

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="hud-accent mb-4"
        >
          // Open Communication
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4 text-ink"
        >
          Always open to build<span className="text-accent">_</span>
        </motion.h2>
        <p className="text-ink-dim text-lg max-w-lg mb-16 leading-relaxed">
          Discussing new projects, ideas, or opportunities to collaborate on smarter tools.
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: contact info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="ai-card p-7 mb-6">
              <div className="hud mb-2">Direct Line</div>
              <a
                href={email ? `mailto:${email}` : "#"}
                className="font-display text-xl font-bold text-accent hover:text-accent/80 transition-colors"
              >
                {email || "Reach out via social"}
              </a>
            </div>

            {social.length > 0 && (
              <div className="ai-card p-7">
                <div className="hud mb-4">Network</div>
                <div className="flex flex-wrap gap-3">
                  {(Array.isArray(social) ? social : []).map((s: any) => (
                    <a
                      key={s.url || s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ai-tag hover:border-accent/50 hover:text-accent transition-colors cursor-pointer"
                    >
                      {s.platform?.trim() || s.url?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right: contact form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="ai-card p-8"
          >
            <p className="hud-accent mb-6">// COM-LINK Terminal</p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8 text-center"
              >
                <div className="text-4xl mb-3 text-accent">✓</div>
                <p className="hud-accent">Transmission received.</p>
                <p className="text-ink-dim text-sm mt-2">Reply incoming within 24h.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <Field label="Sender Name" />
                <Field label="Email Address" type="email" />
                <TextArea label="Message" />
                <button
                  type="submit"
                  className="w-full rounded-full bg-accent text-[#02020A] hud font-bold py-3.5 mt-2 hover:bg-accent/90 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(56,189,248,0.3)]"
                >
                  Send Transmission →
                </button>
              </div>
            )}
          </motion.form>
        </div>
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
        className="w-full rounded-xl bg-surface2 border border-border px-4 py-3 text-sm text-ink outline-none focus:border-accent/60 transition-colors placeholder:text-muted"
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
        className="w-full rounded-xl bg-surface2 border border-border px-4 py-3 text-sm text-ink outline-none focus:border-accent/60 transition-colors resize-none placeholder:text-muted"
      />
    </label>
  );
}
