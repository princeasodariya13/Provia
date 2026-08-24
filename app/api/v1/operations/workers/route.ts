/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const GET = withAPIHandler(async (request: Request) => {
  await requireRole("ADMIN");

  const url = new URL(request.url);
  const includeOffline = url.searchParams.get("includeOffline") === "true";

  const cutoff = new Date(Date.now() - 30 * 1000); // 30 seconds for online cutoff if heartbeat fails

  const whereClause: any = {};
  if (!includeOffline) {
    whereClause.OR = [
      { status: "ONLINE" },
      { lastHeartbeatAt: { gte: cutoff } }
    ];
  }

  const workers = await prisma.workerStatus.findMany({
    where: whereClause,
    orderBy: { lastHeartbeatAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: workers.map(w => ({
      ...w,
      isActuallyOnline: w.status === "ONLINE" && w.lastHeartbeatAt >= cutoff
    }))
  });
});
