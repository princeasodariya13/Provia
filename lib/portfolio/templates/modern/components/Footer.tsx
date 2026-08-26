// @ts-nocheck
"use client";

import { useTemplateData } from "../context";

export default function Footer() {
  const templateData = useTemplateData();
  const { profile = {}, contact = {}, socials = [] } = (templateData as any) || {};

  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="font-display font-semibold text-ink text-lg tracking-tight mb-1">
            {profile.name}
          </div>
          <div className="text-muted text-sm">{profile.title}</div>
        </div>
        
        {socials.length > 0 && (
          <div className="flex gap-5">
            {socials.map((s: any) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="section-label text-muted hover:text-accent transition-colors"
              >
                {s.platform}
              </a>
            ))}
          </div>
        )}
        
        <div className="text-xs text-muted font-mono">
          © {new Date().getFullYear()} {profile.name}
        </div>
      </div>
    </footer>
  );
}
