import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { PortfolioContentService } from "@/lib/portfolio/service";

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

  return NextResponse.json({
    success: true,
    data: record ? {
      id: record.id,
      version: record.version,
      status: record.status,
      content: JSON.parse(record.content),
      createdAt: record.createdAt,
    } : null
  });
});
