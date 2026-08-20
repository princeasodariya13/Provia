import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { APIError } from "@/lib/errors";
import { AnalyticsService } from "@/lib/analytics/service";

export const POST = withAPIHandler(async (req) => {
  const body = await req.json();
  const data = registerSchema.parse(body);

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new APIError("An account with this email already exists", 409);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });

  await createSession({
    id: user.id,
    role: user.role,
    email: user.email!,
  });

  AnalyticsService.record({
    eventName: "auth.registered",
    userId: user.id,
  });

  return NextResponse.json({
    success: true,
    data: user,
  });
});
