import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAPIHandler(async (req, { params }: any) => {
  const user = await requireAuth();
  
  const versionId = params.id;

  const versionToRestore = await prisma.portfolioDocument.findFirst({
    where: {
      id: versionId,
      userId: user.id
    }
  });

  if (!versionToRestore) {
    return NextResponse.json({ success: false, error: "Version not found" }, { status: 404 });
  }

  // Get highest version
  const lastDoc = await prisma.portfolioDocument.findFirst({
    where: { userId: user.id },
    orderBy: { version: 'desc' }
  });

  const newVersion = lastDoc ? lastDoc.version + 1 : 1;

  const newDoc = await prisma.portfolioDocument.create({
    data: {
      userId: user.id,
      version: newVersion,
      status: "DRAFT",
      content: versionToRestore.content,
      templateId: versionToRestore.templateId,
      sourceProfileId: versionToRestore.sourceProfileId,
      sourceAiGenerationId: versionToRestore.sourceAiGenerationId,
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      id: newDoc.id,
      version: newDoc.version
    }
  });
});
