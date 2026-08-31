import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PortfolioContentService } from "@/lib/portfolio/service";

export const GET = withAPIHandler(async () => {
  const user = await requireAuth();
  
  const record = await prisma.portfolioDocument.findFirst({
    where: { userId: user.id },
    orderBy: { version: 'desc' }
  });

  const publication = await prisma.portfolioPublication.findFirst({
    where: { userId: user.id },
    include: { user: { select: { username: true } } }
  });

  const versions = await prisma.portfolioDocument.findMany({
    where: { userId: user.id },
    orderBy: { version: 'desc' },
    select: { id: true, version: true, createdAt: true, status: true, templateId: true }
  });

  if (!record) {
    return NextResponse.json({
      success: true,
      data: {
        id: null,
        version: 0,
        status: "DRAFT",
        content: null,
        templateId: "editorial-v1", // Default selected template
        createdAt: null,
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
  }

  const profile = await prisma.professionalProfile.findFirst({
    where: { userId: user.id },
    select: { avatarUrl: true }
  });

  const latestAvatar = profile?.avatarUrl || user.image;

  // Treat "{}" as a stub document (ungenerated)
  const isStub = record.content === "{}";
  let parsedContent = null;
  
  if (!isStub) {
    try {
      parsedContent = JSON.parse(record.content);
      // Auto-sync avatar from user profile if it's missing or outdated
      if (latestAvatar && parsedContent.hero) {
        if (!parsedContent.hero.avatarUrl || parsedContent.hero.avatarUrl !== latestAvatar) {
          parsedContent.hero.avatarUrl = latestAvatar;
          // Optionally save it back silently in the background so it persists
          prisma.portfolioDocument.update({
            where: { id: record.id },
            data: { content: JSON.stringify(parsedContent) }
          }).catch(console.error);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      id: record.id,
      version: record.version,
      status: record.status,
      content: parsedContent,
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
  
  if (!content && !templateId) {
    return NextResponse.json({ success: false, error: "Content or templateId is required" }, { status: 400 });
  }

  // Find latest document
  const lastDoc = await prisma.portfolioDocument.findFirst({
    where: { userId: user.id },
    orderBy: { version: 'desc' }
  });

  // If no portfolio found, create a stub document to store the templateId
  if (!lastDoc) {
    // We need a sourceProfileId to create a PortfolioDocument, try to find one
    const profile = await prisma.professionalProfile.findFirst({ where: { userId: user.id } });
    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found. Cannot save template." }, { status: 400 });
    }
    const newDoc = await prisma.portfolioDocument.create({
      data: {
        userId: user.id,
        version: 1,
        status: "DRAFT",
        content: content ? JSON.stringify(content) : "{}",
        templateId: templateId || "editorial-v1",
        sourceProfileId: profile.id,
      }
    });
    return NextResponse.json({
      success: true,
      data: { id: newDoc.id, version: newDoc.version }
    });
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
        content: content ? JSON.stringify(content) : lastDoc.content,
        templateId: templateId || lastDoc.templateId,
        sourceProfileId: lastDoc.sourceProfileId,
        sourceAiGenerationId: lastDoc.sourceAiGenerationId,
      }
    });
  } else {
    updatedDoc = await prisma.portfolioDocument.update({
      where: { id: lastDoc.id },
      data: {
        content: content ? JSON.stringify(content) : lastDoc.content,
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
