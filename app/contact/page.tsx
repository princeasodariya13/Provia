/* eslint-disable react/no-unescaped-entities */
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export default function ContactPage() {
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
            Inquiries
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-text-primary mb-6">
            Get in touch
          </h1>
          <p className="text-text-secondary text-lg md:text-xl leading-relaxed mb-12 border-b border-border-light pb-12">
            Have questions about Provia? Interested in enterprise plans? We'd love to hear from you. Fill out the form below and our team will get back to you shortly.
          </p>
          
          <form className="flex flex-col gap-6 max-w-2xl bg-surface p-6 md:p-8 border border-border-light rounded-lg">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-bold text-text-primary uppercase tracking-widest">Full Name</label>
              <input type="text" id="name" className="bg-background border border-border-strong rounded-none px-4 py-3 text-text-primary focus:outline-none focus:border-brand transition-colors" placeholder="Your name" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-bold text-text-primary uppercase tracking-widest">Email Address</label>
              <input type="email" id="email" className="bg-background border border-border-strong rounded-none px-4 py-3 text-text-primary focus:outline-none focus:border-brand transition-colors" placeholder="provia@email.com" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-xs font-bold text-text-primary uppercase tracking-widest">Message</label>
              <textarea id="message" rows={5} className="bg-background border border-border-strong rounded-none px-4 py-3 text-text-primary focus:outline-none focus:border-brand resize-none transition-colors" placeholder="How can we help?"></textarea>
            </div>
            <div className="mt-6">
               <HoverBorderGradient
                  as="button"
                  containerClassName="border-0 rounded-none bg-transparent w-full sm:w-auto"
                  className="h-12 px-10 text-sm font-bold uppercase tracking-widest rounded-none bg-brand text-white hover:bg-brand-hover shadow-none flex items-center justify-center w-full"
                >
                  Send Message
                </HoverBorderGradient>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
