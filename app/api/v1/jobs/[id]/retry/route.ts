import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { JobService } from "@/lib/jobs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAPIHandler(async (request: Request, { params }: any) => {
  const user = await requireAuth();
  const { id } = await params;

  // Retry job ensures it belongs to user and is FAILED
  const job = await JobService.retryJob(id, user.id);

  return NextResponse.json({
    success: true,
    data: {
      id: job.id,
      status: job.status,
    },
  });
});
