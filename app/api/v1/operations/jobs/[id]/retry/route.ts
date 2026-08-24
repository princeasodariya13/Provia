import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NotFoundError, APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";

export const POST = withAPIHandler(async (request: Request, context: any) => {
  await requireRole("ADMIN");

  const { id } = await context.params;

  const job = await prisma.job.findUnique({
    where: { id }
  });

  if (!job) {
    throw new NotFoundError("Job not found");
  }

  if (job.status !== "FAILED" && job.status !== "CANCELLED") {
    throw new APIError("Only FAILED or CANCELLED jobs can be retried.", 400);
  }

  // Atomically update the job to QUEUED state, resetting attempts if it was DLQ
  const updatedJob = await prisma.job.update({
    where: { id },
    data: {
      status: "QUEUED",
      attempts: 0,
      lockedAt: null,
      workerId: null,
      failedAt: null,
      deadLetteredAt: null,
      errorCode: null,
      errorMessage: null,
      availableAt: new Date(),
    }
  });

  await AnalyticsService.record({
    eventName: "job.retry",
    userId: job.userId,
    entityId: job.id,
    entityType: "job",
    metadata: {
      jobType: job.type,
      manualRetry: true,
      previousStatus: job.status
    }
  });

  return NextResponse.json({
    success: true,
    data: updatedJob
  });
});
