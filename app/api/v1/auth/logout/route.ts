import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { AnalyticsService } from "@/lib/analytics/service";
import { clearSession } from "@/lib/auth";

export const POST = withAPIHandler(async () => {
  const user = await requireAuth().catch(() => null);

  await clearSession();

  if (user) {
    AnalyticsService.record({ eventName: "auth.logout", userId: user.id });
  }
  
  return NextResponse.json({
    success: true,
  });
});
