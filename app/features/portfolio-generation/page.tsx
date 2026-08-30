import { Metadata } from "next";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { ArrowRight, Zap, Code, LayoutDashboard, GitBranch, Link2, Database, Code2 } from "lucide-react";
import Link from "next/link";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Instant Portfolio Generation | Provia",
  description: "Generate a fully responsive, premium portfolio website instantly using your existing professional footprint.",
};

export default function PortfolioGenerationPage() {
  return (
    <div className="w-full relative z-10 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 md:px-12 xl:px-24">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="mb-8 border border-border-strong px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand bg-brand/5 inline-block rounded-full">
            Instant Deployment
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-text-primary leading-[1.05] mb-8 max-w-4xl">
            From Zero to <span className="text-brand">Live Portfolio</span> in 60 Seconds.
          </h1>
          <div className="text-base sm:text-xl md:text-2xl text-text-secondary mb-12 font-medium max-w-3xl">
            <TextGenerateEffect 
              words="No coding required. Connect your profiles, and we instantly generate a production-ready, beautifully crafted portfolio tailored to your career." 
            />
          </div>
          
          <HoverBorderGradient
            href="/register"
            containerClassName="border-0 rounded-none bg-transparent"
            className="h-14 px-10 text-base rounded-none bg-brand text-white hover:bg-brand-hover shadow-xl shadow-brand/20 flex items-center justify-center font-bold"
          >
            Generate Your Portfolio <ArrowRight className="ml-3 h-5 w-5" />
          </HoverBorderGradient>
        </div>
      </section>

      {/* Visual Showcase */}
      <section className="px-4 pb-24 hidden md:block">
        <ContainerScroll
          titleComponent={
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-8">
              See the magic happen <br />
              <span className="text-text-secondary text-2xl md:text-4xl mt-2 block">before your eyes.</span>
            </h2>
          }
        >
          <div className="h-full w-full bg-surface border-border-light rounded-2xl overflow-hidden relative shadow-2xl flex flex-col items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2940&auto=format&fit=crop" 
              alt="Provia Dashboard" 
              className="w-full h-full object-cover filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-10 left-10 text-white text-left">
              <p className="text-sm font-bold uppercase tracking-widest text-white/70 mb-2">Real-time compilation</p>
              <p className="text-3xl font-bold">Your data, immediately beautiful.</p>
            </div>
          </div>
        </ContainerScroll>
      </section>

      {/* Feature Breakdown */}
      <section className="py-32 px-4 md:px-12 xl:px-24 bg-surface/50 border-y border-border-light relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mb-6">
              The Architecture of Instant Portfolios
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              We handle the complex orchestration of data fetching, rendering, and edge hosting so you never have to configure a deployment pipeline again.
            </p>
          </div>

          <div className="flex flex-col gap-8 md:gap-16">
            
            <div className="flex flex-col md:flex-row items-center gap-12 bg-background p-8 md:p-12 rounded-3xl border border-border-light shadow-xl">
              <div className="flex-1 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary">1. Automated Data Synchronization</h3>
                <p className="text-text-secondary leading-relaxed">
                  Connect your GitHub and LinkedIn accounts once. Our background workers automatically synchronize your latest repositories, commit histories, job transitions, and skill endorsements. When you push code, your portfolio knows.
                </p>
              </div>
              <div className="flex-1 w-full relative">
                <div className="aspect-video w-full rounded-2xl bg-surface border border-border-strong p-6 flex flex-col justify-center items-center overflow-hidden">
                  <div className="flex items-center gap-8 text-text-muted">
                    <div className="flex flex-col items-center gap-2 animate-pulse">
                      <div className="w-16 h-16 rounded-full bg-[#333] flex items-center justify-center text-white"><GitBranch className="w-8 h-8" /></div>
                      <span className="text-xs font-bold">API Sync</span>
                    </div>
                    <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-brand to-transparent" />
                    <div className="w-20 h-20 rounded-2xl bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/30"><Database className="w-10 h-10" /></div>
                    <div className="h-0.5 w-16 bg-gradient-to-r from-brand via-brand to-transparent" />
                    <div className="flex flex-col items-center gap-2 animate-pulse" style={{ animationDelay: '500ms' }}>
                      <div className="w-16 h-16 rounded-full bg-[#0077b5] flex items-center justify-center text-white"><Link2 className="w-8 h-8" /></div>
                      <span className="text-xs font-bold">Webhooks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-12 bg-background p-8 md:p-12 rounded-3xl border border-border-light shadow-xl">
              <div className="flex-1 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
                  <Code className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary">2. Real-Time Compilation</h3>
                <p className="text-text-secondary leading-relaxed">
                  Your aggregated data is instantly compiled against our premium React/Next.js templates. We use Server Components and static generation where possible to ensure your portfolio loads in under 100 milliseconds worldwide.
                </p>
              </div>
              <div className="flex-1 w-full">
                <div className="aspect-video w-full rounded-2xl bg-[#0D1117] border border-[#30363D] p-6 font-mono text-sm overflow-hidden flex flex-col justify-center shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Code2 className="w-32 h-32" /></div>
                  <div className="text-[#8B949E] mb-2">Building optimized bundle...</div>
                  <div className="flex gap-4 text-[#C9D1D9]">
                    <span className="text-[#3FB950]">✓</span> <span>Compiled /portfolio/hero</span> <span className="text-[#8B949E]">12ms</span>
                  </div>
                  <div className="flex gap-4 text-[#C9D1D9]">
                    <span className="text-[#3FB950]">✓</span> <span>Compiled /portfolio/projects</span> <span className="text-[#8B949E]">24ms</span>
                  </div>
                  <div className="flex gap-4 text-[#C9D1D9]">
                    <span className="text-[#3FB950]">✓</span> <span>Compiled /portfolio/3d-canvas</span> <span className="text-[#8B949E]">45ms</span>
                  </div>
                  <div className="mt-4 text-[#79C0FF] font-bold">Route (app)                              Size     First Load JS</div>
                  <div className="text-[#C9D1D9]">┌ ○ /p/john-doe/1a2b3c4d                 142 kB          245 kB</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12 bg-background p-8 md:p-12 rounded-3xl border border-border-light shadow-xl">
              <div className="flex-1 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-text-primary">3. Global Edge Deployment</h3>
                <p className="text-text-secondary leading-relaxed">
                  Once compiled, your portfolio is pushed to a global Edge network. This means whether a recruiter opens your link in Tokyo, London, or San Francisco, they get an instantaneous, premium viewing experience.
                </p>
              </div>
              <div className="flex-1 w-full">
                <div className="aspect-video w-full rounded-2xl bg-surface border border-border-strong overflow-hidden relative shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop" className="w-full h-full object-cover filter contrast-125 saturate-50 brightness-75" alt="Global Network" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-bold tracking-widest text-sm uppercase">Status: Online</span>
                    </div>
                    <p className="text-white/70">Deployed to 300+ Edge Nodes Worldwide.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="w-full relative z-10 py-32 px-4 overflow-hidden text-center flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-text-primary mb-8">
          Ready to establish your presence?
        </h2>
        <Link href="/register">
          <Button size="lg" className="h-14 px-12 text-base rounded-none bg-brand text-white hover:bg-brand-hover shadow-xl font-bold">
            Create Free Account
          </Button>
        </Link>
      </section>
    </div>
  );
}
