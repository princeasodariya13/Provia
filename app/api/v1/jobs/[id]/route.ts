import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { JobService } from "@/lib/jobs";
import { APIError } from "@/lib/errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAPIHandler(async (request: Request, { params }: any) => {
  const user = await requireAuth();
  const { id } = await params;

  const job = await JobService.getJob(id, user.id);

  if (!job) {
    throw new APIError("Job not found", 404);
  }

  // Safe response format, hiding internal details
  return NextResponse.json({
    success: true,
    data: {
      id: job.id,
      type: job.type,
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      failedAt: job.failedAt,
      errorCode: job.errorCode,
      result: job.result, // Safe because result must be sanitized by handlers
    },
  });
});
