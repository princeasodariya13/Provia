"use client";
import React from "react";
import { LinkPreview } from "../ui/link-preview";

export function IntegrationsPreview() {
  return (
    <div className="flex justify-center items-center py-24 flex-col px-4 bg-background border-t border-border-light">
      <div className="text-center mb-12 max-w-2xl mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight mb-4">
          Seamless Integrations
        </h2>
        <p className="text-text-secondary text-sm md:text-base">
          Connect your existing digital identity. Provia perfectly integrates with the platforms you already use.
        </p>
      </div>

      <div className="text-text-secondary text-xl md:text-3xl max-w-3xl mx-auto mb-10 text-center leading-relaxed">
        Sync your entire contribution history from{" "}
        <LinkPreview url="https://github.com" className="font-bold text-text-primary">
          GitHub
        </LinkPreview>{" "}
        and map your professional experience directly into beautifully designed layouts powered by{" "}
        <LinkPreview url="https://nextjs.org" className="font-bold text-text-primary">
          Next.js
        </LinkPreview>{" "}
        and{" "}
        <LinkPreview url="https://tailwindcss.com" className="font-bold text-text-primary">
          Tailwind CSS
        </LinkPreview>.
      </div>
      
      <div className="text-text-secondary text-xl md:text-3xl max-w-3xl mx-auto text-center leading-relaxed">
        Instantly publish your editorial-grade portfolio to a custom{" "}
        <LinkPreview
          url="https://vercel.com"
          className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-brand to-brand-hover"
        >
          Vercel
        </LinkPreview>{" "}
        domain with one click.
      </div>
    </div>
  );
}
