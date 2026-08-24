import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PortfolioContentService } from "@/lib/portfolio/service";

export const GET = withAPIHandler(async () => {
  const user = await requireAuth();
  
  let record = await prisma.portfolioDocument.findFirst({
    where: { userId: user.id },
    orderBy: { version: 'desc' }
  });

  // If no portfolio yet, generate one
  if (!record) {
    record = await PortfolioContentService.generatePortfolio(user.id);
  }

  const publication = await prisma.portfolioPublication.findUnique({
    where: { userId: user.id },
    include: { user: { select: { username: true } } }
  });

  const versions = await prisma.portfolioDocument.findMany({
    where: { userId: user.id },
    orderBy: { version: 'desc' },
    select: { id: true, version: true, createdAt: true, status: true, templateId: true }
  });

  return NextResponse.json({
    success: true,
    data: {
      id: record.id,
      version: record.version,
      status: record.status,
      content: JSON.parse(record.content),
      templateId: record.templateId,
      createdAt: record.createdAt,
      publication: publication ? {
        isActive: publication.isActive,
        publicCode: publication.publicCode,
        portfolioDocumentId: publication.portfolioDocumentId,
        publicUrl: publication.publicCode && publication.user?.username 
          ? `/${publication.user.username}/${publication.publicCode}`
          : null
      } : null,
      versions
    }
  });
});

export const POST = withAPIHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();

  const { content, templateId } = body;
  
  if (!content) {
    return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
  }

  // Find latest document
  const lastDoc = await prisma.portfolioDocument.findFirst({
    where: { userId: user.id },
    orderBy: { version: 'desc' }
  });

  if (!lastDoc) {
    return NextResponse.json({ success: false, error: "No portfolio found" }, { status: 404 });
  }

  // If the last document is published, we MUST create a new version (draft)
  // If it's still a draft, we can update it in-place.
  const isPublished = await prisma.portfolioPublication.findFirst({
    where: { portfolioDocumentId: lastDoc.id }
  });

  let updatedDoc;

  if (isPublished) {
    updatedDoc = await prisma.portfolioDocument.create({
      data: {
        userId: user.id,
        version: lastDoc.version + 1,
        status: "DRAFT",
        content: JSON.stringify(content),
        templateId: templateId || lastDoc.templateId,
        sourceProfileId: lastDoc.sourceProfileId,
        sourceAiGenerationId: lastDoc.sourceAiGenerationId,
      }
    });
  } else {
    updatedDoc = await prisma.portfolioDocument.update({
      where: { id: lastDoc.id },
      data: {
        content: JSON.stringify(content),
        templateId: templateId || lastDoc.templateId,
        updatedAt: new Date()
      }
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: updatedDoc.id,
      version: updatedDoc.version,
    }
  });
});
