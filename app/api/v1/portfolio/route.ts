import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { PortfolioContentService } from "@/lib/portfolio/service";
import { prisma } from "@/lib/db";
import { AnalyticsService } from "@/lib/analytics/service";

export const POST = withAPIHandler(async () => {
  const user = await requireAuth();
  
  const record = await PortfolioContentService.generatePortfolio(user.id);

  AnalyticsService.record({
    eventName: "portfolio.generated",
    userId: user.id,
    entityId: record.id,
    metadata: { version: record.version }
  });

  return NextResponse.json({
    success: true,
    data: {
      id: record.id,
      version: record.version,
      status: record.status,
      content: JSON.parse(record.content),
    }
  });
});

export const GET = withAPIHandler(async () => {
  const user = await requireAuth();
  
  const record = await PortfolioContentService.getLatestPortfolio(user.id);
  const publication = await prisma.portfolioPublication.findFirst({
    where: { userId: user.id },
    include: { user: { select: { username: true } } }
  });

  return NextResponse.json({
    success: true,
    data: record ? {
      id: record.id,
      version: record.version,
      status: record.status,
      content: JSON.parse(record.content),
      createdAt: record.createdAt,
      publication: publication ? {
        isActive: publication.isActive,
        publicSlug: publication.publicSlug,
        publicCode: publication.publicCode,
        publicUrl: publication.publicCode && publication.user?.username 
          ? `/${publication.user.username}/${publication.publicCode}`
          : `/p/${publication.publicSlug}`
      } : null
    } : null
  });
});
