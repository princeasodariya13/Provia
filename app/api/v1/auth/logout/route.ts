import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { clearSession } from "@/lib/auth";

export const POST = withAPIHandler(async () => {
  await clearSession();
  
  return NextResponse.json({
    success: true,
  });
});
