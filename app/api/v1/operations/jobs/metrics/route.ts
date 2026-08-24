import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const GET = withAPIHandler(async (request: Request) => {
  await requireRole("ADMIN");

  const url = new URL(request.url);
  const timeFilter = url.searchParams.get("timeFilter") || "all";

  const whereClause: any = {};
  if (timeFilter !== "all") {
    const date = new Date();
    if (timeFilter === "24h") date.setHours(date.getHours() - 24);
    else if (timeFilter === "7d") date.setDate(date.getDate() - 7);
    else if (timeFilter === "30d") date.setDate(date.getDate() - 30);
    whereClause.createdAt = { gte: date };
  }

  // Get total counts by status
  const statusCounts = await prisma.job.groupBy({
    by: ['status'],
    where: whereClause,
    _count: {
      id: true,
    },
  });

  const totals = {
    QUEUED: 0,
    PROCESSING: 0,
    COMPLETED: 0,
    FAILED: 0,
    CANCELLED: 0,
  };

  statusCounts.forEach((s) => {
    totals[s.status] = s._count.id;
  });

  // Get dead lettered count
  const deadLetterCount = await prisma.job.count({
    where: {
      ...whereClause,
      deadLetteredAt: { not: null },
    }
  });

  // Calculate Average Processing Time
  const avgDurationResult = await prisma.job.aggregate({
    where: {
      ...whereClause,
      status: "COMPLETED",
      durationMs: { not: null }
    },
    _avg: {
      durationMs: true
    }
  });

  // Get failure breakdown
  const errorCounts = await prisma.job.groupBy({
    by: ['errorCode'],
    where: {
      ...whereClause,
      status: { in: ['FAILED'] },
      errorCode: { not: null }
    },
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 5
  });

  // Get job type breakdown
  const typeCounts = await prisma.job.groupBy({
    by: ['type'],
    where: whereClause,
    _count: {
      id: true
    }
  });

  const totalProcessed = totals.COMPLETED + totals.FAILED;
  const successRate = totalProcessed > 0 ? (totals.COMPLETED / totalProcessed) * 100 : 0;
  const failureRate = totalProcessed > 0 ? (totals.FAILED / totalProcessed) * 100 : 0;

  return NextResponse.json({
    success: true,
    data: {
      totals: {
        all: Object.values(totals).reduce((a, b) => a + b, 0),
        queued: totals.QUEUED,
        processing: totals.PROCESSING,
        completed: totals.COMPLETED,
        failed: totals.FAILED,
        deadLettered: deadLetterCount
      },
      metrics: {
        successRate: Math.round(successRate * 10) / 10,
        failureRate: Math.round(failureRate * 10) / 10,
        avgProcessingTimeMs: Math.round(avgDurationResult._avg.durationMs || 0)
      },
      failureBreakdown: errorCounts.map(e => ({
        code: e.errorCode,
        count: e._count.id
      })),
      typeBreakdown: typeCounts.map(t => ({
        type: t.type,
        count: t._count.id
      }))
    }
  });
});
