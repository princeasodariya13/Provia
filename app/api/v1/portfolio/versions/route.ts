import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const GET = withAPIHandler(async () => {
  const user = await requireAuth();

  const versions = await prisma.portfolioDocument.findMany({
    where: { userId: user.id },
    orderBy: { version: 'desc' },
    select: {
      id: true,
      version: true,
      status: true,
      createdAt: true,
      templateId: true,
      publications: {
        where: { isActive: true },
        select: { id: true, publicSlug: true }
      }
    }
  });

  return NextResponse.json({
    success: true,
    data: versions
  });
});
