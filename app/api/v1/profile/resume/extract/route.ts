import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ResumeExtractionHandler } from "@/lib/jobs/handlers/resume-extraction";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export const POST = withAPIHandler(async () => {
  const user = await requireAuth();

  // Find the active resume for this user
  const resume = await prisma.resume.findFirst({
    where: { userId: user.id, isActive: true },
    orderBy: { version: "desc" }
  });

  if (!resume) {
    return NextResponse.json({ success: false, error: "No active resume found" }, { status: 404 });
  }

  if (resume.status === "COMPLETED") {
    return NextResponse.json({ success: true, data: { status: "COMPLETED" } });
  }

  // Atomic: only claim the job if it is not already being processed by another serverless invocation.
  // This prevents a race between the upload handler and the on-mount auto-recovery.
  const claimed = await prisma.resume.updateMany({
    where: { id: resume.id, status: { not: "PROCESSING" } },
    data: { status: "PROCESSING", extractionError: null },
  });

  // If another invocation already claimed it, just return a 202 so the UI keeps polling
  if (claimed.count === 0 && resume.status === "PROCESSING") {
    return NextResponse.json({ success: true, data: { status: "PROCESSING" } }, { status: 202 });
  }

  try {
    // Run the extraction directly, bypassing the brittle background job queue lock.
    // This guarantees it executes immediately for the user within this exact serverless function.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ResumeExtractionHandler.handler({
      id: "direct-execution",
      userId: user.id,
      type: "RESUME_EXTRACTION",
      status: "PROCESSING",
      payload: { userId: user.id, resumeId: resume.id },
      attempts: 1,
      maxAttempts: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return NextResponse.json({
      success: true,
      data: { status: "COMPLETED" }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error during extraction";
    // Mark as FAILED so the UI can surface the real error and offer a retry
    await prisma.resume.update({
      where: { id: resume.id },
      data: {
        status: "FAILED",
        extractionError: errorMessage,
      }
    });

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
});
