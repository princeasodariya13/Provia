import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APIError } from "@/lib/errors";

export const POST = withAPIHandler(async (request: Request, { params }: any) => {
  const user = await requireAuth();
  const { id: portfolioDocumentId } = await params;

  // We only allow unpublishing if they own the document
  const document = await prisma.portfolioDocument.findUnique({
    where: { 
      id: portfolioDocumentId,
      userId: user.id
    }
  });

  if (!document) {
    throw new APIError("Portfolio document not found", 404);
  }

  const pub = await prisma.portfolioPublication.findUnique({
    where: { userId: user.id }
  });

  if (!pub) {
    throw new APIError("No publication found", 404);
  }

  const updatedPub = await prisma.portfolioPublication.update({
    where: { userId: user.id },
    data: { isActive: false }
  });

  return NextResponse.json({
    success: true,
    data: {
      isActive: updatedPub.isActive
    }
  });
});
