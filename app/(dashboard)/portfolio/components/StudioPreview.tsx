import React from "react";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { PreviewDevice } from "../page";
import { LayoutTemplate } from "lucide-react";

import { TemplateGallery } from "./TemplateGallery";
import { mockPortfolioDocument } from "@/lib/portfolio/templates/shared/mock";

interface Props {
  document: PortfolioDocumentDTO | null;
  templateId: string;
  previewDevice: PreviewDevice;
  activeTab: string;
  onSelectTemplate: (id: string) => void;
}

export function StudioPreview({ document, templateId, previewDevice, activeTab, onSelectTemplate }: Props) {
  const templateDef = TemplateRegistry.getTemplate(templateId);
  
  // Allow Design tab to load with a mock document if real document is missing
  if (!templateDef || (!document && activeTab !== "design")) {
    return (
      <div className="flex-1 bg-surface-muted/30 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <LayoutTemplate className="w-12 h-12 text-border-strong mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary mb-2">No Document Available</h3>
          <p className="text-sm text-text-secondary">Generate a portfolio or select a version to preview it here.</p>
        </div>
      </div>
    );
  }

  const activeDocument = document || mockPortfolioDocument;

  const TemplateComponent = templateDef.component;

  const deviceWidth = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]"
  }[previewDevice];

  if (activeTab === "design") {
    return (
      <div className="flex-1 overflow-hidden">
        <TemplateGallery 
          document={activeDocument} 
          currentTemplateId={templateId} 
          onSelectTemplate={onSelectTemplate}
          onClose={() => {}} 
        />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-surface-muted overflow-y-auto flex justify-center relative">
      <div className={`${deviceWidth} min-h-full bg-background shadow-2xl transition-all duration-300 origin-top`}>
        {/* We render the template directly inside a container. We use pointer-events-none on interactive 
            elements if needed, but rendering normally is fine for live preview */}
        <div className="w-full h-full transform scale-100 origin-top">
          <TemplateComponent document={activeDocument} />
        </div>
      </div>
    </div>
  );
}
