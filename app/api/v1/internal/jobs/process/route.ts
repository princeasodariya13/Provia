import { NextResponse } from "next/server";
import { JobProcessor } from "@/lib/jobs/processor";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

// Support maximum Vercel function duration depending on plan (hobby 10s-60s, pro 300s)
// We default to maxDuration 60 in Next.js 14+ config, but Vercel limits apply.
export const maxDuration = 60; 
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. Authenticate the cron request
    const authHeader = req.headers.get("authorization");
    
    // Check if we have a CRON_SECRET configured
    if (!env.CRON_SECRET) {
      logger.error("CRON_SECRET is not configured. Serverless job processing disabled.");
      return NextResponse.json({ success: false, error: "Cron not configured" }, { status: 501 });
    }

    // Vercel Cron can send authorization header formatted as Bearer <CRON_SECRET>
    const expectedAuth = `Bearer ${env.CRON_SECRET}`;
    
    // Also support custom header just in case
    const customHeader = req.headers.get("x-cron-secret");

    if (authHeader !== expectedAuth && customHeader !== env.CRON_SECRET) {
      logger.warn("Unauthorized attempt to access internal job processor");
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Process jobs with serverless constraints
    // Max 5 jobs, up to 45 seconds to leave buffer before 60s maxDuration timeout
    const batchResult = await JobProcessor.processBatch(5, 45000);

    return NextResponse.json({
      success: true,
      data: batchResult
    });

  } catch (error) {
    logger.error({ err: error }, "Unhandled error in internal job processor endpoint");
    return NextResponse.json(
      { success: false, error: "Internal server error during job processing" },
      { status: 500 }
    );
  }
}
