import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { getCurrentUser } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";

export const GET = withAPIHandler(async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new UnauthorizedError("Not authenticated");
  }

  return NextResponse.json({
    success: true,
    data: user,
  });
});
