import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APIError } from "@/lib/errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAPIHandler(async (request: Request, { params }: any) => {
  const user = await requireAuth();
  const { id } = await params;

  const document = await prisma.portfolioDocument.findUnique({
    where: { 
      id,
      userId: user.id
    },
    include: {
      publications: {
        where: { isActive: true }
      }
    }
  });

  if (!document) {
    throw new APIError("Portfolio document not found", 404);
  }

  return NextResponse.json({
    success: true,
    data: {
      id: document.id,
      version: document.version,
      status: document.status,
      content: JSON.parse(document.content),
      templateId: document.templateId,
      createdAt: document.createdAt,
      isPublished: document.publications.length > 0,
    }
  });
});
