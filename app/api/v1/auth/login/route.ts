import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { UnauthorizedError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";

export const POST = withAPIHandler(async (req) => {
  const body = await req.json();
  const data = loginSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user || !user.passwordHash) {
    AnalyticsService.record({ eventName: "auth.login_failed", metadata: { reason: "user_not_found" } });
    throw new UnauthorizedError("Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

  if (!isValidPassword) {
    AnalyticsService.record({ eventName: "auth.login_failed", userId: user.id, metadata: { reason: "invalid_password" } });
    throw new UnauthorizedError("Invalid email or password");
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email!,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  await createSession(safeUser);

  AnalyticsService.record({ eventName: "auth.login_succeeded", userId: user.id });

  return NextResponse.json({
    success: true,
    data: safeUser,
  });
});
