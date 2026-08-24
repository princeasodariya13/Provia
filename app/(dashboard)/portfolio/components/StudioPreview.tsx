import React from "react";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { PreviewDevice } from "../page";
import { LayoutTemplate } from "lucide-react";

interface Props {
  document: PortfolioDocumentDTO | null;
  templateId: string;
  previewDevice: PreviewDevice;
}

export function StudioPreview({ document, templateId, previewDevice }: Props) {
  const templateDef = TemplateRegistry.getTemplate(templateId);
  
  if (!document || !templateDef) {
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

  const TemplateComponent = templateDef.component;

  const deviceWidth = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]"
  }[previewDevice];

  return (
    <div className="flex-1 bg-surface-muted overflow-y-auto flex justify-center relative">
      <div className={`${deviceWidth} min-h-full bg-background shadow-2xl transition-all duration-300 origin-top`}>
        {/* We render the template directly inside a container. We use pointer-events-none on interactive 
            elements if needed, but rendering normally is fine for live preview */}
        <div className="w-full h-full transform scale-100 origin-top">
          <TemplateComponent document={document} />
        </div>
      </div>
    </div>
  );
}
