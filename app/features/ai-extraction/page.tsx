import { Metadata } from "next";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { ArrowRight, BrainCircuit, ScanText, Sparkles, GitBranch, Link2, Terminal, Database, Code2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "AI Narrative Extraction | Provia",
  description: "Our proprietary AI analyzes your resume and code to construct a compelling professional narrative automatically.",
};

export default function AIExtractionPage() {
  return (
    <div className="w-full relative z-10 overflow-hidden min-h-screen pb-24">
      {/* Background element */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-brand/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 md:px-12 xl:px-24">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="mb-8 border border-border-strong px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand bg-brand/5 inline-flex items-center justify-center gap-2 rounded-full">
            <BrainCircuit className="w-4 h-4 shrink-0" />
            <span>Proprietary Intelligence</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-text-primary leading-[1.05] mb-8">
            Your career, <br className="hidden md:block" />
            <span className="text-brand">articulated perfectly.</span>
          </h1>
          
          <div className="text-base sm:text-xl md:text-2xl text-text-secondary mb-12 font-medium max-w-3xl mx-auto">
            <TextGenerateEffect 
              words="Don't struggle to write about yourself. Connect your accounts and upload your resume. Our LLM pipeline extracts your skills, experience, and achievements into a structured, highly persuasive narrative." 
            />
          </div>
          
          <HoverBorderGradient
            href="/register"
            containerClassName="border-0 rounded-none bg-transparent"
            className="h-14 px-10 text-base rounded-none bg-brand text-white hover:bg-brand-hover shadow-xl shadow-brand/20 flex items-center justify-center font-bold"
          >
            Experience the Magic <ArrowRight className="ml-3 h-5 w-5" />
          </HoverBorderGradient>
        </div>
      </section>

      {/* The Intelligence Pipeline */}
      <section className="py-24 px-4 md:px-12 xl:px-24 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mb-6">
              The Data Ingestion Pipeline
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Provia doesn't just copy-paste your text. It reads, understands, and rewrites your professional history for maximum impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-brand/30 to-transparent -translate-y-1/2 z-0" />

            <div className="relative z-10 flex flex-col items-center text-center p-8 bg-surface border border-border-light rounded-2xl shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center mb-6 border border-[#0077b5]/20">
                <Link2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Professional History</h3>
              <p className="text-sm text-text-secondary">We extract chronological work experience, education, and endorsements directly from your LinkedIn profile or uploaded PDF resume.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center p-8 bg-surface border border-border-light rounded-2xl shadow-xl transform md:-translate-y-8 border-brand/50 ring-1 ring-brand/20">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 border border-brand/20">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">LLM Processing</h3>
              <p className="text-sm text-text-secondary">Our vision models parse document layouts while our language models summarize your achievements and normalize your skill stack.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center p-8 bg-surface border border-border-light rounded-2xl shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-text-primary/5 text-text-primary flex items-center justify-center mb-6 border border-border-strong">
                <GitBranch className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Code Repositories</h3>
              <p className="text-sm text-text-secondary">We fetch your top repositories, analyze their README files, and map languages to visually stunning project cards automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-4 md:px-12 xl:px-24 py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary">
              Beyond Keyword Extraction
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Standard parsers break when they encounter complex layouts. Provia's multi-modal extraction engine understands the structural semantics of your documents.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text-primary mb-1">Contextual Tech Stacks</h4>
                  <p className="text-sm text-text-secondary">We automatically categorize your raw skills into logical groupings (Frontend, Backend, DevOps, etc.) and fetch their official SVG icons.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text-primary mb-1">Narrative Generation</h4>
                  <p className="text-sm text-text-secondary">We generate highly professional, multi-length bios (short, medium, long) tailored for your hero section and about page.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                  <Code2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text-primary mb-1">Repository Enrichment</h4>
                  <p className="text-sm text-text-secondary">Your GitHub projects are automatically enhanced with short descriptions, star counts, and dominant languages.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand/20 to-accent/20 blur-3xl rounded-[3rem] -z-10" />
            <div className="bg-[#0D1117] text-[#C9D1D9] p-6 md:p-8 rounded-2xl font-mono text-sm shadow-2xl border border-[#30363D] overflow-hidden">
              <div className="flex items-center gap-2 mb-6 border-b border-[#30363D] pb-4">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                <span className="ml-4 text-[#8B949E] text-xs">provia-ai-engine ~ zsh</span>
              </div>
              <pre className="overflow-x-auto">
                <code className="leading-relaxed">
<span className="text-[#79C0FF]">[SYSTEM]</span> Analyzing uploaded_resume.pdf...<br/>
<span className="text-[#79C0FF]">[SYSTEM]</span> Extracting chronological timeline...<br/>
<span className="text-[#3FB950]">[SUCCESS]</span> Found 3 roles, 1 education record.<br/>
<span className="text-[#79C0FF]">[SYSTEM]</span> Evaluating project context...<br/>
<span className="text-[#D2A8FF]">[INFO]</span> Mapped 'React' and 'Next.js' to Frontend Stack.<br/>
<span className="text-[#D2A8FF]">[INFO]</span> Mapped 'PostgreSQL' and 'Prisma' to Database Stack.<br/>
<span className="text-[#79C0FF]">[SYSTEM]</span> Generating narrative bios...<br/>
<span className="text-[#3FB950]">[SUCCESS]</span> Narrative compiled and ready for UI rendering.<br/>
<span className="animate-pulse">_</span>
                </code>
              </pre>
            </div>
          </div>

        </div>
      </section>

      {/* CTA section */}
      <section className="w-full relative z-10 pt-16 px-4 text-center flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-text-primary mb-8">
          Stop typing. Start rendering.
        </h2>
        <Link href="/register">
          <Button size="lg" className="h-14 px-12 text-base rounded-none bg-text-primary text-background hover:bg-text-secondary shadow-xl font-bold">
            Try It Now
          </Button>
        </Link>
      </section>
    </div>
  );
}
