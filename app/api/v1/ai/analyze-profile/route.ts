import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { AIService } from "@/lib/ai/service";
import { prisma } from "@/lib/db";

export const POST = withAPIHandler(async () => {
  const user = await requireAuth();
  
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
