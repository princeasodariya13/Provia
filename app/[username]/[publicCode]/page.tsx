import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { TemplateRegistry } from "@/lib/portfolio/templates/registry";
import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";
import { Metadata } from "next";
import { env } from "@/lib/env";
import { ShareButton } from "@/components/ShareButton";
import { AnalyticsService } from "@/lib/analytics/service";
import { TemplateLoader } from "@/components/ui/template-loader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    where: { publicCode },
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
  
  if (!publication.isActive || document.seo?.noIndex) {
    return { 
      title: "Private Portfolio",
      robots: { index: false, follow: false }
    };
  }

  const canonicalUrl = `${env.NEXT_PUBLIC_APP_URL}/${username}/${publicCode}`;
  const title = document.seo?.title || `${document.hero?.name || "Professional"} | Portfolio`;
  const description = document.seo?.description || document.about?.summary?.substring(0, 160) || "Professional Portfolio";
  const keywords = document.seo?.keywords ? document.seo.keywords.split(",").map(k => k.trim()) : undefined;

  const imageUrl = `${env.NEXT_PUBLIC_APP_URL}/api/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
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
    where: { publicCode },
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

  // Enforce Privacy (Unpublished or SEO Hidden mode)
  if (!publication.isActive || document.seo?.noIndex) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] font-sans text-center px-4">
        <div className="w-16 h-16 bg-surface border border-border-light rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-text-primary mb-2">Portfolio Hidden</h1>
        <p className="text-text-secondary text-sm max-w-sm leading-relaxed">
          The owner of this portfolio has currently set it to private. It is not available for public viewing.
        </p>
      </div>
    );
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
    metadata: { templateId, publicCode, username }
  }).catch(() => {
    // Silence analytics failures — portfolio still renders
  });

  const publicUrl = `${env.NEXT_PUBLIC_APP_URL}/${username}/${publicCode}`;

  return (
    <div className="w-full min-h-screen relative">
      <TemplateLoader />
      <TemplateComponent document={document} />
      <ShareButton
        title={document.seo?.title || `${document.hero?.name || "Professional"} | Portfolio`}
        text={document.seo?.description || `Check out ${document.hero?.name || "this professional"}'s portfolio on Provia!`}
        url={publicUrl}
      />
    </div>
  );
}
