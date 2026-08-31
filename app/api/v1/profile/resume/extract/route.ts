import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ResumeExtractionHandler } from "@/lib/jobs/handlers/resume-extraction";

export const maxDuration = 60;
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

  // Forcefully un-stick the resume in case it was stuck in a previous failed background job
  await prisma.resume.update({
    where: { id: resume.id },
    data: { status: "PROCESSING" }
  });

  try {
    // Run the extraction directly, bypassing the brittle background job queue lock
    // This guarantees it executes immediately for the user within this exact serverless function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await ResumeExtractionHandler.handler({
      id: "direct-execution",
      userId: user.id,
      type: "RESUME_EXTRACTION",
      status: "PROCESSING",
      payload: { userId: user.id, resumeId: resume.id },
      attempts: 1,
      maxAttempts: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return NextResponse.json({
      success: true,
      data: { status: "COMPLETED" }
    });
  } catch (error) {
    // Handle error gracefully so the frontend can display it instead of loading forever
    await prisma.resume.update({
      where: { id: resume.id },
      data: { 
        status: "FAILED", 
        extractionError: error instanceof Error ? error.message : "Unknown error during direct extraction" 
      }
    });

    return NextResponse.json(
      { success: false, error: "Failed to extract resume data" },
      { status: 500 }
    );
  }
});
