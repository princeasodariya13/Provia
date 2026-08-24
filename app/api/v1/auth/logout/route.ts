import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { getSession } from "@/lib/auth";
import { AnalyticsService } from "@/lib/analytics/service";
import { clearSession } from "@/lib/auth";

export const POST = withAPIHandler(async () => {
  const session = await getSession();

  await clearSession();

  if (session) {
    AnalyticsService.record({ eventName: "auth.logout", userId: session.userId });
  }
  
  return NextResponse.json({
    success: true,
  });
});
