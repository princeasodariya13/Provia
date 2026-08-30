import { Metadata } from "next";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { ArrowRight, Palette, Layers, Smartphone, MousePointer2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const metadata: Metadata = {
  title: "Premium Portfolio Designs | Provia",
  description: "Breathtaking, typography-first, 3D-integrated templates that make you stand out from the crowd.",
};

const templates = [
  {
    name: "Immersive 3D",
    description: "A visually rich interactive 3D portfolio for developers, creative technologists, and digital creators who want an unforgettable presence with WebGL.",
    image: "/templates/3d.png",
    tags: ["3D", "Interactive", "WebGL"],
    filterClass: "group-hover/card:shadow-2xl"
  },
  {
    name: "Creative Editorial",
    description: "An elegant, typography-driven layout inspired by high-end fashion magazines. Perfect for designers and creative directors.",
    image: "/templates/editorial.png",
    tags: ["Minimalist", "Typography", "Editorial"],
    filterClass: ""
  },
  {
    name: "AI Technology",
    description: "A sleek, dark-mode first design with neon accents and terminal-style aesthetics built for Machine Learning and AI Engineers.",
    image: "/templates/ai.png",
    tags: ["Dark Mode", "Cyberpunk", "Tech"],
    filterClass: ""
  },
  {
    name: "Classic Professional",
    description: "The gold standard for corporate software engineers. Clean, readable, and perfectly optimized for ATS and recruiter scanning.",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop",
    tags: ["Corporate", "Clean", "Professional"],
    filterClass: ""
  },
  {
    name: "Motion Creative",
    description: "Fluid animations, scroll-triggered reveals, and dynamic layouts for animators, motion designers, and frontend specialists.",
    image: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=2670&auto=format&fit=crop",
    tags: ["Animated", "Dynamic", "Frontend"],
    filterClass: ""
  },
  {
    name: "Modern Fullstack",
    description: "A balanced, feature-rich layout showcasing extensive project galleries, GitHub statistics, and comprehensive skill matrices.",
    image: "/dashboard-mockup.png",
    tags: ["Data-Heavy", "Comprehensive", "Grid"],
    filterClass: ""
  }
];

export default function PremiumDesignsPage() {
  return (
    <div className="w-full relative z-10 overflow-hidden min-h-screen bg-background pb-24">
      {/* Background element */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-brand/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 md:px-12 xl:px-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          
          <div className="flex-1 text-left">
            <div className="mb-8 border border-border-strong px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand bg-brand/5 inline-block rounded-full">
              Editorial Aesthetics
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-text-primary leading-[1.05] mb-8">
              Designs that <br />
              <span className="text-brand">demand respect.</span>
            </h1>
            
            <div className="text-base sm:text-xl text-text-secondary mb-12 font-medium max-w-xl leading-relaxed">
              <TextGenerateEffect 
                words="We don't use generic templates. Every Provia design is handcrafted with modern typography, smooth animations, and interactive integrations to make you look like a top 1% professional." 
              />
            </div>
            
            <HoverBorderGradient
              href="/register"
              containerClassName="border-0 rounded-none bg-transparent inline-flex"
              className="h-14 px-10 text-base rounded-none bg-brand text-white hover:bg-brand-hover shadow-xl shadow-brand/20 flex items-center justify-center font-bold"
            >
              Browse Templates <ArrowRight className="ml-3 h-5 w-5" />
            </HoverBorderGradient>
          </div>

          <div className="flex-1 w-full hidden lg:block">
            <CardContainer className="inter-var w-full">
              <CardBody className="bg-surface/90 backdrop-blur-md relative group/card border-border-strong w-full aspect-[4/3] rounded-2xl p-6 border shadow-[0_20px_40px_rgba(0,0,0,0.12)]">
                <CardItem translateZ="50" className="text-xl font-bold text-text-primary">
                  Provia Immersive 3D
                </CardItem>
                <CardItem as="p" translateZ="60" className="text-text-secondary text-sm mt-2">
                  WebGL powered floating elements designed specifically for your professional brand.
                </CardItem>
                <CardItem translateZ="100" className="w-full mt-4 flex-1 relative h-64">
                  <img
                    src="/templates/3d.png"
                    className="h-full w-full object-cover rounded-xl group-hover/card:shadow-2xl border border-border-light"
                    alt="Provia Portfolio Template Preview"
                  />
                </CardItem>
              </CardBody>
            </CardContainer>
          </div>
        </div>
      </section>

      {/* The Collection Section */}
      <section className="py-24 px-4 md:px-12 xl:px-24 bg-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-text-primary mb-6">
              The Provia Collection
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Our exclusive library of production-ready templates. Swap between them instantly without losing any of your data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {templates.map((template, idx) => (
              <ScrollReveal key={idx} delay={idx * 0.15}>
                <div className="group relative flex flex-col bg-surface border border-border-light rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-black">
                    <img 
                      src={template.image} 
                      alt={template.name} 
                      className={`w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out ${template.filterClass || ""}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
                      {template.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white rounded-md border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-brand transition-colors">{template.name}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed flex-1">{template.description}</p>
                    
                    <div className="mt-6 pt-6 border-t border-border-light flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-brand flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Available Now
                      </span>
                      <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand transition-colors transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="px-4 md:px-12 xl:px-24 py-24 border-y border-border-light">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary mb-4">
                Built on Modern Standards
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="flex flex-col items-center text-center p-8 bg-surface/50 border border-border-light rounded-2xl hover:border-brand/30 transition-colors h-full">
                <div className="w-16 h-16 rounded-full bg-background border border-border-light flex items-center justify-center mb-6 shadow-sm">
                  <Palette className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Curated Palettes</h3>
                <p className="text-sm text-text-secondary">Professionally matched colors optimized for contrast, readability, and modern dark modes.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="flex flex-col items-center text-center p-8 bg-surface/50 border border-border-light rounded-2xl hover:border-brand/30 transition-colors h-full">
                <div className="w-16 h-16 rounded-full bg-background border border-border-light flex items-center justify-center mb-6 shadow-sm">
                  <Layers className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">WebGL & 3D</h3>
                <p className="text-sm text-text-secondary">Integrated Three.js backgrounds and micro-interactions that don't compromise performance.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.3}>
              <div className="flex flex-col items-center text-center p-8 bg-surface/50 border border-border-light rounded-2xl hover:border-brand/30 transition-colors h-full">
                <div className="w-16 h-16 rounded-full bg-background border border-border-light flex items-center justify-center mb-6 shadow-sm">
                  <Smartphone className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Flawless Mobile</h3>
                <p className="text-sm text-text-secondary">Every template is painstakingly responsive, ensuring your portfolio looks stunning on any device.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.4}>
              <div className="flex flex-col items-center text-center p-8 bg-surface/50 border border-border-light rounded-2xl hover:border-brand/30 transition-colors h-full">
                <div className="w-16 h-16 rounded-full bg-background border border-border-light flex items-center justify-center mb-6 shadow-sm">
                  <MousePointer2 className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">Micro-Animations</h3>
                <p className="text-sm text-text-secondary">Subtle hover effects, scroll reveals, and state changes that make the interface feel alive.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="w-full relative z-10 pt-32 px-4 text-center flex flex-col items-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-text-primary mb-6">
            Your work deserves a beautiful frame.
          </h2>
          <p className="text-lg text-text-secondary mb-12 max-w-2xl mx-auto">
            Join Provia today and transform your career history into a visual masterpiece with just a few clicks.
          </p>
          <Link href="/register">
            <HoverBorderGradient
              containerClassName="border-0 rounded-none bg-transparent"
              className="h-14 px-12 text-base rounded-none bg-text-primary text-background hover:bg-text-secondary shadow-xl font-bold inline-flex items-center"
            >
              Get Started Free
            </HoverBorderGradient>
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
