import { NextResponse } from "next/server";
import { JobProcessor } from "@/lib/jobs/processor";
import { logger } from "@/lib/logger";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // We don't require auth here so it can be fire-and-forget from the client without strict session checks
    // Process exactly 1 job to quickly handle the user's resume upload
    const batchResult = await JobProcessor.processBatch(1, 45000);

    return NextResponse.json({
      success: true,
      data: batchResult
    });
  } catch (error) {
    logger.error({ err: error }, "Unhandled error in internal job trigger endpoint");
    return NextResponse.json(
      { success: false, error: "Internal server error during job processing" },
      { status: 500 }
    );
  }
}
