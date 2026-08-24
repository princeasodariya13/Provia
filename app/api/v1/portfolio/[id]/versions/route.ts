import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APIError } from "@/lib/errors";
import { portfolioDocumentSchema } from "@/lib/schemas/portfolio";
import { AnalyticsService } from "@/lib/analytics/service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAPIHandler(async (request: Request, { params }: any) => {
  const user = await requireAuth();
  const { id: sourceDocumentId } = await params;
  const body = await request.json();

  // 1. Verify ownership of the base PortfolioDocument
  const baseDocument = await prisma.portfolioDocument.findFirst({
    where: { 
      id: sourceDocumentId,
      userId: user.id
    }
  });

  if (!baseDocument) {
    throw new APIError("Source portfolio document not found", 404);
  }

  // 2. Validate the new content payload
  const validatedContent = portfolioDocumentSchema.parse(body.content);
  
  // 3. Prevent version conflicts (Optimistic Concurrency)
  // We make sure the highest version in DB matches baseDocument.version 
  // if we strictly want sequential editing. But we can also just append next version.
  const maxDoc = await prisma.portfolioDocument.findFirst({
    where: { userId: user.id },
    orderBy: { version: 'desc' }
  });

  const nextVersion = maxDoc ? maxDoc.version + 1 : 1;

  // 4. Create the new immutable version
  const newRecord = await prisma.portfolioDocument.create({
    data: {
      userId: user.id,
      version: nextVersion,
      status: "DRAFT",
      content: JSON.stringify(validatedContent),
      sourceProfileId: baseDocument.sourceProfileId,
      sourceAiGenerationId: baseDocument.sourceAiGenerationId,
      templateId: baseDocument.templateId,
      templateConfig: baseDocument.templateConfig,
    }
  });

  AnalyticsService.record({
    eventName: "portfolio.version_created",
    userId: user.id,
    entityId: newRecord.id,
    metadata: { version: newRecord.version, sourceVersion: baseDocument.version }
  });

  return NextResponse.json({
    success: true,
    data: {
      id: newRecord.id,
      version: newRecord.version,
    }
  });
});
