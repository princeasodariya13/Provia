import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

export const GET = withAPIHandler(async (request: Request, context: any) => {
  await requireRole("ADMIN");

  const { id } = await context.params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!job) {
    throw new NotFoundError("Job not found");
  }

  // Redact payload / result slightly if needed, but since it's an admin op, we just return the safe parts
  // Be careful with OAUTH tokens if they were accidentally saved in payload.
  let parsedPayload: any = null;
  if (job.payload) {
    try {
      parsedPayload = JSON.parse(job.payload);
      if (parsedPayload.accessToken) parsedPayload.accessToken = "[REDACTED]";
      if (parsedPayload.refreshToken) parsedPayload.refreshToken = "[REDACTED]";
    } catch {
      parsedPayload = job.payload;
    }
  }

  let parsedResult: any = null;
  if (job.result) {
    try {
      parsedResult = JSON.parse(job.result);
      if (parsedResult.accessToken) parsedResult.accessToken = "[REDACTED]";
      if (parsedResult.refreshToken) parsedResult.refreshToken = "[REDACTED]";
    } catch {
      parsedResult = job.result;
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      ...job,
      payload: parsedPayload,
      result: parsedResult
    }
  });
});
