import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APIError } from "@/lib/errors";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAPIHandler(async (request: Request, { params }: any) => {
  const user = await requireAuth();
  const { id: portfolioDocumentId } = await params;

  // 1. Verify ownership of the PortfolioDocument
  const document = await prisma.portfolioDocument.findUnique({
    where: { 
      id: portfolioDocumentId,
      userId: user.id
    },
    include: {
      sourceProfile: true
    }
  });

  if (!document) {
    throw new APIError("Portfolio document not found", 404);
  }

  // 2. Generate slug based on user's name or fallback
  const baseSlug = (document.sourceProfile.fullName || "portfolio")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let uniqueSlug = baseSlug;
  
  // 3. Upsert Publication
  // We check if the user already has a publication
  const existingPub = await prisma.portfolioPublication.findUnique({
    where: { userId: user.id }
  });

  if (existingPub) {
    // Just update the pointer
    uniqueSlug = existingPub.publicSlug; // preserve existing slug
    const pub = await prisma.portfolioPublication.update({
      where: { userId: user.id },
      data: {
        portfolioDocumentId,
        isActive: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        publicSlug: pub.publicSlug,
        isActive: pub.isActive,
        publishedAt: pub.publishedAt,
        publicUrl: `/p/${pub.publicSlug}`
      }
    });
  }

  // New publication: ensure slug uniqueness across the whole system
  let counter = 1;
  while (true) {
    const collision = await prisma.portfolioPublication.findUnique({
      where: { publicSlug: uniqueSlug }
    });
    if (!collision) break;
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  const pub = await prisma.portfolioPublication.create({
    data: {
      userId: user.id,
      portfolioDocumentId,
      publicSlug: uniqueSlug,
      isActive: true,
    }
  });

  return NextResponse.json({
    success: true,
    data: {
      publicSlug: pub.publicSlug,
      isActive: pub.isActive,
      publishedAt: pub.publishedAt,
      publicUrl: `/p/${pub.publicSlug}`
    }
  });
});
