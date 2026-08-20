import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { logger } from "@/lib/logger";

export const GET = withAPIHandler(async () => {
  logger.info("Health check endpoint hit");
  
  // Future: check DB connectivity when DB is active
  
  return NextResponse.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
    }
  });
});
