import { TemplateProps } from "../types";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Experience } from "./sections/Experience";
import { Projects } from "./sections/Projects";
import { Skills } from "./sections/Skills";

export function EditorialV1({ document }: TemplateProps) {
  return (
    <div className="min-h-screen bg-[#F5EFE8] text-[#000000] font-sans selection:bg-[#CC2936] selection:text-white pb-32">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <Hero data={document.hero} />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-24">
          <div className="md:col-span-4 space-y-16">
            <About data={document.about} />
            <Skills data={document.skills} />
          </div>
          
          <div className="md:col-span-8 space-y-24">
            <Experience data={document.experience} />
            <Projects data={document.projects} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const editorialV1 = {
  metadata: {
    id: "editorial-v1",
    name: "Editorial",
    version: "1.0.0",
    description: "A premium, typography-driven layout with asymmetric columns and geometric accents.",
    supportedSections: ["hero", "about", "experience", "skills", "projects"],
  },
  component: EditorialV1,
};
