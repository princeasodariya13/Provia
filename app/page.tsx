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
import { LandingPreloader } from "@/components/landing/preloader"


export default function Home() {
  return (
    <>
      <LandingPreloader />
      <Navbar />
      <div className="flex flex-col w-full overflow-hidden bg-background relative min-h-screen">


        {/* Background Geometric Identity - Abstract Editorial Composition */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          {/* Large subtle beige circle top right */}
          <div className="absolute -top-[10%] -right-[5%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full bg-beige opacity-30 md:opacity-40 mix-blend-multiply" />
          {/* Rotated warm taupe rectangle left */}
          <div className="absolute top-[30%] -left-[15%] w-[50vw] h-[50vh] md:w-[30vw] md:h-[60vh] bg-accent opacity-20 md:opacity-30 transform -rotate-12 mix-blend-multiply" />
          {/* Small intentional red accent square - hide on very small screens */}
          <div className="hidden sm:block absolute top-[20%] right-[15%] w-10 h-10 md:w-12 md:h-12 bg-brand opacity-90 rotate-3" />
          {/* Soft warm-accent large overlap */}
          <div className="absolute bottom-[-10%] right-[20%] w-[70vw] h-[20vh] md:w-[50vw] md:h-[30vh] bg-warm-accent opacity-20 md:opacity-30 transform rotate-6" />
        </div>

        {/* Hero Section - Asymmetrical & Editorial */}
        <section className="w-full relative z-10 pt-28 pb-16 md:pt-48 md:pb-32 px-4 md:px-12 xl:px-24">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8 md:gap-12 relative z-10">

            <div className="flex flex-col items-start w-full md:max-w-2xl">
              <div className="mb-6 md:mb-8 border border-border-strong px-3 md:px-4 py-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-widest text-text-primary bg-surface inline-block">
                Professional Portfolio Generator
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-text-primary leading-[1.05] mb-6 md:mb-8">
                Your Career,<br />
                Articulated.
              </h1>

              <div className="text-base sm:text-xl md:text-2xl text-text-secondary mb-8 md:mb-12 font-medium leading-relaxed max-w-lg border-l-2 border-brand pl-4 md:pl-6">
                <TextGenerateEffect
                  words="Connect your GitHub and LinkedIn. We normalize the data into a sophisticated, premium portfolio ready for top-tier recruiters."
                  className="font-medium"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto">
                <HoverBorderGradient
                  href="/register"
                  containerClassName="border-0 rounded-none w-full sm:w-auto bg-transparent"
                  className="h-12 md:h-14 px-8 md:px-10 text-sm md:text-base rounded-none bg-brand text-white hover:bg-brand-hover shadow-none flex items-center justify-center w-full"
                >
                  Start Building <ArrowRight className="ml-3 h-4 w-4 md:h-5 md:w-5" />
                </HoverBorderGradient>
                <Button size="lg" variant="outline" className="h-12 md:h-14 px-8 md:px-10 text-sm md:text-base rounded-none border-border-strong text-text-primary hover:bg-taupe hover:text-white transition-colors shadow-none bg-transparent w-full sm:w-auto">
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
        <section className="w-full relative z-10 bg-background -mt-16 md:-mt-32">
          <HeroScroll />
        </section>

        {/* Feature Grid */}
        <section id="features" className="w-full relative z-10 py-16 md:py-24 px-4 md:px-12 xl:px-24 bg-surface border-y border-border-light">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-24 gap-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text-primary max-w-md">
                Everything you need to stand out.
              </h2>
              <p className="text-base md:text-lg text-text-secondary max-w-md md:mt-0 md:text-right">
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
        <section className="w-full relative z-10 py-24 md:py-40 px-4 overflow-hidden">
          <div className="absolute top-0 left-[10%] md:left-[20%] w-[1px] h-full bg-border-light" />
          <div className="absolute top-0 right-[10%] md:right-[20%] w-[1px] h-full bg-border-light" />

          <div className="container mx-auto max-w-3xl text-center flex flex-col items-center relative z-10 px-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-taupe rounded-full mb-8 md:mb-12 opacity-80 mix-blend-multiply" />
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter text-text-primary mb-6 md:mb-8">
              Establish your identity.
            </h2>
            <Button size="lg" className="h-12 md:h-14 px-8 md:px-12 text-sm md:text-base rounded-none bg-brand text-white hover:bg-brand-hover shadow-none w-full sm:w-auto" asChild>
              <Link href="/register">Create Your Account</Link>
            </Button>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
