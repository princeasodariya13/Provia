import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export default function BlogPage() {
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
            Journal
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary mb-8">
            The Editorial
          </h1>
          <p className="text-text-secondary text-lg md:text-xl leading-relaxed mb-12 border-b border-border-light pb-12">
            Insights, updates, and thoughts on career development, design, and engineering.
          </p>
          
          <div className="grid grid-cols-1 gap-12">
            <article className="group cursor-pointer border border-border-light p-6 md:p-8 rounded-lg bg-surface hover:border-brand transition-colors">
              <span className="text-xs font-bold uppercase tracking-widest text-brand mb-4 block">Product Update</span>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 group-hover:text-brand transition-colors">
                Introducing Provia 2.0: The New Standard for Portfolios
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                Today we're thrilled to announce the next generation of our portfolio builder, featuring enhanced AI extraction and completely revamped editorial templates.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">August 24, 2026</span>
                <span className="text-sm font-bold uppercase tracking-widest text-text-primary group-hover:text-brand transition-colors">Read Article &rarr;</span>
              </div>
            </article>

            <article className="group cursor-pointer border border-border-light p-6 md:p-8 rounded-lg bg-surface hover:border-brand transition-colors">
              <span className="text-xs font-bold uppercase tracking-widest text-brand mb-4 block">Design Thinking</span>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 group-hover:text-brand transition-colors">
                Why Typography Matters More Than Ever
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-6">
                In an era of endless scrolling and decreasing attention spans, typography is your secret weapon for maintaining engagement and establishing credibility.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-secondary">August 10, 2026</span>
                <span className="text-sm font-bold uppercase tracking-widest text-text-primary group-hover:text-brand transition-colors">Read Article &rarr;</span>
              </div>
            </article>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
