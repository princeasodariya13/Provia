/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { JobStatus } from "@prisma/client";

export const GET = withAPIHandler(async (request: Request) => {
  await requireRole("ADMIN");

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);
  
  const jobId = url.searchParams.get("jobId");
  const userId = url.searchParams.get("userId");
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status") as JobStatus | null;
  const dlqOnly = url.searchParams.get("dlqOnly") === "true";

  const whereClause: any = {};
  
  if (jobId) whereClause.id = jobId;
  if (userId) whereClause.userId = userId;
  if (type) whereClause.type = type;
  if (status) whereClause.status = status;
  if (dlqOnly) whereClause.deadLetteredAt = { not: null };

  const [total, jobs] = await Promise.all([
    prisma.job.count({ where: whereClause }),
    prisma.job.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        type: true,
        status: true,
        attempts: true,
        maxAttempts: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        failedAt: true,
        deadLetteredAt: true,
        durationMs: true,
        errorCode: true,
        userId: true,
        workerId: true
      }
    })
  ]);

  return NextResponse.json({
    success: true,
    data: {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});
