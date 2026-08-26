"use client";
import { TemplateProps } from "../types";
import { PremiumHero } from "./sections/Hero";
import { AboutSection } from "./sections/About";
import { ExperienceTimeline } from "./sections/Experience";
import { BentoProjects } from "./sections/Projects";
import { SkillsCloud } from "./sections/Skills";
import { EducationSection } from "./sections/Education";
import { CertificationsSection } from "./sections/Certifications";
import { ContactFooter } from "./sections/Contact";

// ─── Divider ─────────────────────────────────────────────────────────────────
function GradientDivider() {
  return (
    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
  );
}

// ─── Template ─────────────────────────────────────────────────────────────────
export function PremiumV1({ document: doc }: TemplateProps) {
  return (
    <div
      className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap');`}</style>

      {/* Hero — full-screen immersive section */}
      <PremiumHero hero={doc.hero} contact={doc.contact} />

      {/* Content wrapper with subtle top fade */}
      <div className="bg-[#0A0A0F]">
        <GradientDivider />
        <AboutSection data={doc.about} />

        <GradientDivider />
        <ExperienceTimeline data={doc.experience} />

        <GradientDivider />
        <BentoProjects data={doc.projects} />

        <GradientDivider />
        <SkillsCloud data={doc.skills} />

        <GradientDivider />
        <EducationSection data={doc.education} />

        {doc.certifications && doc.certifications.length > 0 && (
          <>
            <GradientDivider />
            <CertificationsSection data={doc.certifications} />
          </>
        )}

        <GradientDivider />
        <ContactFooter contact={doc.contact} links={doc.hero?.primaryLinks} />
      </div>
    </div>
  );
}

export const premiumV1 = {
  metadata: {
    id: "premium-v1",
    name: "Premium Dark",
    version: "1.0.0",
    description: "An ultra-premium dark template with bento grid projects, animated timeline, and immersive full-screen hero. Inspired by Linear and top-tier Awwwards sites.",
    supportedSections: ["hero", "about", "experience", "education", "skills", "projects", "certifications", "contact"],
    category: "dark",
    tags: ["dark", "premium", "bento", "animated", "modern"],
    style: "dark-glass",
    recommended: true,
  },
  component: PremiumV1,
};
