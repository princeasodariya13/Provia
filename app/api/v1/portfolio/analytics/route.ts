import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RateLimiterService } from "@/lib/rate-limit";
import { APIError } from "@/lib/errors";

export const GET = withAPIHandler(async () => {
  const user = await requireAuth();

  // Use generic API rate limit for analytics queries (e.g. 30 requests per minute)
  // Assuming a generic pattern if no specific AUTH limit applies, but we can reuse a moderate one
  const rateLimitResult = await RateLimiterService.check(
    `api:analytics:${user.id}`,
    30,
    60
  );

  if (!rateLimitResult.allowed) {
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch only the strictly necessary fields to minimize memory footprint
  const recentEvents = await prisma.analyticsEvent.findMany({
    where: {
      userId: user.id,
      eventName: "portfolio.public_viewed",
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      id: true,
      createdAt: true,
      entityId: true,
      metadata: true,
    },
    orderBy: { createdAt: "desc" }
  });

  // Calculate Total Views (could be more than 30 days, so we do a fast count for all time)
  const totalViews = await prisma.analyticsEvent.count({
    where: {
      userId: user.id,
      eventName: "portfolio.public_viewed",
    }
  });

  const publishedCount = await prisma.portfolioPublication.count({
    where: {
      userId: user.id,
      isActive: true,
    }
  });

  // Aggregate views per day for the last 30 days
  const trendMap: Record<string, number> = {};
  
  // Initialize last 30 days with 0 to ensure continuous timeline
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    trendMap[dateStr] = 0;
  }

  const portfolioMap: Record<string, { views: number; slug: string }> = {};

  for (const event of recentEvents) {
    const dateStr = event.createdAt.toISOString().split("T")[0];
    if (trendMap[dateStr] !== undefined) {
      trendMap[dateStr]++;
    }

    // Safely parse metadata to get slug if entityId didn't exist before
    let slug = "Unknown";
    if (event.metadata) {
      try {
        const meta = JSON.parse(event.metadata);
        if (meta.slug) {
          slug = meta.slug;
        }
      } catch {
        // Ignore metadata parse errors
      }
    }

    const portId = event.entityId || slug; // Fallback to slug if old event
    if (!portfolioMap[portId]) {
      portfolioMap[portId] = { views: 0, slug };
    }
    portfolioMap[portId].views++;
  }

  const trend = Object.keys(trendMap)
    .sort()
    .map(date => ({
      date,
      views: trendMap[date]
    }));

  const portfolios = Object.keys(portfolioMap)
    .map(id => ({
      portfolioId: id,
      slug: portfolioMap[id].slug,
      recentViews: portfolioMap[id].views
    }))
    .sort((a, b) => b.recentViews - a.recentViews);

  const payload = {
    summary: {
      totalViews,
      publishedPortfolios: publishedCount,
      recentViews: recentEvents.length,
    },
    trend,
    portfolios,
  };

  return NextResponse.json({
    success: true,
    data: payload
  });
});
