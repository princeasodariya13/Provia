import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const POST = withAPIHandler(async (request: Request, { params }: any) => {
  const user = await requireAuth();
  const provider = params.provider.toUpperCase();

  await prisma.connection.deleteMany({
    where: { 
      userId: user.id,
      provider: provider as any,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Disconnected from ${provider} successfully.`
  });
});
