"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (err) {
        // Fallback if sharing is aborted or fails
        console.log("Sharing failed or aborted:", err);
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard write failed:", err);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="fixed bottom-6 right-6 z-50 group bg-brand hover:bg-brand-hover text-white rounded-full px-5 py-3 font-bold uppercase tracking-widest text-sm flex items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(204,41,54,0.3)] active:scale-95"
      aria-label="Share Portfolio"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
          Share
        </>
      )}
    </button>
  );
}
