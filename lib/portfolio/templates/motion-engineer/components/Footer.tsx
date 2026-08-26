// @ts-nocheck
"use client";
import { useTemplateData } from "../context";

export default function Footer() {
  const templateData = useTemplateData();
  const { profile = {}, contact = {}, socials = [] } = (templateData as any) || {};
  const year = new Date().getFullYear();

  return (
    <footer className="section-pad py-14 border-t border-border relative overflow-hidden">
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-g1/40 to-transparent pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Brand */}
        <div>
          <div className="font-display text-2xl font-black mb-2">
            <span className="text-ink">{profile.name?.charAt(0) || "P"}</span>
            <span className="text-gradient">.</span>
          </div>
          <p className="text-muted text-sm">Built with passion & motion.</p>
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="text-ink-dim text-sm hover:text-gradient font-mono transition-colors mt-2 block"
            >
              {contact.email}
            </a>
          )}
        </div>

        {/* Socials */}
        {socials.length > 0 && (
          <div className="flex flex-wrap gap-4 items-center">
            {socials.map((s: any) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="eyebrow text-muted hover:text-ink transition-colors"
              >
                {s.label} ↗
              </a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div className="eyebrow text-muted self-end">
          © {year} {profile.name}
        </div>
      </div>
    </footer>
  );
}
