import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const pub = await prisma.portfolioPublication.findUnique({
    where: { publicSlug: resolvedParams.slug, isActive: true },
    include: { portfolioDocument: true }
  });

  if (!pub) {
    return { title: "Portfolio Not Found" };
  }

  const document = JSON.parse(pub.portfolioDocument.content) as PortfolioDocumentDTO;
  return {
    title: document.metadata.title,
    description: document.hero.shortIntroduction,
  };
}

export default async function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const publication = await prisma.portfolioPublication.findUnique({
    where: { publicSlug: resolvedParams.slug, isActive: true },
    include: { portfolioDocument: true }
  });

  if (!publication) {
    return notFound();
  }

  const document = JSON.parse(publication.portfolioDocument.content) as PortfolioDocumentDTO;
  const templateId = publication.portfolioDocument.templateId || TemplateRegistry.getDefaultTemplateId();
  
  const templateDef = TemplateRegistry.getTemplate(templateId);
  if (!templateDef) {
    return notFound();
  }

  const TemplateComponent = templateDef.component;

  return (
    <div className="w-full min-h-screen bg-background">
      {/* 
        This is the purely public wrapper.
        Notice that there is NO dashboard navigation, no user auth checks required, 
        and only the safe document DTO is passed down.
      */}
      <TemplateComponent document={document} />
    </div>
  );
}
