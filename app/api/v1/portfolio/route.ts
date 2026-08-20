import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { PortfolioContentService } from "@/lib/portfolio/service";
import { prisma } from "@/lib/db";

export const POST = withAPIHandler(async () => {
  const user = await requireAuth();
  
  const record = await PortfolioContentService.generatePortfolio(user.id);

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
  const publication = await prisma.portfolioPublication.findUnique({
    where: { userId: user.id }
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
        publicUrl: `/p/${publication.publicSlug}`
      } : null
    } : null
  });
});
