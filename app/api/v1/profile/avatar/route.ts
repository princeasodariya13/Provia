import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RateLimiterService } from "@/lib/rate-limit";
import { CloudinaryService } from "@/lib/cloudinary/service";
import { APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";
import * as crypto from "crypto";

export const POST = withAPIHandler(async (req) => {
  const user = await requireAuth();

  // Rate Limit: 10 / 15 minutes / user
  const rateLimitResult = await RateLimiterService.check(
    `api:avatar:upload:${user.id}`,
    10,
    900
  );

  if (!rateLimitResult.allowed) {
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  if (!CloudinaryService.isConfigured()) {
    throw new APIError("Cloudinary is not configured", 501);
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    throw new APIError("No file provided", 400);
  }

  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    throw new APIError("Only JPEG or PNG images are allowed", 400);
  }

  if (file.size === 0) {
    throw new APIError("File is empty", 400);
  }

  if (file.size > 2 * 1024 * 1024) {
    throw new APIError("File exceeds 2MB limit", 400);
  }

  let profile = await prisma.professionalProfile.findFirst({
    where: { userId: user.id }
  });

  if (!profile) {
    profile = await prisma.professionalProfile.create({
      data: { userId: user.id }
    });
  }

  // If there's an existing Cloudinary avatar, delete it
  if (profile.avatarUrl && profile.avatarUrl.includes("cloudinary.com/")) {
    try {
      // Extract public_id from secure URL
      // Example: https://res.cloudinary.com/.../image/upload/v1234567/provia/users/cuid/avatar/random.jpg
      // Assuming a predictable pattern, but the safest way is to regex it:
      const matches = profile.avatarUrl.match(/upload\/(?:v\d+\/)?(provia\/users\/[^/]+\/avatar\/[^.]+)/);
      if (matches && matches[1]) {
        await CloudinaryService.destroyAsset(matches[1], "image");
      }
    } catch {
      // Ignore destroy failure
    }
  }

  const randomId = crypto.randomBytes(16).toString("hex");
  const publicId = `provia/users/${user.id}/avatar/${randomId}`;
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResult = await CloudinaryService.uploadBuffer(buffer, publicId, "image");

  await prisma.professionalProfile.update({
    where: { id: profile.id },
    data: { avatarUrl: uploadResult.secureUrl }
  });

  AnalyticsService.record({
    eventName: "asset.avatar_updated",
    userId: user.id,
  });

  return NextResponse.json({
    success: true,
    data: {
      avatarUrl: uploadResult.secureUrl
    }
  }, { status: 200 });
});

export const DELETE = withAPIHandler(async (req) => {
  const user = await requireAuth();

  const profile = await prisma.professionalProfile.findFirst({
    where: { userId: user.id }
  });

  if (!profile || !profile.avatarUrl) {
    return NextResponse.json({ success: true, data: { message: "No avatar to delete" } }, { status: 200 });
  }

  // If there's an existing Cloudinary avatar, delete it
  if (profile.avatarUrl.includes("cloudinary.com/")) {
    try {
      const matches = profile.avatarUrl.match(/upload\/(?:v\d+\/)?(provia\/users\/[^/]+\/avatar\/[^.]+)/);
      if (matches && matches[1]) {
        await CloudinaryService.destroyAsset(matches[1], "image");
      }
    } catch {
      // Ignore destroy failure
    }
  }

  await prisma.professionalProfile.update({
    where: { id: profile.id },
    data: { avatarUrl: null }
  });

  AnalyticsService.record({
    eventName: "asset.avatar_removed",
    userId: user.id,
  });

  return NextResponse.json({
    success: true,
    data: {
      message: "Avatar removed successfully"
    }
  }, { status: 200 });
});
