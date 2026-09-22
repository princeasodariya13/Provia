import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works — Online Portfolio Generator & Creation Steps",
  description:
    "Learn how Provia works as your personal portfolio maker and career portfolio generator in 4 seamless steps, from resume to portfolio website.",
  keywords: [
    "online portfolio generator",
    "personal portfolio maker",
    "career portfolio generator",
    "professional website generator",
    "GitHub to portfolio",
    "resume to portfolio",
  ],
  alternates: {
    canonical: "/how-it-works",
  },
};

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col w-full min-h-screen bg-background relative pt-24">
        {/* Abstract Background Element */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[10%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-beige opacity-20 mix-blend-multiply" />
        </div>

        <div className="relative z-10 w-full flex-grow pb-12 md:pb-24 px-4">
          <HowItWorks />
        </div>
      </main>
      <Footer />
    </>
  );
}
