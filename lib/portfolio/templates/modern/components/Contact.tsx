// @ts-nocheck
"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

export default function Contact() {
  const templateData = useTemplateData();
  const { profile = {}, socials = [] } = (templateData as any) || {};
  const [sent, setSent] = useState(false);

  const email = profile.email || "";

  const contactCards = [
    ...(email ? [{ label: "Email", value: email, href: `mailto:${email}` }] : []),
    ...(socials || []).map((s: any) => ({ label: s.platform?.trim() || "Social", value: s.platform?.trim() || s.url?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link", href: s.url })),
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section id="contact" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <SectionHeading index="06" label="Contact" title="Let's build something." />

        <div className="grid md:grid-cols-5 gap-12">

          {/* Left: cards */}
          <div className="md:col-span-2 space-y-3">
            <Reveal>
              <p className="text-muted leading-relaxed mb-6 text-base">
                Have a project, opportunity, or just want to say hi? Drop a message.
              </p>
            </Reveal>
            {contactCards.map((c: any, i: number) => (
              <Reveal key={c.label} delay={0.05 * i}>
                <a
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-3.5 hover:border-accent hover:bg-accent-light group transition-all"
                >
                  <span className="section-label text-muted">{c.label}</span>
                  <span className="text-sm font-medium text-ink group-hover:text-accent transition-colors truncate ml-4">{c.value}</span>
                </a>
              </Reveal>
            ))}
          </div>

          {/* Right: form */}
          <Reveal delay={0.12} className="md:col-span-3">
            <div className="mn-card p-8">
              {sent ? (
                <div className="py-8 text-center">
                  <div className="text-3xl mb-3">✓</div>
                  <p className="font-semibold text-ink mb-1">Message sent!</p>
                  <p className="text-muted text-sm">
                    {profile.name?.split(" ")[0] || "I"}&apos;ll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="section-label block mb-2">First name</label>
                      <input
                        required type="text"
                        className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-ink text-sm placeholder:text-muted outline-none focus:border-accent transition-colors"
                        placeholder="Jane"
                      />
                    </div>
                    <div>
                      <label className="section-label block mb-2">Last name</label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-ink text-sm placeholder:text-muted outline-none focus:border-accent transition-colors"
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="section-label block mb-2">Email</label>
                    <input
                      required type="email"
                      className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-ink text-sm placeholder:text-muted outline-none focus:border-accent transition-colors"
                      placeholder="jane@company.com"
                    />
                  </div>
                  <div>
                    <label className="section-label block mb-2">Message</label>
                    <textarea
                      required rows={4}
                      className="w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-ink text-sm placeholder:text-muted outline-none focus:border-accent transition-colors resize-none"
                      placeholder="Tell me about your project..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-accent text-white font-semibold text-sm px-6 py-3 hover:bg-accent/90 transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    Send Message <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
