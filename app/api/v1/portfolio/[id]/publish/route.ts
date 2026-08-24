import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";
import * as crypto from "crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAPIHandler(async (request: Request, { params }: any) => {
  const user = await requireAuth();
  const { id: portfolioDocumentId } = await params;

  // 1. Verify ownership of the PortfolioDocument
  const document = await prisma.portfolioDocument.findFirst({
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

  // Guard: don't publish a stub/empty document
  if (!document.content || document.content === "{}") {
    throw new APIError("Portfolio content is empty. Please generate your portfolio first.", 400);
  }

  // 2. Mark this document as PUBLISHED
  await prisma.portfolioDocument.update({
    where: { id: portfolioDocumentId },
    data: { status: "PUBLISHED" }
  });

  // 2b. Mark any previous PUBLISHED doc as ARCHIVED (only one live doc at a time)
  await prisma.portfolioDocument.updateMany({
    where: {
      userId: user.id,
      status: "PUBLISHED",
      id: { not: portfolioDocumentId }
    },
    data: { status: "ARCHIVED" }
  });

  // 3. Generate slug based on user's name or fallback
  const baseName = document.sourceProfile.fullName || user.email.split("@")[0] || "portfolio";
  const baseSlug = baseName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let uniqueSlug = baseSlug;
  
  // 4. Upsert Publication — check if the user already has a publication
  const existingPub = await prisma.portfolioPublication.findFirst({
    where: { userId: user.id },
    include: { user: { select: { username: true } } }
  });

  if (existingPub) {
    uniqueSlug = existingPub.publicSlug; // preserve existing slug
    const pub = await prisma.portfolioPublication.update({
      where: { userId: user.id },
      data: {
        portfolioDocumentId,
        isActive: true,
        updatedAt: new Date(),
      }
    });

    if (pub.publicSlug) revalidatePath(`/p/${pub.publicSlug}`);
    if (existingPub.user?.username && pub.publicCode) {
      revalidatePath(`/${existingPub.user.username}/${pub.publicCode}`);
    }

    AnalyticsService.record({
      eventName: "portfolio.published",
      userId: user.id,
      entityId: portfolioDocumentId,
      metadata: { slug: pub.publicSlug }
    });

    return NextResponse.json({
      success: true,
      data: {
        publicSlug: pub.publicSlug,
        publicCode: pub.publicCode,
        isActive: pub.isActive,
        publishedAt: pub.publishedAt,
        publicUrl: pub.publicCode && existingPub.user?.username 
          ? `/${existingPub.user.username}/${pub.publicCode}`
          : `/p/${pub.publicSlug}`
      }
    });
  }

  // 5. New publication: ensure slug uniqueness
  let counter = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const collision = await prisma.portfolioPublication.findUnique({
      where: { publicSlug: uniqueSlug }
    });
    if (!collision) break;
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  // 6. Generate publicCode
  let newPublicCode = "";
  let isUniqueCode = false;

  while (!isUniqueCode) {
    newPublicCode = crypto.randomBytes(16).toString("hex");
    const existing = await prisma.portfolioPublication.findUnique({
      where: { publicCode: newPublicCode }
    });
    if (!existing) {
      isUniqueCode = true;
    }
  }

  const pub = await prisma.portfolioPublication.create({
    data: {
      userId: user.id,
      portfolioDocumentId,
      publicSlug: uniqueSlug,
      publicCode: newPublicCode,
      isActive: true,
    },
    include: { user: { select: { username: true } } }
  });

  revalidatePath(`/p/${pub.publicSlug}`);
  if (pub.user?.username && pub.publicCode) {
    revalidatePath(`/${pub.user.username}/${pub.publicCode}`);
  }

  AnalyticsService.record({
    eventName: "portfolio.published",
    userId: user.id,
    entityId: portfolioDocumentId,
    metadata: { slug: pub.publicSlug }
  });

  return NextResponse.json({
    success: true,
    data: {
      publicSlug: pub.publicSlug,
      publicCode: pub.publicCode,
      isActive: pub.isActive,
      publishedAt: pub.publishedAt,
      publicUrl: pub.publicCode && pub.user?.username 
        ? `/${pub.user.username}/${pub.publicCode}`
        : `/p/${pub.publicSlug}`
    }
  });
});
