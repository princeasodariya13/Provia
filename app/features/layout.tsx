import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReactNode } from "react";

export default function FeaturesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex flex-col w-full min-h-screen bg-background relative pt-24">
        {children}
      </main>
      <Footer />
    </>
  );
}
