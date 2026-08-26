// @ts-nocheck
"use client";
import { useTemplateData } from "../context";

export default function Footer() {
  const templateData = useTemplateData();
  const { profile = {}, email = "", social = [] } = (templateData as any) || {};
  const year = new Date().getFullYear();

  return (
    <footer className="section-pad py-12 border-t border-border relative overflow-hidden">
      {/* Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="hud-accent mb-1">{profile.name?.toUpperCase()}</div>
          <p className="text-muted text-xs">Engineered for the future.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          {(Array.isArray(social) ? social : []).map((s: any) => (
            <a
              key={s.url || s.platform}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="hud text-muted hover:text-accent transition-colors"
            >
              {s.platform}
            </a>
          ))}
        </div>

        <div className="hud text-muted">
          © {year} {profile.name}
        </div>
      </div>
    </footer>
  );
}
