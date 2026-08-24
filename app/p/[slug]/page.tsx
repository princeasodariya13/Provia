import { prisma } from "@/lib/db";
import { notFound, permanentRedirect } from "next/navigation";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Metadata } from "next";
import { env } from "@/lib/env";
import { ShareButton } from "@/components/ShareButton";
import { AnalyticsService } from "@/lib/analytics/service";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const pub = await prisma.portfolioPublication.findUnique({
    where: { publicSlug: resolvedParams.slug, isActive: true },
    include: { portfolioDocument: true, user: { select: { username: true } } }
  });

  if (!pub) {
    return { title: "Portfolio Not Found" };
  }

  // If the new public format is available, the old route shouldn't generate metadata directly
  if (pub.publicCode && pub.user.username) {
    return { title: "Redirecting..." };
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
    include: { portfolioDocument: true, user: { select: { username: true } } }
  });

  if (!publication) {
    return notFound();
  }

  // Redirect to new public URL structure if available
  if (publication.publicCode && publication.user.username) {
    permanentRedirect(`/${publication.user.username}/${publication.publicCode}`);
  }

  const document = JSON.parse(publication.portfolioDocument.content) as PortfolioDocumentDTO;
  const templateId = publication.portfolioDocument.templateId || TemplateRegistry.getDefaultTemplateId();
  
  const templateDef = TemplateRegistry.getTemplate(templateId);
  if (!templateDef) {
    return notFound();
  }

  const TemplateComponent = templateDef.component;

  // Fire-and-forget analytics event
  AnalyticsService.record({
    eventName: "portfolio.public_viewed",
    userId: publication.userId,
    entityId: publication.id,
    entityType: "PortfolioPublication",
    metadata: {
      slug: resolvedParams.slug,
      templateId,
    }
  });

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
