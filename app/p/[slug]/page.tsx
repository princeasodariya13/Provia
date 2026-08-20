import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Metadata } from "next";
import { env } from "@/lib/env";
import { ShareButton } from "@/components/ShareButton";

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
  const canonicalUrl = `${env.NEXT_PUBLIC_APP_URL}/p/${resolvedParams.slug}`;
  const title = document.metadata.title || `${document.hero.name}'s Portfolio`;
  const description = document.hero.shortIntroduction || "Professional Portfolio";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "Provia",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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
      
      {/* 
        Public sharing action layered on top securely. 
        Only relies on client APIs (navigator.share / clipboard)
      */}
      <ShareButton 
        title={document.metadata.title || `${document.hero.name}'s Portfolio`}
        text={`Check out ${document.hero.name}'s professional portfolio!`}
        url={`${env.NEXT_PUBLIC_APP_URL}/p/${resolvedParams.slug}`}
      />
    </div>
  );
}
