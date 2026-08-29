import { TemplateProps } from "../types";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Experience } from "./sections/Experience";
import { Projects } from "./sections/Projects";
import { Skills } from "./sections/Skills";
import { Education } from "./sections/Education";
import { Certifications } from "./sections/Certifications";
import { Contact } from "./sections/Contact";

export function EditorialV1({ document }: TemplateProps) {
  const heroStats = [
    ...(document.experience?.length > 0
      ? [{ label: "Roles", value: `${document.experience.length}` }]
      : []),
    ...(document.projects?.length > 0
      ? [{ label: "Projects", value: `${document.projects.length}` }]
      : []),
    ...(document.skills?.length > 0
      ? [{
          label: "Skills",
          value: `${document.skills.reduce((a, g) => a + g.skills.length, 0)}`,
        }]
      : []),
  ].slice(0, 3);

  const isHidden = (sectionId: string) => document.configuration?.hiddenSections?.includes(sectionId);

  // Check if we have anything to show in the sidebar grid
  const showSkills = !isHidden("skills");
  const showCerts = !isHidden("certifications");
  const showEdu = !isHidden("education");
  const showSidebarGrid = showSkills || showCerts || showEdu;

  return (
    <div
      className="min-h-screen bg-[#F5F0EA]  text-[#111]  selection:bg-[#CC2936] selection:text-white"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');`}</style>

      {/* ── Hero ── */}
      {!isHidden("hero") && (
        <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16">
          <Hero
            data={document.hero}
            contact={document.contact}
            stats={heroStats.length > 0 ? heroStats : undefined}
          />
        </div>
      )}

      {/* ── About ── */}
      {!isHidden("about") && (
        <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16 py-24 md:py-32 border-b border-[#D9D2C9] ">
          <About data={document.about} />
        </div>
      )}

      {/* ── Experience ── (full width, editorial newspaper feel) */}
      {!isHidden("experience") && (
        <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16 py-24 md:py-32 border-b border-[#D9D2C9] ">
          <Experience data={document.experience} />
        </div>
      )}

      {/* ── Projects ── */}
      {!isHidden("projects") && (
        <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16 py-24 md:py-32 border-b border-[#D9D2C9] ">
          <Projects data={document.projects} />
        </div>
      )}

      {/* ── Skills + Education + Certifications — 2-column sidebar layout ── */}
      {showSidebarGrid && (
        <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16 py-24 md:py-32 border-b border-[#D9D2C9] ">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-4 space-y-20">
              {showSkills && <Skills data={document.skills} />}
              {showCerts && <Certifications data={document.certifications} />}
            </div>
            <div className="lg:col-span-8">
              {showEdu && <Education data={document.education} />}
            </div>
          </div>
        </div>
      )}

      {/* ── Contact ── */}
      {!isHidden("contact") && (
        <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16 py-24 md:py-32">
          <Contact contact={document.contact} links={document.hero?.primaryLinks} />
        </div>
      )}
    </div>
  );
}

export const editorialV1 = {
  metadata: {
    id: "editorial-v1",
    name: "Editorial",
    version: "2.0.0",
    description: "A premium, typography-driven layout with asymmetric columns, geometric accents, bold black typography, and Swiss editorial design principles.",
    supportedSections: ["hero", "about", "experience", "education", "skills", "projects", "certifications", "contact"],
    category: "light",
    tags: ["light", "editorial", "typography", "professional", "modern"],
    style: "editorial",
    recommended: false,
  },
  component: EditorialV1,
};



