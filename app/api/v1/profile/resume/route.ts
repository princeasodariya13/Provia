import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RateLimiterService } from "@/lib/rate-limit";
import { CloudinaryService } from "@/lib/cloudinary/service";
import { JobService } from "@/lib/jobs";
import { APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";


export const POST = withAPIHandler(async (req) => {
  const user = await requireAuth();

  // Rate Limit: 5 / 15 minutes / user
  const rateLimitResult = await RateLimiterService.check(
    `api:resume:upload:${user.id}`,
    5,
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

  if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
    throw new APIError("Only PDF files are allowed", 400);
  }

  if (file.size === 0) {
    throw new APIError("File is empty", 400);
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new APIError("File exceeds 5MB limit", 400);
  }

  const randomId = crypto.randomUUID().replace(/-/g, "");
  const publicId = `provia/users/${user.id}/resume/${randomId}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResult = await CloudinaryService.uploadBuffer(buffer, publicId, "auto", file.type);

  // Soft deactivate existing active resumes for the user
  await prisma.resume.updateMany({
    where: { userId: user.id, isActive: true },
    data: { isActive: false }
  });

  // Calculate new version
  const lastResume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { version: "desc" }
  });
  const newVersion = lastResume ? lastResume.version + 1 : 1;

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      fileUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      originalFileName: file.name,
      mimeType: file.type,
      fileSize: uploadResult.bytes,
      status: "QUEUED",
      isActive: true,
      version: newVersion,
    }
  });

  const job = await JobService.createJob({
    userId: user.id,
    type: "RESUME_EXTRACTION",
    payload: { userId: user.id, resumeId: resume.id },
    idempotencyKey: `resume-extraction-${resume.id}`,
  });

  AnalyticsService.record({
    eventName: "resume.uploaded",
    userId: user.id,
    metadata: { resumeId: resume.id }
  });

  return NextResponse.json({
    success: true,
    data: {
      resumeId: resume.id,
      status: job.status,
    }
  }, { status: 202 });
});

export const GET = withAPIHandler(async () => {
  const user = await requireAuth();

  const resume = await prisma.resume.findFirst({
    where: { userId: user.id, isActive: true },
    orderBy: { version: "desc" }
  });

  if (!resume) {
    return NextResponse.json({ success: true, data: null });
  }

  return NextResponse.json({
    success: true,
    data: {
      resumeId: resume.id,
      status: resume.status,
      filename: resume.originalFileName,
      size: resume.fileSize,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      extractionError: resume.extractionError,
      structuredData: resume.structuredData ? JSON.parse(resume.structuredData) : null,
    }
  });
});
