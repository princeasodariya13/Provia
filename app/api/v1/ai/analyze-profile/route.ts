import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { JobService } from "@/lib/jobs";
import { prisma } from "@/lib/db";

export const POST = withAPIHandler(async (request: Request) => {
  const user = await requireAuth();
  
  const searchParams = new URL(request.url).searchParams;
  const asyncMode = searchParams.get("async") === "true";

  if (asyncMode) {
    const job = await JobService.createJob({
      userId: user.id,
      type: "PROFILE_ANALYSIS",
      payload: { userId: user.id },
      idempotencyKey: `profile-analysis-${user.id}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
      }
    });
  }

  // Backward compatibility
  const { AIService } = await import("@/lib/ai/service");
  const record = await AIService.analyzeProfile(user.id);

  return NextResponse.json({
    success: true,
    data: {
      id: record.id,
      status: record.status,
      result: record.result ? JSON.parse(record.result) : null,
      usage: record.usage ? JSON.parse(record.usage) : null,
    }
  });
});

export const GET = withAPIHandler(async () => {
  const user = await requireAuth();
  
  const record = await prisma.aIGeneration.findFirst({
    where: { userId: user.id, generationType: "PROFILE_ANALYSIS" },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    success: true,
    data: record ? {
      id: record.id,
      status: record.status,
      result: record.result ? JSON.parse(record.result) : null,
      usage: record.usage ? JSON.parse(record.usage) : null,
      failureReason: record.failureReason,
    } : null
  });
});
