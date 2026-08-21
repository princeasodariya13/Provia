import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { JobService } from "@/lib/jobs";
import { z } from "zod";
import { JobType } from "@/lib/jobs/types";

const createJobSchema = z.object({
  type: z.enum(["PROFILE_ANALYSIS", "PORTFOLIO_GENERATION", "PROVIDER_SYNC"]),
  provider: z.enum(["GITHUB", "LINKEDIN"]).optional(),
});

export const POST = withAPIHandler(async (request: Request) => {
  const user = await requireAuth();
  const body = await request.json();
  const data = createJobSchema.parse(body);

  const payload: Record<string, unknown> = { userId: user.id };
  let idempotencyKey: string | undefined = undefined;

  if (data.type === "PROFILE_ANALYSIS") {
    idempotencyKey = `profile-analysis-${user.id}`;
  } else if (data.type === "PORTFOLIO_GENERATION") {
    idempotencyKey = `portfolio-generation-${user.id}`;
  } else if (data.type === "PROVIDER_SYNC") {
    if (!data.provider) {
      return NextResponse.json({ success: false, error: "Provider is required for PROVIDER_SYNC" }, { status: 400 });
    }
    payload.provider = data.provider;
    idempotencyKey = `provider-sync-${user.id}-${data.provider}`;
  }

  const job = await JobService.createJob({
    userId: user.id,
    type: data.type as JobType,
    payload,
    idempotencyKey,
  });

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
    }
  });
});
