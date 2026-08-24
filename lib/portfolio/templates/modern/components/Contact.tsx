// @ts-nocheck
"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useTemplateData } from "../context";
import { Reveal, SectionHeading } from "./Reveal";

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

  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Wire this up to your form handler / API route of choice
    // (e.g. Formspree, Resend, or a custom /api/contact route).
    setSent(true);
  }

  return (
    <section id="contact" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading index="06" label="Contact" title="Let's build something." />

        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2 space-y-3">
            <Reveal>
              <p className="text-muted leading-relaxed mb-6">
                Have a project, opportunity, or just want to say hi? Drop a message below.
              </p>
            </Reveal>
            {contactCards.map((c, i) => (
              <Reveal key={c.label} delay={0.05 * i}>
                <a
                  href={c.href}
                  className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3 hover:border-accent transition-colors"
                >
                  <span className="section-label !text-muted">{c.label}</span>
                  <span className="text-sm text-ink truncate ml-4">{c.value}</span>
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15} className="md:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="section-label !text-muted block mb-2">Name</label>
                <input
                  required
                  type="text"
                  className="w-full rounded-xl border border-border bg-card/60 px-4 py-3 text-ink placeholder:text-muted/60 focus:border-accent outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="section-label !text-muted block mb-2">Email</label>
                <input
                  required
                  type="email"
                  className="w-full rounded-xl border border-border bg-card/60 px-4 py-3 text-ink placeholder:text-muted/60 focus:border-accent outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="section-label !text-muted block mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-xl border border-border bg-card/60 px-4 py-3 text-ink placeholder:text-muted/60 focus:border-accent outline-none transition-colors resize-none"
                  placeholder={`I'll receive it straight in my inbox.`}
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-accent text-base px-6 py-3 text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                {sent ? "Message sent" : "Send Message"}
                <Send size={16} />
              </button>
              {sent && (
                <p className="text-sm text-accent">
                  Thanks — {profile.name.split(" ")[0]} will get back to you soon.
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
