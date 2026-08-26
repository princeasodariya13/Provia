import { TemplateProps } from "../types";
import { PremiumHero } from "./sections/Hero";
import { AboutSection } from "./sections/About";
import { ExperienceTimeline } from "./sections/Experience";
import { BentoProjects } from "./sections/Projects";
import { SkillsCloud } from "./sections/Skills";
import { EducationSection } from "./sections/Education";
import { CertificationsSection } from "./sections/Certifications";
import { ContactFooter } from "./sections/Contact";
import { GradientDivider } from "./sections/SectionHeader";

// ─── Template ─────────────────────────────────────────────────────────────────
export function PremiumV1({ document: doc }: TemplateProps) {
  // Build hero stats from document data
  const heroStats = [
    ...(doc.experience?.length > 0 ? [{ label: "Roles", value: `${doc.experience.length}+` }] : []),
    ...(doc.projects?.length > 0 ? [{ label: "Projects", value: `${doc.projects.length}+` }] : []),
    ...(doc.skills?.length > 0 ? [{
      label: "Skills",
      value: `${doc.skills.reduce((a, g) => a + g.skills.length, 0)}+`
    }] : []),
  ].slice(0, 3);

  // Helper to check if a section should be hidden
  const isHidden = (sectionId: string) => doc.configuration?.hiddenSections?.includes(sectionId);

  return (
    <div
      className="min-h-screen bg-black text-white overflow-x-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');`}</style>

      {/* Hero — full-screen cinematic section */}
      {!isHidden("hero") && (
        <PremiumHero
          hero={doc.hero}
          contact={doc.contact}
          stats={heroStats.length > 0 ? heroStats : undefined}
        />
      )}

      {/* About */}
      {!isHidden("about") && (
        <>
          <GradientDivider />
          <AboutSection data={doc.about} />
        </>
      )}

      {/* Experience */}
      {!isHidden("experience") && (
        <>
          <GradientDivider />
          <ExperienceTimeline data={doc.experience} />
        </>
      )}

      {/* Projects */}
      {!isHidden("projects") && (
        <>
          <GradientDivider />
          <BentoProjects data={doc.projects} />
        </>
      )}

      {/* Skills */}
      {!isHidden("skills") && (
        <>
          <GradientDivider />
          <SkillsCloud data={doc.skills} />
        </>
      )}

      {/* Education */}
      {!isHidden("education") && (
        <>
          <GradientDivider />
          <EducationSection data={doc.education} />
        </>
      )}

      {/* Certifications (conditional) */}
      {!isHidden("certifications") && doc.certifications && doc.certifications.length > 0 && (
        <>
          <GradientDivider />
          <CertificationsSection data={doc.certifications} />
        </>
      )}

      {/* Contact footer */}
      {!isHidden("contact") && (
        <>
          <GradientDivider />
          <ContactFooter contact={doc.contact} links={doc.hero?.primaryLinks} />
        </>
      )}
    </div>
  );
}

export const premiumV1 = {
  metadata: {
    id: "premium-v1",
    name: "Premium Dark",
    version: "2.0.0",
    description: "An ultra-premium dark template with bento grid projects, animated timeline, and immersive full-screen hero. Inspired by Linear and top-tier Awwwards sites.",
    supportedSections: ["hero", "about", "experience", "education", "skills", "projects", "certifications", "contact"],
    category: "dark",
    tags: ["dark", "premium", "bento", "animated", "modern"],
    style: "dark-glass",
    recommended: true,
  },
  component: PremiumV1,
};
