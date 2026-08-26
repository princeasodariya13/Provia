// @ts-nocheck
"use client";
import { useTemplateData } from "../context";

export default function Footer() {
  const templateData = useTemplateData();
  const { profile = {}, socials = [], contact = {} } = (templateData as any) || {};
  const year = new Date().getFullYear();

  return (
    <footer className="section-pad py-16 border-t border-border relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[radial-gradient(ellipse,rgba(200,255,0,0.04),transparent)] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between gap-12">
        {/* Brand block */}
        <div className="max-w-xs">
          <div className="font-display text-3xl font-black text-ink mb-3">
            {profile.initial}
          </div>
          <p className="text-muted text-sm leading-relaxed">
            Software & systems, built to last.
          </p>
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="mt-4 inline-block text-sm text-ink-dim hover:text-accent transition-colors font-mono-custom"
            >
              {contact.email}
            </a>
          )}
        </div>

        {/* Links grid */}
        <div className="flex gap-16">
          {profile.base && (
            <div>
              <p className="eyebrow mb-4">Base</p>
              <ul className="space-y-2 text-sm text-muted">
                <li>{profile.base}</li>
                <li>Remote friendly</li>
              </ul>
            </div>
          )}
          {socials.length > 0 && (
            <div>
              <p className="eyebrow mb-4">Socials</p>
              <ul className="space-y-2 text-sm">
                {socials.map((s: any) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted hover:text-accent transition-colors"
                    >
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-16 flex flex-col-reverse md:flex-row items-center justify-between gap-4 eyebrow border-t border-border pt-6">
        <span>© {year} {profile.name?.toUpperCase()}</span>
        <span className="text-accent/70">BUILT WITH NEXT.JS + TYPESCRIPT</span>
      </div>
    </footer>
  );
}
