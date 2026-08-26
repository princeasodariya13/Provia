// @ts-nocheck
"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/toast";
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
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message")
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setSent(true);
        e.currentTarget.reset();
        toast.success("Message sent successfully!");
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="py-28 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeading eyebrow="05 // Contact" title="Let's build something." />

        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2 space-y-3">
            <Reveal>
              <p className="text-muted leading-relaxed mb-6">
                Have a project, opportunity, or just want to say hi? Drop a message below.
              </p>
            </Reveal>
            {(social || []).map((c: any, i: number) => (
              <Reveal key={c.label} delay={0.05 * i}>
                <motion.a
                  whileHover={{ x: 10, backgroundColor: "rgba(94, 247, 240, 0.05)" }}
                  href={c.href}
                  className="flex items-center justify-between glass rounded-xl px-4 py-3 border border-transparent hover:border-cyan/50 transition-colors"
                >
                  <span className="eyebrow">{c.label?.trim() || c.platform?.trim() || c.url?.trim().replace(/^https?:\/\//, '').split('/')[0] || c.href?.trim().replace(/^https?:\/\//, '').split('/')[0] || "Link"}</span>
                </motion.a>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15} className="md:col-span-3">
            <motion.form 
              whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -10px rgba(167, 139, 250, 0.1)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onSubmit={handleSubmit} 
              className="glass rounded-2xl p-8 space-y-4 hover:border-purple-500/20 transition-colors duration-500"
            >
              <div>
                <label className="eyebrow block mb-2">Name</label>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-ink placeholder:text-muted/60 focus:border-cyan outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="eyebrow block mb-2">Email</label>
                <input
                  required
                  name="email"
                  type="email"
                  className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-ink placeholder:text-muted/60 focus:border-cyan outline-none transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="eyebrow block mb-2">Message</label>
                <textarea
                  required
                  name="message"
                  rows={4}
                  className="w-full rounded-xl border border-border bg-transparent px-4 py-3 text-ink placeholder:text-muted/60 focus:border-cyan outline-none transition-colors resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-cyan text-base px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Sending..." : sent ? "Message sent" : "Send Message"}
                <Send size={16} />
              </button>
              {sent && (
                <p className="text-sm text-cyan">
                  Thanks — {profile.name.split(" ")[0]} will get back to you soon.
                </p>
              )}
            </motion.form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
