import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export const POST = withAPIHandler(async () => {
  const user = await requireAuth();

  const publication = await prisma.portfolioPublication.findUnique({
    where: { userId: user.id }
  });

  if (!publication) {
    return NextResponse.json(
      { success: false, error: "No portfolio publication found." },
      { status: 404 }
    );
  }

  // Generate a cryptographically secure 32-character hexadecimal code
  let newPublicCode = "";
  let isUnique = false;

  while (!isUnique) {
    newPublicCode = crypto.randomBytes(16).toString("hex");
    const existing = await prisma.portfolioPublication.findUnique({
      where: { publicCode: newPublicCode }
    });
    if (!existing) {
      isUnique = true;
    }
  }

  await prisma.portfolioPublication.update({
    where: { id: publication.id },
    data: { publicCode: newPublicCode }
  });

  return NextResponse.json({
    success: true,
    data: {
      publicCode: newPublicCode
    }
  });
});
