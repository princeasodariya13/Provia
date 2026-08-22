import { Button } from "@/components/ui/button"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { FeaturesBento } from "@/components/landing/features-bento"
import { HeroScroll } from "@/components/landing/hero-scroll"
import { Testimonials } from "@/components/landing/testimonials"
import { IntegrationsPreview } from "@/components/landing/integrations-preview"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"


export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col w-full overflow-hidden bg-background relative min-h-screen">


        {/* Background Geometric Identity - Abstract Editorial Composition */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Large subtle beige circle top right */}
          <div className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-beige opacity-40 mix-blend-multiply" />
          {/* Rotated warm taupe rectangle left */}
          <div className="absolute top-[30%] -left-[10%] w-[30vw] h-[60vh] bg-accent opacity-30 transform -rotate-12 mix-blend-multiply" />
          {/* Small intentional red accent square */}
          <div className="absolute top-[20%] right-[15%] w-12 h-12 bg-brand opacity-90 rotate-3" />
          {/* Soft warm-accent large overlap */}
          <div className="absolute bottom-[-10%] right-[20%] w-[50vw] h-[30vh] bg-warm-accent opacity-30 transform rotate-6" />
        </div>

        {/* Hero Section - Asymmetrical & Editorial */}
        <section className="w-full relative z-10 pt-32 pb-24 md:pt-48 md:pb-32 px-4 md:px-12 xl:px-24">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12 relative z-10">

            <div className="flex flex-col items-start max-w-2xl">
              <div className="mb-8 border border-border-strong px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-text-primary bg-surface inline-block">
                Professional Portfolio Generator
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-text-primary leading-[1.05] mb-8">
                Your Career,<br />
                Articulated.
              </h1>

              <div className="text-xl md:text-2xl text-text-secondary mb-12 font-medium leading-relaxed max-w-lg border-l-2 border-brand pl-6">
                <TextGenerateEffect 
                  words="Connect your GitHub and LinkedIn. We normalize the data into a sophisticated, premium portfolio ready for top-tier recruiters." 
                  className="font-medium"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                <HoverBorderGradient
                  href="/register"
                  containerClassName="border-0 rounded-none w-full sm:w-auto bg-transparent"
                  className="h-14 px-10 text-base rounded-none bg-brand text-white hover:bg-brand-hover shadow-none flex items-center justify-center w-full"
                >
                  Start Building <ArrowRight className="ml-3 h-5 w-5" />
                </HoverBorderGradient>
                <Button size="lg" variant="outline" className="h-14 px-10 text-base rounded-none border-border-strong text-text-primary hover:bg-taupe hover:text-white transition-colors shadow-none bg-transparent">
                  View Live Examples
                </Button>
              </div>
            </div>

            {/* Right side 3D Card showcase */}
            <div className="hidden lg:flex w-[45%] flex-col items-end relative z-20">
              <CardContainer className="inter-var w-full pb-0 pt-0" containerClassName="py-0">
                <CardBody className="bg-surface/90 backdrop-blur-md relative group/card border-border-strong w-full aspect-[4/5] rounded-none p-6 border shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex flex-col">
                  
                  {/* Top Taupe Accent Dot */}
                  <CardItem translateZ="30" className="w-6 h-6 rounded-full bg-taupe absolute -top-3 -left-3 shadow-sm" />

                  <CardItem
                    translateZ="50"
                    className="text-sm font-bold text-text-primary uppercase tracking-widest"
                  >
                    Automated Editorial
                  </CardItem>
                  
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-text-secondary text-sm mt-3"
                  >
                    Interactive, typography-first portfolios generated instantly.
                  </CardItem>
                  
                  <CardItem translateZ="100" className="w-full mt-6 flex-1 relative">
                    <img
                      src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2672&auto=format&fit=crop"
                      className="absolute inset-0 h-full w-full object-cover group-hover/card:shadow-xl border border-border-light filter grayscale-[20%] contrast-125 rounded-lg"
                      alt="Provia Portfolio Preview"
                    />
                  </CardItem>
                  
                  <div className="flex justify-between items-end mt-6 w-full">
                    <CardItem
                      translateZ={40}
                      className="text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-border-strong pb-1"
                    >
                      Hover to interact
                    </CardItem>
                    <div className="text-right flex flex-col items-end">
                      <CardItem
                        translateZ={50}
                        className="text-6xl font-bold text-brand leading-none mb-2"
                      >
                        01
                      </CardItem>
                      <CardItem translateZ={40} className="w-16 h-1 bg-border-strong" />
                    </div>
                  </div>
                </CardBody>
              </CardContainer>
            </div>
          </div>
        </section>

        {/* Dashboard Product Showcase */}
        <section className="w-full relative z-10 bg-background -mt-20 md:-mt-32">
          <HeroScroll />
        </section>

        {/* Feature Grid */}
        <section id="features" className="w-full relative z-10 py-24 px-4 md:px-12 xl:px-24 bg-surface border-y border-border-light">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary max-w-md">
                Everything you need to stand out.
              </h2>
              <p className="text-lg text-text-secondary max-w-md mt-6 md:mt-0 text-right hidden md:block">
                Designed explicitly for professionals who require a polished, intentional presence.
              </p>
            </div>

            <FeaturesBento />
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* Integrations Preview */}
        <IntegrationsPreview />

        {/* CTA Section */}
        <section className="w-full relative z-10 py-40 px-4 overflow-hidden">
          <div className="absolute top-0 left-[20%] w-[1px] h-full bg-border-light" />
          <div className="absolute top-0 right-[20%] w-[1px] h-full bg-border-light" />

          <div className="container mx-auto max-w-3xl text-center flex flex-col items-center relative z-10">
            <div className="w-16 h-16 bg-taupe rounded-full mb-12 opacity-80 mix-blend-multiply" />
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-text-primary mb-8">
              Establish your identity.
            </h2>
            <Button size="lg" className="h-14 px-12 text-base rounded-none bg-brand text-white hover:bg-brand-hover shadow-none" asChild>
              <Link href="/register">Create Your Account</Link>
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
