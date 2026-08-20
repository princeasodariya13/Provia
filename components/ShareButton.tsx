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
      className="fixed bottom-6 right-6 z-50 bg-accent text-white px-4 py-3 font-bold uppercase tracking-widest text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label="Share Portfolio"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  );
}
