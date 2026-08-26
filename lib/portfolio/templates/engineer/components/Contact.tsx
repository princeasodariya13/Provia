// @ts-nocheck
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTemplateData } from "../context";

export default function Contact() {
  const templateData = useTemplateData();
  const { contact = {}, profile = {}, socials = [] } = (templateData as any) || {};
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="section-pad py-28 border-t border-border relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(200,255,0,0.04),transparent)] pointer-events-none" />

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="eyebrow mb-5"
        >
          [07] Contact
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-5xl md:text-6xl font-black tracking-tight mb-4"
        >
          Let&apos;s talk<span className="text-accent">.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted text-lg max-w-lg mb-16"
        >
          Direct line, no account manager in between. I&apos;ll reply within one business day with concrete next steps.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left: contact info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {contact.email && (
              <ContactRow label="Email" value={contact.email} href={`mailto:${contact.email}`} />
            )}
            {contact.phone && (
              <ContactRow label="Phone" value={contact.phone} href={`tel:${contact.phone.replace(/\s/g,"")}`} />
            )}
            {contact.base && (
              <ContactRow label="Based in" value={contact.base} />
            )}
            <ContactRow label="Response time" value={contact.reply || "Within 24 hours"} />

            {socials.length > 0 && (
              <div className="pt-4">
                <div className="eyebrow mb-3">Socials</div>
                <div className="flex flex-wrap gap-3">
                  {socials.map((s: any) => (
                    <a
                      key={s.href}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 tag-pill hover:border-accent/50 hover:text-accent transition-colors"
                    >
                      {s.label?.trim() || s.href?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"} ↗
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
            className="glass-card p-8"
          >
            <h3 className="font-display text-xl font-black mb-6 tracking-tight">
              Send a brief
            </h3>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8 text-center"
              >
                <div className="text-4xl mb-4">✓</div>
                <p className="text-accent font-mono-custom text-sm">
                  Message received. I&apos;ll be in touch soon.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First name *" />
                  <Field label="Last name *" />
                </div>
                <Field label="Email *" type="email" />
                <Field label="Company (optional)" />
                <TextArea label="Message" />
                <button
                  type="submit"
                  className="w-full rounded-full bg-accent text-[#050507] font-semibold font-mono-custom text-sm py-3.5 mt-2 hover:bg-accent/90 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(200,255,0,0.25)]"
                >
                  Send request →
                </button>
              </div>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border">
      <dt className="eyebrow">{label}</dt>
      <dd className="font-mono-custom text-sm text-ink">
        {href ? (
          <a href={href} className="hover:text-accent transition-colors">
            {value}
          </a>
        ) : value}
      </dd>
    </div>
  );
}

function Field({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
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
      <span className="eyebrow block mb-2">{label}</span>
      <textarea
        rows={4}
        className="w-full rounded-xl bg-surface2 border border-border px-4 py-3 text-sm text-ink outline-none focus:border-accent/60 transition-colors resize-none placeholder:text-muted"
      />
    </label>
  );
}
