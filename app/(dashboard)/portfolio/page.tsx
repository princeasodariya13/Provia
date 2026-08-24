/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Monitor, Smartphone, Tablet, ChevronLeft, Save, Globe, 
  Layout, Type, Palette, Settings, History, 
  Layers, CheckCircle2, ChevronRight, Check, Eye, Link as LinkIcon
} from "lucide-react";

// Fallback for toast if not available
const toast = {
  success: (msg: string) => console.log("SUCCESS:", msg),
  error: (msg: string) => alert(msg)
};
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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);
  const [document, setDocument] = useState<PortfolioDocumentDTO | null>(null);
  const [templateId, setTemplateId] = useState<string>("editorial-v1");
  const [publication, setPublication] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<StudioTab>("content");
  const [activeSection, setActiveSection] = useState<ContentSection>("hero");
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Save timeout for autosave (debounce)
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  // Readiness State
  const [readinessOpen, setReadinessOpen] = useState(false);
  const [readinessChecks, setReadinessChecks] = useState<any[]>([]);

  useEffect(() => {
    async function loadStudio() {
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
        } else {
          // Attempt to fetch normal if studio endpoint is missing
          const pRes = await apiClient.get<any>("/api/v1/portfolio");
          if (pRes.success && pRes.data) {
            setPortfolioId(pRes.data.id);
            setVersion(pRes.data.version);
            setDocument(pRes.data.content);
            setTemplateId(pRes.data.templateId || "editorial-v1");
            setPublication(pRes.data.publication);
            if (!pRes.data.content) setActiveTab("design");
            
            const vRes = await apiClient.get<any>("/api/v1/portfolio/versions");
            if (vRes.success) setVersions(vRes.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load studio", err);
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) loadStudio();
  }, [user, authLoading]);

  const handleDocumentChange = (updater: (doc: PortfolioDocumentDTO) => PortfolioDocumentDTO) => {
    if (!document) return;
    const newDoc = updater(document);
    setDocument(newDoc);
    setHasUnsavedChanges(true);
    setSaveStatus("unsaved");
    
    // Autosave
    if (saveTimeout) clearTimeout(saveTimeout);
    const timeout = setTimeout(() => {
      handleSave(newDoc, templateId);
    }, 2000);
    setSaveTimeout(timeout);
  };

  const handleSave = async (docToSave = document, tId = templateId) => {
    if (!docToSave || !portfolioId) return;
    setSaveStatus("saving");
    try {
      const res = await apiClient.post<any>(`/api/v1/portfolio/studio`, {
        content: docToSave,
        templateId: tId
      });
      if (res.success) {
        setSaveStatus("saved");
        setHasUnsavedChanges(false);
        setVersion(res.data.version);
        // refresh versions quietly
        apiClient.get<any>("/api/v1/portfolio/versions").then(vRes => {
          if (vRes.success) setVersions(vRes.data || []);
        });
      } else {
        setSaveStatus("unsaved");
        toast.error("Failed to save changes");
      }
    } catch (err) {
      setSaveStatus("unsaved");
      toast.error("Network error while saving");
    }
  };

  const handlePublish = async () => {
    if (!portfolioId) return;
    const confirm = window.confirm("Ready to publish? Your portfolio will become publicly accessible.");
    if (!confirm) return;
    
    setPublishing(true);
    try {
      const res = await apiClient.post<any>(`/api/v1/portfolio/${portfolioId}/publish`, {});
      if (res.success) {
        toast.success("Portfolio published successfully!");
        const pRes = await apiClient.get<any>("/api/v1/portfolio");
        if (pRes.success && pRes.data) {
          setPublication(pRes.data.publication);
        }
      } else {
        toast.error(res.error || "Failed to publish");
      }
    } catch (err) {
      toast.error("Network error while publishing");
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
        toast.success("Portfolio unpublished.");
        setPublication(null);
      } else {
        toast.error(res.error || "Failed to unpublish");
      }
    } catch (err) {
      toast.error("Network error while unpublishing");
    } finally {
      setPublishing(false);
    }
  };
  
  const handleGenerateAI = async () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm("You have unsaved changes. Generating a new portfolio will discard them. Continue?");
      if (!confirm) return;
    }
    
    setGenerating(true);
    try {
      // 1. Check readiness
      const readyRes = await apiClient.get<any>("/api/v1/portfolio/readiness");
      if (readyRes.success && readyRes.data) {
        if (!readyRes.data.isReady) {
          setReadinessChecks(readyRes.data.checks);
          setReadinessOpen(true);
          setGenerating(false);
          return;
        }
      }

      // 2. Proceed to generate
      const res = await apiClient.post<any>("/api/v1/portfolio", {});
      if (res.success) {
        toast.success("New AI portfolio draft generated!");
        setPortfolioId(res.data.id);
        setVersion(res.data.version);
        setDocument(res.data.content);
        setTemplateId(res.data.templateId || "editorial-v1");
        
        const vRes = await apiClient.get<any>("/api/v1/portfolio/versions");
        if (vRes.success) setVersions(vRes.data || []);
      } else {
        toast.error(res.error || "Failed to generate");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setGenerating(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-brand rounded-xl mb-4" />
          <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Loading Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* ── TOP BAR ── */}
      <header className="h-14 border-b border-border-light bg-surface shrink-0 flex items-center justify-between px-4 select-none">
        <div className="flex items-center gap-4 min-w-[240px]">
          <Link href="/dashboard" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-bold">
            <ChevronLeft className="w-4 h-4" />
            <div className="w-6 h-6 bg-brand flex items-center justify-center rounded shadow-sm ml-1 hidden md:flex">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
            Dashboard
          </Link>
          <div className="w-px h-6 bg-border-light hidden md:block" />
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-bold text-text-primary">Portfolio Studio</span>
            <div className="flex items-center gap-1.5 text-[10px] text-text-secondary font-medium">
              <span>v{version}</span>
              <span>•</span>
              <span className={`flex items-center gap-1 ${saveStatus === 'unsaved' ? 'text-amber-500' : 'text-text-secondary'}`}>
                {saveStatus === 'saving' && "Saving..."}
                {saveStatus === 'saved' && "Saved"}
                {saveStatus === 'unsaved' && "Unsaved changes"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-surface-muted border border-border-light rounded-lg p-1">
          <button onClick={() => setPreviewDevice("desktop")} className={`p-1.5 rounded-md transition-colors ${previewDevice === 'desktop' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`} title="Desktop Preview">
            <Monitor className="w-4 h-4" />
          </button>
          <button onClick={() => setPreviewDevice("tablet")} className={`p-1.5 rounded-md transition-colors ${previewDevice === 'tablet' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`} title="Tablet Preview">
            <Tablet className="w-4 h-4" />
          </button>
          <button onClick={() => setPreviewDevice("mobile")} className={`p-1.5 rounded-md transition-colors ${previewDevice === 'mobile' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`} title="Mobile Preview">
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 min-w-[240px] justify-end">
          {publication?.isActive && publication.publicUrl && (
            <Button variant="outline" size="sm" asChild className="hidden md:flex bg-white h-8 text-xs font-bold shadow-sm">
              <a href={publication.publicUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="w-3.5 h-3.5 mr-1.5" /> View Live
              </a>
            </Button>
          )}
          <Button 
            variant="default" 
            size="sm" 
            onClick={handlePublish} 
            disabled={publishing} 
            className="h-8 bg-success hover:bg-success text-white font-bold text-xs shadow-sm"
          >
            {publishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </header>

      {/* ── MAIN EDITOR LAYOUT ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <StudioSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          document={document}
          handleGenerateAI={handleGenerateAI}
          generating={generating}
        />

        {/* Center - Live Preview */}
        <StudioPreview 
          document={document} 
          templateId={templateId} 
          previewDevice={previewDevice}
          activeTab={activeTab}
          onSelectTemplate={(tid) => {
            setTemplateId(tid);
            handleSave(document, tid);
          }}
        />

        {/* Right Sidebar - Inspector */}
        <StudioInspector 
          activeTab={activeTab}
          activeSection={activeSection}
          document={document}
          onChange={handleDocumentChange}
          templateId={templateId}
          setTemplateId={(tid) => {
            setTemplateId(tid);
            handleSave(document, tid);
          }}
          publication={publication}
          versions={versions}
          onRestore={(vId) => {
            // Restore logic
            apiClient.post<any>(`/api/v1/portfolio/versions/${vId}/restore`, {}).then(res => {
              if (res.success) {
                toast.success("Restored version");
                window.location.reload();
              } else toast.error("Failed to restore");
            });
          }}
          onUnpublish={handleUnpublish}
        />
      </div>

      <ReadinessModal 
        isOpen={readinessOpen} 
        onClose={() => setReadinessOpen(false)} 
        checks={readinessChecks} 
      />
    </div>
  );
}
