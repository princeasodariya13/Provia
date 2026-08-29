import React, { useState } from "react";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Search, Image as ImageIcon, Share2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

interface Props {
  document: PortfolioDocumentDTO | null;
  onChange: (updater: (doc: PortfolioDocumentDTO) => PortfolioDocumentDTO) => void;
  publicUrl?: string;
}

export function StudioSeoEditor({ document, onChange, publicUrl }: Props) {
  const [previewTab, setPreviewTab] = useState<"google" | "social">("google");

  if (!document) {
    return (
      <div className="flex-1 bg-surface-muted/30 flex items-center justify-center p-8">
        <p className="text-sm text-text-secondary">Generate a portfolio first to edit SEO settings.</p>
      </div>
    );
  }

  const title = document.seo?.title || `${document.hero?.name || "Professional"} | Portfolio`;
  const description = document.seo?.description || document.about?.summary?.substring(0, 160) || "Professional Portfolio";
  const url = publicUrl || "https://provia.app/your-username/portfolio";
  const keywords = document.seo?.keywords || "";
  const noIndex = document.seo?.noIndex || false;

  // SEO Health Score Calculation
  let score = 0;
  let titleFeedback = "Title is missing.";
  if (title) {
    score += 30;
    if (title.length >= 40 && title.length <= 60) {
      score += 10;
      titleFeedback = "Perfect length (40-60 chars).";
    } else {
      titleFeedback = title.length > 60 ? "Title is a bit too long." : "Title is a bit short.";
    }
  }

  let descFeedback = "Description is missing.";
  if (description) {
    score += 30;
    if (description.length >= 120 && description.length <= 160) {
      score += 10;
      descFeedback = "Perfect length (120-160 chars).";
    } else {
      descFeedback = description.length > 160 ? "Description is too long." : "Description is a bit short.";
    }
  }

  let keyFeedback = "No focus keywords added.";
  if (keywords.trim().length > 0) {
    score += 20;
    keyFeedback = "Keywords optimized.";
  }

  const getScoreColor = (s: number) => {
    if (s >= 90) return "text-success border-success bg-success/10";
    if (s >= 50) return "text-warning border-warning bg-warning/10";
    return "text-error border-error bg-error/10";
  };

  const getBarColor = (s: number) => {
    if (s >= 90) return "bg-success";
    if (s >= 50) return "bg-warning";
    return "bg-error";
  };

  return (
    <div
      className="flex-1 bg-[#FAFAFA] overflow-y-auto p-6 md:p-10 lg:p-12 font-sans text-text-primary"
      data-lenis-prevent
    >
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-light pb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-text-primary flex items-center gap-2 mb-2">
              <Search className="w-6 h-6 text-brand" />
              SEO & Metadata
            </h2>
            <p className="text-text-secondary text-sm font-medium">
              Optimize your portfolio for search engines and social media sharing.
            </p>
          </div>
          {noIndex && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-bold uppercase tracking-wider">
              <EyeOff className="w-3.5 h-3.5" /> Hidden from Search
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Health Audit */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-border-light rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">SEO Health Score</h3>

              <div className="flex items-center gap-5 mb-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 font-black text-2xl ${getScoreColor(score)}`}>
                  {score}
                </div>
                <div>
                  <div className="text-sm font-bold text-text-primary mb-1">
                    {score >= 90 ? "Excellent" : score >= 50 ? "Needs Improvement" : "Action Required"}
                  </div>
                  <div className="text-xs text-text-secondary leading-snug">
                    Complete all fields to maximize your search visibility.
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {title ? <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />}
                  <div>
                    <div className="text-xs font-bold text-text-primary">Meta Title</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">{titleFeedback}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {description ? <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />}
                  <div>
                    <div className="text-xs font-bold text-text-primary">Meta Description</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">{descFeedback}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {keywords ? <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 text-border-strong mt-0.5 shrink-0" />}
                  <div>
                    <div className="text-xs font-bold text-text-primary">Focus Keywords</div>
                    <div className="text-[11px] text-text-secondary mt-0.5">{keyFeedback}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand/5 border border-brand/20 rounded-2xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-brand flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4" />
                Dynamic Open Graph
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Provia automatically generates beautiful OG images for social media using your chosen template's design system. You don't need to manually upload preview images.
              </p>
            </div>
          </div>

          {/* Right Column: Editor & Previews */}
          <div className="lg:col-span-8 space-y-6">

            <div className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border-light bg-surface-muted/10">
                <h3 className="text-sm font-extrabold text-text-primary">Search Metadata</h3>
                <p className="text-xs text-text-secondary mt-1">Define exactly how you appear on Google.</p>
              </div>
              <div className="p-6 space-y-6">

                {/* Meta Title */}
                <div className="space-y-2 relative">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex justify-between">
                    Meta Title
                    <span className={(document.seo?.title || "").length > 60 ? "text-error" : "text-text-muted"}>
                      {(document.seo?.title || "").length} / 60
                    </span>
                  </label>
                  <input
                    type="text"
                    value={document.seo?.title || ""}
                    onChange={(e) => onChange(doc => ({ ...doc, seo: { ...doc.seo, title: e.target.value } }))}
                    placeholder={`${document.hero?.name || "Professional"} | Portfolio`}
                    className="flex h-10 w-full border border-border-light bg-white px-3 py-2 text-sm font-medium text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong rounded-xl transition-colors"
                  />
                  <div className="w-full h-1 bg-surface-muted mt-1.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${getBarColor((document.seo?.title || "").length > 60 ? 0 : (document.seo?.title || "").length * 1.66)}`} style={{ width: `${Math.min(((document.seo?.title || "").length / 60) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Meta Description */}
                <div className="space-y-2 relative">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex justify-between">
                    Meta Description
                    <span className={(document.seo?.description || "").length > 160 ? "text-error" : "text-text-muted"}>
                      {(document.seo?.description || "").length} / 160
                    </span>
                  </label>
                  <textarea
                    value={document.seo?.description || ""}
                    onChange={(e) => onChange(doc => ({ ...doc, seo: { ...doc.seo, description: e.target.value } }))}
                    placeholder="E.g., Senior Full-Stack Engineer specializing in React, Node.js, and cloud architecture..."
                    className="flex w-full border border-border-light bg-white px-3 py-2 text-sm font-medium text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong rounded-xl min-h-[100px] resize-none leading-relaxed transition-colors"
                  />
                  <div className="w-full h-1 bg-surface-muted mt-1.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${getBarColor((document.seo?.description || "").length > 160 ? 0 : (document.seo?.description || "").length * 0.625)}`} style={{ width: `${Math.min(((document.seo?.description || "").length / 160) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    Focus Keywords
                  </label>
                  <input
                    type="text"
                    value={document.seo?.keywords || ""}
                    onChange={(e) => onChange(doc => ({ ...doc, seo: { ...doc.seo, keywords: e.target.value } }))}
                    placeholder="software engineer, react developer, nextjs portfolio"
                    className="flex h-10 w-full border border-border-light bg-white px-3 py-2 text-sm font-medium text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong rounded-xl transition-colors"
                  />
                  <p className="text-[10px] text-text-muted">Separate multiple keywords with commas.</p>
                </div>

              </div>
            </div>

            <div className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border-light flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-text-primary">Search Engine Visibility</h3>
                  <p className="text-xs text-text-secondary mt-1">Control if search engines index this portfolio.</p>
                </div>
                <div className="flex bg-surface-muted/50 p-1 rounded-lg border border-border-light">
                  <button
                    onClick={() => onChange(doc => ({ ...doc, seo: { ...doc.seo, noIndex: false } }))}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${!noIndex ? 'bg-white shadow-sm text-success border border-border-light' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    Visible
                  </button>
                  <button
                    onClick={() => onChange(doc => ({ ...doc, seo: { ...doc.seo, noIndex: true } }))}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${noIndex ? 'bg-white shadow-sm text-warning border border-border-light' : 'text-text-muted hover:text-text-primary'}`}
                  >
                    Hidden
                  </button>
                </div>
              </div>
              <div className="p-5 bg-surface-muted/10">
                <p className="text-xs text-text-secondary">
                  {noIndex
                    ? "Currently HIDDEN. Search engines like Google will be asked not to index your portfolio."
                    : "Currently VISIBLE. Search engines are allowed to crawl and index your portfolio."}
                </p>
              </div>
            </div>

            {/* Live Previews */}
            <div className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm">
              <div className="border-b border-border-light bg-surface-muted/10 flex gap-1 px-2 pt-2">
                <button
                  onClick={() => setPreviewTab("google")}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${previewTab === "google" ? "border-brand text-brand" : "border-transparent text-text-muted hover:text-text-primary"}`}
                >
                  Google Preview
                </button>
                <button
                  onClick={() => setPreviewTab("social")}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${previewTab === "social" ? "border-brand text-brand" : "border-transparent text-text-muted hover:text-text-primary"}`}
                >
                  Social Preview
                </button>
              </div>

              <div className="p-8 flex items-center justify-center bg-[#F9FAFB]">
                {previewTab === "google" ? (
                  <div className="w-full max-w-xl bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#E5E7EB]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center border border-border-light shadow-sm shrink-0">
                        <Globe className="w-4 h-4 text-text-muted" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="block text-sm text-[#202124] hover:underline truncate" style={{ fontFamily: 'arial, sans-serif' }}>{url}</a>
                      </div>
                    </div>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block text-xl text-[#1a0dab] hover:underline truncate" style={{ fontFamily: 'arial, sans-serif' }}>
                      {title}
                    </a>
                    <div className="text-[14px] text-[#4d5156] mt-1 leading-snug break-words line-clamp-2" style={{ fontFamily: 'arial, sans-serif' }}>
                      {description}
                    </div>
                  </div>
                ) : (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full max-w-[420px] bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-shadow cursor-pointer">
                    {/* Simulated OG Image Background */}
                    <div className="w-full h-[220px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 relative group overflow-hidden">
                      {/* Premium Grid Pattern */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />

                      {/* Glow Effect */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand/20 blur-[80px] rounded-full pointer-events-none" />

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center mb-4 border border-white/20 shadow-2xl ring-4 ring-black/10">
                          <span className="text-2xl font-black text-white">{document.hero?.name?.charAt(0) || "P"}</span>
                        </div>
                        <p className="text-white font-black text-2xl tracking-tight drop-shadow-xl truncate w-full">
                          {title}
                        </p>
                        <p className="text-white/70 font-semibold text-sm drop-shadow-md truncate w-full mt-1.5 px-4">
                          {document.hero?.headline}
                        </p>
                      </div>
                    </div>
                    {/* Twitter Card Meta Area */}
                    <div className="p-4 bg-white">
                      <div className="text-[13px] text-[#536471] mb-0.5 truncate">provia.app</div>
                      <div className="text-[15px] font-bold text-[#0F1419] truncate leading-tight mb-0.5">{title}</div>
                      <div className="text-[14px] text-[#536471] truncate line-clamp-2 leading-snug">{description}</div>
                    </div>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
