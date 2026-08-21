import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { PortfolioContentService } from "@/lib/portfolio/service";
import { JobService } from "@/lib/jobs";

export const POST = withAPIHandler(async (request: Request) => {
  const user = await requireAuth();
  
  const searchParams = new URL(request.url).searchParams;
  const asyncMode = searchParams.get("async") === "true";

  if (asyncMode) {
    const job = await JobService.createJob({
      userId: user.id,
      type: "PORTFOLIO_GENERATION",
      payload: { userId: user.id },
      idempotencyKey: `portfolio-generate-${user.id}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
      }
    });
  }
  
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
