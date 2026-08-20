import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { ReactNode } from "react";

export interface TemplateMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  supportedSections: string[];
}

export interface TemplateProps {
  document: PortfolioDocumentDTO;
  // Future config typing
  config?: Record<string, unknown>;
}

export type TemplateComponent = (props: TemplateProps) => ReactNode;

export interface TemplateDefinition {
  metadata: TemplateMetadata;
  component: TemplateComponent;
}
