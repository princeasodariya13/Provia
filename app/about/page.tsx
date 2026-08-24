import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col w-full min-h-screen bg-background relative pt-32 pb-16 px-4 md:px-12 xl:px-24">
        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center text-sm font-bold text-text-secondary hover:text-brand transition-colors">
              <IconArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
          <div className="mb-8 border border-border-strong px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-text-primary bg-surface inline-block">
            Our Story
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary mb-12">
            About Provia
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-text-secondary text-xl leading-relaxed mb-8">
              Provia is the premier portfolio generation platform designed specifically for professionals who demand a polished, intentional presence on the web.
            </p>
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              We believe that your career history is more than just a list of jobs—it's a narrative. Our mission is to help you articulate that narrative through stunning, editorial-grade designs that stand out to top-tier recruiters.
            </p>
            <p className="text-text-secondary text-lg leading-relaxed mb-8">
              Founded by a team of designers and engineers, we grew tired of seeing highly qualified professionals represented by generic, uninspired templates. We built Provia to bridge the gap between world-class design and automated data synchronization, giving you a beautiful portfolio without the maintenance overhead.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
