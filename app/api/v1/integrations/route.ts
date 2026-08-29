import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const GET = withAPIHandler(async () => {
  const user = await requireAuth();

  const connections = await prisma.connection.findMany({
    where: { userId: user.id },
    select: {
      provider: true,
      state: true,
      lastSyncAt: true,
      errorMessage: true,
      rawSnapshots: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { data: true }
      }
    },
  });

  return NextResponse.json({
    success: true,
    data: connections,
  });
});
