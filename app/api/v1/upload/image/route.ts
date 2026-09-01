import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { RateLimiterService } from "@/lib/rate-limit";
import { CloudinaryService } from "@/lib/cloudinary/service";
import { APIError } from "@/lib/errors";
import * as crypto from "crypto";

export const POST = withAPIHandler(async (req) => {
  const user = await requireAuth();

  const rateLimitResult = await RateLimiterService.check(
    `api:upload:image:${user.id}`,
    20,
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

  if (!file.type.startsWith("image/")) {
    throw new APIError("Only images are allowed", 400);
  }

  if (file.size === 0) {
    throw new APIError("File is empty", 400);
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new APIError("File exceeds 5MB limit", 400);
  }

  const randomId = crypto.randomBytes(16).toString("hex");
  const publicId = `provia/users/${user.id}/uploads/${randomId}`;
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResult = await CloudinaryService.uploadBuffer(buffer, publicId, "image");

  return NextResponse.json({
    success: true,
    data: {
      url: uploadResult.secureUrl
    }
  }, { status: 200 });
});
