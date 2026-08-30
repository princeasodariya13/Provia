import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { getCurrentUser, clearSession } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";

export const GET = withAPIHandler(async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    // If token exists but is invalid/revoked in DB, clear it to prevent infinite redirect loops with proxy
    await clearSession();
    throw new UnauthorizedError("Not authenticated");
  }

  return NextResponse.json({
    success: true,
    data: user,
  });
});
