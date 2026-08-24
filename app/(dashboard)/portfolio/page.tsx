/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Monitor, Smartphone, Tablet, ChevronLeft, Globe,
  Layout, Type, Palette, Settings, History,
  Layers, CheckCircle2, Eye, Link as LinkIcon,
  Share2, Copy, ExternalLink, Zap, RefreshCw,
  RotateCcw, X, Circle, ArrowRight, Lock
} from "lucide-react";

import { StudioSidebar } from "./components/StudioSidebar";
import { StudioInspector } from "./components/StudioInspector";
import { StudioPreview } from "./components/StudioPreview";
import { ReadinessModal } from "./components/ReadinessModal";

export type StudioTab = "content" | "design" | "sections" | "seo" | "history" | "publish" | "settings";
export type ContentSection = "hero" | "about" | "experience" | "education" | "skills" | "projects" | "certifications" | "contact";
export type PreviewDevice = "desktop" | "tablet" | "mobile";

export default function PortfolioStudioPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [regeneratingLink, setRegeneratingLink] = useState(false);

  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);
  const [document, setDocument] = useState<PortfolioDocumentDTO | null>(null);
  const [templateId, setTemplateId] = useState<string>("editorial-v1");
  const [publication, setPublication] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<StudioTab>("content");
  const [activeSection, setActiveSection] = useState<ContentSection>("hero");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Readiness State
  const [readinessOpen, setReadinessOpen] = useState(false);
  const [readinessChecks, setReadinessChecks] = useState<any[]>([]);

  // Share/Publish modal
  const [publishSuccessOpen, setPublishSuccessOpen] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");

  const loadStudio = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiClient.get<any>("/api/v1/portfolio/studio");
      if (res.success && res.data) {
        setPortfolioId(res.data.id);
        setVersion(res.data.version);
        setDocument(res.data.content);
        setTemplateId(res.data.templateId || "editorial-v1");
        setPublication(res.data.publication);
        setVersions(res.data.versions || []);
        if (!res.data.content) setActiveTab("design");
      }
    } catch {
      toast.error("Failed to load Portfolio Studio.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) loadStudio();
  }, [user, authLoading, loadStudio]);

  const handleDocumentChange = (updater: (doc: PortfolioDocumentDTO) => PortfolioDocumentDTO) => {
    if (!document) return;
    const newDoc = updater(document);
    setDocument(newDoc);
    setSaveStatus("unsaved");

    // Debounced autosave
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newDoc, templateId);
    }, 2000);
  };

  const handleSave = async (docToSave = document, tId = templateId) => {
    if (!docToSave || !portfolioId) return;
    setSaveStatus("saving");
    try {
      const res = await apiClient.post<any>("/api/v1/portfolio/studio", {
        content: docToSave,
        templateId: tId
      });
      if (res.success) {
        setSaveStatus("saved");
        setVersion(res.data.version);
        // Quietly refresh versions
        apiClient.get<any>("/api/v1/portfolio/versions").then(vRes => {
          if (vRes.success) setVersions(vRes.data || []);
        });
      } else {
        setSaveStatus("unsaved");
        toast.error(res.error || "Failed to save changes.");
      }
    } catch {
      setSaveStatus("unsaved");
      toast.error("Network error while saving.");
    }
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    handleSave();
    toast.success("Changes saved.");
  };

  const handleTemplateChange = (tid: string) => {
    setTemplateId(tid);
    if (portfolioId) {
      handleSave(document, tid);
      toast.success(`Template changed to ${TemplateRegistry.getTemplate(tid)?.metadata.name || tid}.`);
    } else {
      toast.info("Template selected. Generate your portfolio to apply it.");
    }
  };

  const handlePublish = async () => {
    if (!portfolioId) {
      toast.error("No portfolio to publish. Generate one first.");
      return;
    }

    setPublishing(true);
    try {
      const res = await apiClient.post<any>(`/api/v1/portfolio/${portfolioId}/publish`, {});
      if (res.success && res.data) {
        const appUrl = window.location.origin;
        const fullUrl = res.data.publicUrl?.startsWith("/")
          ? `${appUrl}${res.data.publicUrl}`
          : res.data.publicUrl;
        setPublishedUrl(fullUrl);
        setPublishSuccessOpen(true);
        // Refresh publication state
        await loadStudio();
      } else {
        toast.error(res.error || "Failed to publish portfolio.");
      }
    } catch {
      toast.error("Network error while publishing.");
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!portfolioId) return;
    setPublishing(true);
    try {
      const res = await apiClient.post<any>(`/api/v1/portfolio/${portfolioId}/unpublish`, {});
      if (res.success) {
        toast.success("Portfolio unpublished. It is no longer publicly accessible.");
        setPublication((prev: any) => prev ? { ...prev, isActive: false } : null);
      } else {
        toast.error(res.error || "Failed to unpublish.");
      }
    } catch {
      toast.error("Network error while unpublishing.");
    } finally {
      setPublishing(false);
    }
  };

  const handleGenerateAI = async () => {
    if (document && saveStatus === "unsaved") {
      const confirm = window.confirm("You have unsaved changes. Generating a new portfolio will create a new version. Continue?");
      if (!confirm) return;
    }

    setGenerating(true);
    try {
      // 1. Check readiness
      const readyRes = await apiClient.get<any>("/api/v1/portfolio/readiness");
      if (readyRes.success && readyRes.data && !readyRes.data.isReady) {
        setReadinessChecks(readyRes.data.checks);
        setReadinessOpen(true);
        setGenerating(false);
        return;
      }

      // 2. Proceed to generate
      const res = await apiClient.post<any>("/api/v1/portfolio", { templateId });
      if (res.success && res.data) {
        toast.success("Portfolio generated successfully!");
        setPortfolioId(res.data.id);
        setVersion(res.data.version);
        setDocument(res.data.content);
        setTemplateId(res.data.templateId || templateId);
        setSaveStatus("saved");

        const vRes = await apiClient.get<any>("/api/v1/portfolio/versions");
        if (vRes.success) setVersions(vRes.data || []);

        // Switch to content tab to show generated content
        setActiveTab("content");
      } else {
        toast.error(res.error || "Failed to generate portfolio.");
      }
    } catch {
      toast.error("Network error during generation.");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateLink = async () => {
    setRegeneratingLink(true);
    try {
      const res = await apiClient.post<any>("/api/v1/portfolio/regenerate-link", {});
      if (res.success) {
        toast.success("Portfolio link regenerated.");
        await loadStudio();
      } else {
        toast.error(res.error || "Failed to regenerate link.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setRegeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    const url = publishedUrl || (publication?.publicUrl
      ? (publication.publicUrl.startsWith("/") ? `${window.location.origin}${publication.publicUrl}` : publication.publicUrl)
      : null);
    if (!url) {
      toast.error("No published URL available.");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Failed to copy. Please copy manually.");
    }
  };

  const handleRestoreVersion = async (vId: string) => {
    try {
      const res = await apiClient.post<any>(`/api/v1/portfolio/versions/${vId}/restore`, {});
      if (res.success) {
        toast.success("Version restored as a new draft.");
        await loadStudio();
      } else {
        toast.error(res.error || "Failed to restore version.");
      }
    } catch {
      toast.error("Network error.");
    }
  };

  const publicUrl = publication?.publicUrl
    ? (publication.publicUrl.startsWith("/") ? `${typeof window !== "undefined" ? window.location.origin : ""}${publication.publicUrl}` : publication.publicUrl)
    : null;

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Loading Portfolio Studio...</p>
        </div>
      </div>
    );
  }

  const isPublished = publication?.isActive;
  const hasDocument = !!document;

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* ── TOP BAR ── */}
      <header className="h-14 border-b border-border-light bg-surface shrink-0 flex items-center justify-between px-3 sm:px-4 select-none gap-2">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors text-xs font-bold shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:block">Dashboard</span>
          </Link>
          <div className="hidden sm:block w-px h-5 bg-border-light" />
          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-xs font-bold text-text-primary leading-tight">Portfolio Studio</span>
            <div className="flex items-center gap-1 text-[10px] text-text-secondary font-medium">
              {version > 0 && <span>v{version}</span>}
              {version > 0 && <span>·</span>}
              <span className={saveStatus === 'unsaved' ? 'text-warning' : saveStatus === 'saving' ? 'text-text-muted animate-pulse' : 'text-text-muted'}>
                {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'All changes saved' : 'Unsaved changes'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: device switcher */}
        <div className="flex items-center bg-surface-muted border border-border-light rounded-lg p-0.5 gap-0.5">
          {(["desktop", "tablet", "mobile"] as PreviewDevice[]).map(d => {
            const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
            return (
              <button
                key={d}
                onClick={() => setPreviewDevice(d)}
                className={`p-1.5 rounded-md transition-colors ${previewDevice === d ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                title={`${d.charAt(0).toUpperCase() + d.slice(1)} Preview`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            );
          })}
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {hasDocument && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={saving || saveStatus === "saved"}
              className="h-8 text-xs font-bold hidden sm:flex"
            >
              Save
            </Button>
          )}

          {isPublished && publicUrl && (
            <Button variant="outline" size="sm" asChild className="h-8 text-xs font-bold hidden md:flex">
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Live
              </a>
            </Button>
          )}

          {isPublished ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 text-xs font-bold"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:block">Copy Link</span>
            </Button>
          ) : null}

          <Button
            size="sm"
            onClick={hasDocument ? handlePublish : handleGenerateAI}
            disabled={publishing || generating}
            className={`h-8 text-xs font-bold shadow-sm ${hasDocument ? 'bg-success hover:bg-success text-white' : 'bg-brand hover:bg-brand-hover text-white'}`}
          >
            {publishing ? "Publishing…" : generating ? "Generating…" : hasDocument ? (isPublished ? "Republish" : "Publish") : "Generate"}
          </Button>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <StudioSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          document={document}
          handleGenerateAI={handleGenerateAI}
          generating={generating}
        />

        {/* Center: Preview */}
        <StudioPreview
          document={document}
          templateId={templateId}
          previewDevice={previewDevice}
          activeTab={activeTab}
          onSelectTemplate={handleTemplateChange}
        />

        {/* Right: Inspector */}
        <StudioInspector
          activeTab={activeTab}
          activeSection={activeSection}
          document={document}
          onChange={handleDocumentChange}
          templateId={templateId}
          setTemplateId={handleTemplateChange}
          publication={publication}
          versions={versions}
          onRestore={handleRestoreVersion}
          onUnpublish={handleUnpublish}
          onPublish={handlePublish}
          publishing={publishing}
          isPublished={isPublished}
          publicUrl={publicUrl}
          onCopyLink={handleCopyLink}
          onRegenerateLink={handleRegenerateLink}
          regeneratingLink={regeneratingLink}
          onGenerate={handleGenerateAI}
          generating={generating}
        />
      </div>

      {/* Readiness Modal */}
      <ReadinessModal
        isOpen={readinessOpen}
        onClose={() => setReadinessOpen(false)}
        checks={readinessChecks}
      />

      {/* Publish Success Modal */}
      {publishSuccessOpen && (
        <PublishSuccessModal
          url={publishedUrl}
          onClose={() => setPublishSuccessOpen(false)}
          onCopy={handleCopyLink}
        />
      )}
    </div>
  );
}

// ── PUBLISH SUCCESS MODAL ──────────────────────────────────────────────────
function PublishSuccessModal({
  url,
  onClose,
  onCopy,
}: {
  url: string;
  onClose: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border border-border-light rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border-light relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Your portfolio is live!</h2>
          </div>
          <p className="text-sm text-text-secondary ml-12">Your portfolio is now publicly accessible.</p>
        </div>

        {/* URL display */}
        <div className="p-6 bg-surface-muted/30">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">Public URL</label>
          <div className="flex items-center gap-2 p-3 bg-surface border border-border-light rounded-xl">
            <Globe className="w-4 h-4 text-success shrink-0" />
            <span className="text-sm font-medium text-text-primary truncate flex-1">{url}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border-light flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onCopy}
            variant="outline"
            className="flex-1 font-bold h-10"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button
            asChild
            className="flex-1 font-bold h-10 bg-brand hover:bg-brand-hover text-white"
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Portfolio
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
