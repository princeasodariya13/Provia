import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Metadata } from "next";
import { env } from "@/lib/env";
import { ShareButton } from "@/components/ShareButton";
import { AnalyticsService } from "@/lib/analytics/service";

// Ensure username format is valid
const USERNAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Ensure public code is exactly 32 hex chars
const PUBLIC_CODE_REGEX = /^[a-f0-9]{32}$/;

export async function generateMetadata({ params }: { params: Promise<{ username: string, publicCode: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { username, publicCode } = resolvedParams;

  if (!USERNAME_REGEX.test(username) || !PUBLIC_CODE_REGEX.test(publicCode)) {
    return { title: "Portfolio Not Found" };
  }

  const publication = await prisma.portfolioPublication.findUnique({
    where: { publicCode, isActive: true },
    include: {
      user: {
        select: { username: true }
      },
      portfolioDocument: true 
    }
  });

  if (!publication || publication.user.username !== username || publication.portfolioDocument.status !== "PUBLISHED") {
    return { title: "Portfolio Not Found" };
  }

  const document = JSON.parse(publication.portfolioDocument.content) as PortfolioDocumentDTO;
  const canonicalUrl = `${env.NEXT_PUBLIC_APP_URL}/${username}/${publicCode}`;
  const title = document.metadata.title || `${document.hero.name}'s Portfolio`;
  const description = document.hero.shortIntroduction || "Professional Portfolio";
  
  // Use fallback URL
  const imageUrl = `${env.NEXT_PUBLIC_APP_URL}/api/og?title=${encodeURIComponent(title)}`;

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
      type: "profile",
      siteName: "Provia",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PublicPortfolioURLPage({ params }: { params: Promise<{ username: string, publicCode: string }> }) {
  const resolvedParams = await params;
  const { username, publicCode } = resolvedParams;

  if (!USERNAME_REGEX.test(username) || !PUBLIC_CODE_REGEX.test(publicCode)) {
    return notFound();
  }
  
  const publication = await prisma.portfolioPublication.findUnique({
    where: { publicCode, isActive: true },
    include: { 
      user: {
        select: { username: true }
      },
      portfolioDocument: true 
    }
  });

  if (!publication || publication.user.username !== username || publication.portfolioDocument.status !== "PUBLISHED") {
    return notFound();
  }

  const document = JSON.parse(publication.portfolioDocument.content) as PortfolioDocumentDTO;
  const templateId = publication.portfolioDocument.templateId || TemplateRegistry.getDefaultTemplateId();
  
  const templateDef = TemplateRegistry.getTemplate(templateId);
  if (!templateDef) {
    return notFound();
  }

  const TemplateComponent = templateDef.component;

  // Non-blocking analytics
  AnalyticsService.record({
    eventName: "portfolio.public_viewed" as any,
    userId: publication.userId,
    entityId: publication.id,
    entityType: "PortfolioPublication",
    metadata: {
      templateId,
      publicCode,
    }
  }).catch((err) => {
    // Silence analytics failures to ensure portfolio still renders
    console.error("Failed to record view analytics", err);
  });

  return (
    <div className="w-full min-h-screen bg-background">
      <TemplateComponent document={document} />
      
      <ShareButton 
        title={document.metadata.title || `${document.hero.name}'s Portfolio`}
        text={`Check out ${document.hero.name}'s professional portfolio!`}
        url={`${env.NEXT_PUBLIC_APP_URL}/${username}/${publicCode}`}
      />
    </div>
  );
}
