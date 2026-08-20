import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { UnauthorizedError } from "@/lib/errors";

export const POST = withAPIHandler(async (req) => {
  const body = await req.json();
  const data = loginSchema.parse(body);

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user || !user.passwordHash) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

  if (!isValidPassword) {
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

  return NextResponse.json({
    success: true,
    data: safeUser,
  });
});
