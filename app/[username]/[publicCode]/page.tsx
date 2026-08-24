import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Metadata } from "next";
import { env } from "@/lib/env";
import { ShareButton } from "@/components/ShareButton";
import { AnalyticsService } from "@/lib/analytics/service";

// Ensure username format is valid (lowercase, hyphens)
const USERNAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
// Ensure public code is exactly 32 hex chars
const PUBLIC_CODE_REGEX = /^[a-f0-9]{32}$/;

export async function generateMetadata({ params }: { params: Promise<{ username: string, publicCode: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { username, publicCode } = resolvedParams;

  if (!USERNAME_REGEX.test(username) || !PUBLIC_CODE_REGEX.test(publicCode)) {
    return { title: "Portfolio Not Found" };
  }

  const publication = await prisma.portfolioPublication.findFirst({
    where: { publicCode, isActive: true },
    include: {
      user: { select: { username: true } },
      portfolioDocument: true
    }
  });

  if (
    !publication ||
    !publication.user.username ||
    publication.user.username.toLowerCase() !== username.toLowerCase() ||
    publication.portfolioDocument.status !== "PUBLISHED"
  ) {
    return { title: "Portfolio Not Found" };
  }

  const document = JSON.parse(publication.portfolioDocument.content) as PortfolioDocumentDTO;
  const canonicalUrl = `${env.NEXT_PUBLIC_APP_URL}/${username}/${publicCode}`;
  const title = document.metadata?.title || `${document.hero?.name || "Professional"}'s Portfolio`;
  const description = document.hero?.shortIntroduction || document.about?.summary?.substring(0, 160) || "Professional Portfolio";

  const imageUrl = `${env.NEXT_PUBLIC_APP_URL}/api/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
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

  const publication = await prisma.portfolioPublication.findFirst({
    where: { publicCode, isActive: true },
    include: {
      user: { select: { username: true } },
      portfolioDocument: true
    }
  });

  if (
    !publication ||
    !publication.user.username ||
    publication.user.username.toLowerCase() !== username.toLowerCase() ||
    publication.portfolioDocument.status !== "PUBLISHED"
  ) {
    return notFound();
  }

  let document: PortfolioDocumentDTO;
  try {
    document = JSON.parse(publication.portfolioDocument.content) as PortfolioDocumentDTO;
  } catch {
    return notFound();
  }

  const templateId = publication.portfolioDocument.templateId || TemplateRegistry.getDefaultTemplateId();
  const templateDef = TemplateRegistry.getTemplate(templateId) || TemplateRegistry.getTemplate(TemplateRegistry.getDefaultTemplateId());

  if (!templateDef) {
    return notFound();
  }

  const TemplateComponent = templateDef.component;

  // Non-blocking analytics
  AnalyticsService.record({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventName: "portfolio.public_viewed" as any,
    userId: publication.userId,
    entityId: publication.id,
    entityType: "PortfolioPublication",
    metadata: { templateId, publicCode }
  }).catch(() => {
    // Silence analytics failures — portfolio still renders
  });

  const publicUrl = `${env.NEXT_PUBLIC_APP_URL}/${username}/${publicCode}`;

  return (
    <div className="w-full min-h-screen">
      <TemplateComponent document={document} />
      <ShareButton
        title={document.metadata?.title || `${document.hero?.name || "Professional"}'s Portfolio`}
        text={`Check out ${document.hero?.name || "this professional"}'s portfolio on Provia!`}
        url={publicUrl}
      />
    </div>
  );
}
