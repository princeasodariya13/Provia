// @ts-nocheck
"use client";
import { useTemplateData } from "../context";

export default function Footer() {
  const templateData = useTemplateData();
  // @ts-ignore
  const { profile, projects, experience, skills, stats, stack, faq, about, milestones, capabilities, globals, steps, header, social, education, services } = templateData || {};

  return (
    <footer className="section-pad py-10 border-t border-border">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 hud">
        <span>
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </span>
        <span>Engineered for the future.</span>
      </div>
    </footer>
  );
}
