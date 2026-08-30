"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { PreviewDevice, StudioTab } from "../page";
import { LayoutTemplate, Zap, ArrowLeft, Minimize } from "lucide-react";

import { TemplateGallery } from "./TemplateGallery";
import { mockPortfolioDocument } from "@/lib/portfolio/templates/shared/mock";
import { TemplateLoader } from "@/components/ui/template-loader";

interface Props {
  document: PortfolioDocumentDTO | null;
  templateId: string;
  previewDevice: PreviewDevice;
  activeTab: string;
  setActiveTab: (tab: StudioTab) => void;
  onSelectTemplate: (id: string) => void;
}

const DEVICE_STYLES: Record<PreviewDevice, string> = {
  desktop: "w-full",
  tablet: "w-[768px] max-w-full",
  mobile: "w-[390px] max-w-full",
};

const DEVICE_SCALE: Record<PreviewDevice, string> = {
  desktop: "",
  tablet: "scale-[0.85] origin-top",
  mobile: "scale-[0.7] origin-top",
};

export function StudioPreview({ document, templateId, previewDevice, activeTab, setActiveTab, onSelectTemplate }: Props) {
  const templateDef = TemplateRegistry.getTemplate(templateId) || TemplateRegistry.getTemplate(TemplateRegistry.getDefaultTemplateId());

  const containerRef = useRef<HTMLDivElement>(null);
  const [deviceScale, setDeviceScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!window.document.fullscreenElement);
    };
    window.document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => window.document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        if (previewDevice === "mobile") {
          setDeviceScale(Math.max(0.3, Math.min(1, (height - 60) / 852)));
        } else if (previewDevice === "tablet") {
          setDeviceScale(Math.max(0.3, Math.min(1, (height - 60) / 1180)));
        } else {
          setDeviceScale(1);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [previewDevice, activeTab]);

  // Design tab: show full-screen template gallery
  if (activeTab === "design") {
    return (
      <div className="flex-1 overflow-hidden">
        <TemplateGallery
          document={document || mockPortfolioDocument}
          currentTemplateId={templateId}
          onSelectTemplate={onSelectTemplate}
          onClose={() => {}}
        />
      </div>
    );
  }

  // No portfolio generated yet
  if (!document) {
    return (
      <div className="flex-1 bg-surface-muted/30 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-5">
            <LayoutTemplate className="w-7 h-7 text-brand" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">No Portfolio Yet</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            Generate your portfolio to see a live preview here. Your real profile data will be used to populate the template.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
            <Zap className="w-3.5 h-3.5 text-brand" />
            <span>Click <strong>Generate with AI</strong> in the sidebar to get started</span>
          </div>
        </div>
      </div>
    );
  }

  if (!templateDef) {
    return (
      <div className="flex-1 bg-surface-muted/30 flex items-center justify-center p-8">
        <div className="text-center">
          <LayoutTemplate className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Template not found. Please select another template.</p>
        </div>
      </div>
    );
  }

  const TemplateComponent = templateDef.component;
  const deviceWidth = DEVICE_STYLES[previewDevice];

  return (
    <div className="flex-1 bg-surface-muted flex justify-center relative overflow-hidden">
      {/* Device frame indicator */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-surface border border-border-light rounded-full px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider shadow-sm">
        {templateDef.metadata.name} · {previewDevice}
      </div>

      {/* Back to Design Templates Button */}
      <button 
        onClick={() => setActiveTab("design")}
        className="absolute top-3 left-4 z-10 flex items-center gap-1.5 bg-surface border border-border-light rounded-full px-3 py-1 text-[10px] font-bold text-text-secondary hover:text-text-primary hover:border-border-strong uppercase tracking-wider shadow-sm transition-all"
      >
        <ArrowLeft className="w-3 h-3" /> Back to Design
      </button>

      <div id="studio-preview-pane" ref={containerRef} className="w-full h-full flex justify-center items-center overflow-hidden relative bg-surface-muted" data-lenis-prevent>
        {isFullscreen && (
          <button
            onClick={() => window.document.exitFullscreen()}
            className="absolute top-6 right-6 z-[9999] flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-xl border border-white/10"
          >
            <Minimize className="w-4 h-4" />
            Exit Fullscreen
          </button>
        )}
        
        {previewDevice === "desktop" ? (
          <div
            className="w-full h-full bg-background shadow-2xl transition-all duration-300 relative overflow-y-auto"
            style={{ transform: "scale(1)", transformOrigin: "top center" }}
            data-lenis-prevent
          >
            <TemplateLoader />
            <TemplateBoundary templateName={templateDef.metadata.name}>
              <TemplateComponent document={document} />
            </TemplateBoundary>
          </div>
        ) : previewDevice === "mobile" ? (
          <div 
            className="flex-shrink-0 w-[393px] h-[852px] bg-[#000] rounded-[3.5rem] p-4 shadow-[0_0_0_2px_#333,0_20px_40px_rgba(0,0,0,0.4)] relative transition-all duration-300 border-[4px] border-[#111]"
            style={{ transform: `scale(${deviceScale})`, transformOrigin: "center center" }}
          >
            {/* Dynamic Island / Notch */}
            <div className="absolute top-4 inset-x-0 h-7 flex justify-center z-20 pointer-events-none">
              <div className="w-32 h-7 bg-black rounded-full"></div>
            </div>
            
            <ResponsiveIframe
              theme={document?.configuration?.theme}
              className="w-full h-full bg-background rounded-[2.25rem] overflow-hidden border-none relative"
            >
              <TemplateLoader />
              <TemplateBoundary templateName={templateDef.metadata.name}>
                <TemplateComponent document={document} />
              </TemplateBoundary>
            </ResponsiveIframe>
          </div>
        ) : (
          <div 
            className="flex-shrink-0 w-[820px] h-[1180px] bg-[#000] rounded-[2rem] p-4 shadow-[0_0_0_2px_#333,0_20px_40px_rgba(0,0,0,0.4)] relative transition-all duration-300 border-[4px] border-[#111]"
            style={{ transform: `scale(${deviceScale})`, transformOrigin: "center center" }}
          >
            {/* Camera dot */}
            <div className="absolute top-0 inset-x-0 h-4 flex justify-center items-center z-20 pointer-events-none">
              <div className="w-1.5 h-1.5 bg-neutral-800 rounded-full"></div>
            </div>
            
            <ResponsiveIframe
              theme={document?.configuration?.theme}
              className="w-full h-full bg-background rounded-[1.75rem] overflow-hidden border-none relative"
            >
              <TemplateLoader />
              <TemplateBoundary templateName={templateDef.metadata.name}>
                <TemplateComponent document={document} />
              </TemplateBoundary>
            </ResponsiveIframe>
          </div>
        )}
      </div>
    </div>
  );
}

function ResponsiveIframe({
  children,
  className,
  style,
  theme
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  theme?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    // Copy all style and link tags from parent document
    const updateHead = () => {
      doc.head.innerHTML = "";
      document.head.querySelectorAll("style, link[rel='stylesheet']").forEach(node => {
        doc.head.appendChild(node.cloneNode(true));
      });
    };
    
    updateHead();

    // In Next.js dev mode, styles can be injected dynamically. Observe head changes.
    const observer = new MutationObserver(() => {
      updateHead();
    });
    observer.observe(document.head, { childList: true, subtree: true });

    // Copy parent document themes (e.g. dark mode classes)
    doc.documentElement.className = "";
    doc.documentElement.style.cssText = document.documentElement.style.cssText;
    doc.body.className = "";
    doc.body.style.cssText = document.body.style.cssText;
    doc.body.style.overflow = "auto";
    doc.body.style.height = "100%";

    let container = doc.getElementById("preview-root");
    if (!container) {
      container = doc.createElement("div");
      container.id = "preview-root";
      doc.body.appendChild(container);
    }
    setMountNode(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Remove dynamic theme updates
  useEffect(() => {
    // Theme functionality temporarily disabled per user request
  }, [theme]);

  return (
    <iframe ref={iframeRef} className={className} style={style} title="Mobile Preview">
      {mountNode && createPortal(children, mountNode)}
    </iframe>
  );
}

// Error boundary to prevent template errors from crashing the studio
class TemplateBoundary extends React.Component<
  { children: React.ReactNode; templateName: string },
  { hasError: boolean; error?: string }
> {
  constructor(props: { children: React.ReactNode; templateName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-muted p-8">
          <div className="text-center max-w-md">
            <LayoutTemplate className="w-10 h-10 text-border-strong mx-auto mb-3" />
            <h3 className="text-base font-bold text-text-primary mb-2">Template Preview Unavailable</h3>
            <p className="text-sm text-text-secondary">
              The <strong>{this.props.templateName}</strong> template encountered a rendering error. Try selecting a different template.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <p className="text-xs text-error mt-3 font-mono">{this.state.error}</p>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
