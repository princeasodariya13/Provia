import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioPreviewPage({ params }: PreviewPageProps) {
  const user = await requireAuth();
  
  if (!user) {
    redirect("/login");
  }
  
  const resolvedParams = await params;
  
  // Find portfolio by ID and enforce ownership
  const portfolioRecord = await prisma.portfolioDocument.findUnique({
    where: { 
      id: resolvedParams.id,
      userId: user.id
    }
  });

  if (!portfolioRecord) {
    return notFound();
  }

  const document = JSON.parse(portfolioRecord.content) as PortfolioDocumentDTO;
  const templateId = portfolioRecord.templateId || TemplateRegistry.getDefaultTemplateId();
  
  const templateDef = TemplateRegistry.getTemplate(templateId);
  if (!templateDef) {
    return (
      <div className="p-8 text-error">
        Error: Template &quot;{templateId}&quot; not found in registry.
      </div>
    );
  }

  const TemplateComponent = templateDef.component;

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="bg-surface border-b border-border-strong p-4 flex justify-between items-center z-50 relative shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="font-bold tracking-tight">Portfolio Preview</h1>
          <span className="text-sm font-mono bg-background px-2 py-1 border border-border-strong">
            v{portfolioRecord.version}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="text-text-secondary">
            Template: {templateDef.metadata.name}
          </span>
          <a href="/portfolio" className="text-accent hover:underline">
            Back to Dashboard
          </a>
        </div>
      </div>
      
      {/* 
        We use an iframe-like isolated container or just render it directly. 
        Because Tailwind might conflict, the template root handles its own styling.
      */}
      <div className="w-full relative">
        <TemplateComponent document={document} />
      </div>
    </div>
  );
}
