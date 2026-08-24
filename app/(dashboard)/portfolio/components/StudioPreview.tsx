"use client";

import React from "react";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { PreviewDevice } from "../page";
import { LayoutTemplate, Zap } from "lucide-react";

import { TemplateGallery } from "./TemplateGallery";
import { mockPortfolioDocument } from "@/lib/portfolio/templates/shared/mock";

interface Props {
  document: PortfolioDocumentDTO | null;
  templateId: string;
  previewDevice: PreviewDevice;
  activeTab: string;
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

export function StudioPreview({ document, templateId, previewDevice, activeTab, onSelectTemplate }: Props) {
  const templateDef = TemplateRegistry.getTemplate(templateId) || TemplateRegistry.getTemplate(TemplateRegistry.getDefaultTemplateId());

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
    <div className="flex-1 bg-surface-muted overflow-y-auto flex justify-center relative">
      {/* Device frame indicator */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-surface border border-border-light rounded-full px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider shadow-sm">
        {templateDef.metadata.name} · {previewDevice}
      </div>

      <div
        className={`${deviceWidth} min-h-full bg-background shadow-2xl transition-all duration-300 origin-top mt-10`}
        style={previewDevice !== "desktop" ? { transform: previewDevice === "tablet" ? "scale(0.85)" : "scale(0.7)", transformOrigin: "top center" } : undefined}
      >
        <TemplateBoundary templateName={templateDef.metadata.name}>
          <TemplateComponent document={document} />
        </TemplateBoundary>
      </div>
    </div>
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
