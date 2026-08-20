import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, GitBranch, LayoutTemplate, Briefcase } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col w-full overflow-hidden bg-background relative min-h-screen">
      
      {/* Background Geometric Identity - Abstract Editorial Composition */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Large subtle beige circle extending off-screen top right */}
        <div className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vw] rounded-full bg-beige opacity-40 mix-blend-multiply" />
        
        {/* Rotated warm taupe rectangle left side */}
        <div className="absolute top-[30%] -left-[10%] w-[30vw] h-[60vh] bg-accent opacity-30 transform -rotate-12 mix-blend-multiply" />
        
        {/* Small intentional red accent square in the composition */}
        <div className="absolute top-[20%] right-[15%] w-12 h-12 bg-brand opacity-90 rotate-3" />
        
        {/* Soft warm-accent large overlap */}
        <div className="absolute bottom-[-10%] right-[20%] w-[50vw] h-[30vh] bg-warm-accent opacity-30 transform rotate-6" />
      </div>

      {/* Hero Section - Asymmetrical & Editorial */}
      <section className="w-full relative z-10 pt-32 pb-24 md:pt-48 md:pb-32 px-4 md:px-12 xl:px-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
          
          <div className="flex flex-col items-start max-w-2xl">
            <div className="mb-8 border border-border-strong px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-text-primary bg-surface inline-block">
              Professional Portfolio Generator
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-text-primary leading-[1.05] mb-8">
              Your Career,<br />
              Articulated.
            </h1>
            
            <p className="text-xl md:text-2xl text-text-secondary mb-12 font-medium leading-relaxed max-w-lg border-l-2 border-brand pl-6">
              Connect your GitHub and LinkedIn. We normalize the data into a sophisticated, premium portfolio ready for top-tier recruiters.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <Button size="lg" className="h-14 px-10 text-base rounded-none bg-brand text-white hover:bg-brand-hover shadow-none" asChild>
                <Link href="/register">
                  Start Building <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-base rounded-none border-border-strong text-text-primary hover:bg-taupe hover:text-white transition-colors shadow-none bg-transparent">
                View Live Examples
              </Button>
            </div>
          </div>
          
          {/* Right side abstract/typographic composition piece */}
          <div className="hidden lg:flex w-1/3 flex-col items-end relative pt-12">
             <div className="w-full aspect-[3/4] border border-border-strong relative bg-surface/50 p-8 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-taupe absolute -top-4 -left-4" />
                <div>
                   <p className="text-sm font-bold uppercase tracking-widest text-text-secondary mb-2">Automated</p>
                   <p className="text-sm font-bold uppercase tracking-widest text-text-secondary">Editorial</p>
                </div>
                <div className="text-right">
                   <span className="text-6xl font-bold text-brand block mb-2">01</span>
                   <div className="w-16 h-1 bg-border-strong ml-auto" />
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* Feature Grid - Intentionally clean, minimal decoration */}
      <section id="features" className="w-full relative z-10 py-32 px-4 md:px-12 xl:px-24 bg-surface border-y border-border-light">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-text-primary max-w-md">
              Everything you need to stand out.
            </h2>
            <p className="text-lg text-text-secondary max-w-md mt-6 md:mt-0 text-right hidden md:block">
              Designed explicitly for professionals who require a polished, intentional presence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border-light">
            <Card className="rounded-none border-0 border-b md:border-b-0 md:border-r border-border-light bg-transparent shadow-none p-10 hover:bg-background transition-colors">
              <CardHeader className="p-0 mb-12">
                <div className="mb-8 w-12 h-12 bg-beige flex items-center justify-center rounded-none">
                  <GitBranch className="h-5 w-5 text-text-primary" />
                </div>
                <CardTitle className="text-2xl mb-4">Data Synchronization</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Connect your existing profiles. We automatically sync repositories, contributions, and professional history without manual data entry.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="rounded-none border-0 border-b md:border-b-0 md:border-r border-border-light bg-transparent shadow-none p-10 hover:bg-background transition-colors">
              <CardHeader className="p-0 mb-12">
                <div className="mb-8 w-12 h-12 bg-accent flex items-center justify-center rounded-none">
                  <LayoutTemplate className="h-5 w-5 text-text-primary" />
                </div>
                <CardTitle className="text-2xl mb-4">Editorial Templates</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Select from layouts prioritizing typography, whitespace, and structural harmony over flashy generic components.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="rounded-none border-0 bg-transparent shadow-none p-10 hover:bg-background transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-warm-accent rounded-bl-full opacity-20" />
              <CardHeader className="p-0 mb-12 relative z-10">
                <div className="mb-8 w-12 h-12 bg-brand flex items-center justify-center rounded-none">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl mb-4">Career Optimized</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Engineered to highlight the depth of your work. Designed to communicate competence within the recruiter&apos;s strict 6-second review window.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - Bold typography & shapes */}
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
  )
}
