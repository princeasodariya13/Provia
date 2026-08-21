import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";
import { prisma } from "./db";
import { UnauthorizedError, ForbiddenError } from "./errors";
import { User, Role } from "@prisma/client";

const SECRET_KEY = new TextEncoder().encode(env.SESSION_SECRET);
const COOKIE_NAME = "provia_session";

export interface SessionPayload {
  userId: string;
  role: Role;
  email: string;
  sessionVersion: number;
  expiresAt: number;
}

export async function encrypt(payload: Omit<SessionPayload, "expiresAt">) {
  const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  return new SignJWT({ ...payload, expiresAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(user: Pick<User, "id" | "role" | "sessionVersion"> & { email: string }) {
  const sessionToken = await encrypt({
    userId: user.id,
    role: user.role,
    email: user.email,
    sessionVersion: user.sessionVersion,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  
  const payload = await decrypt(token);
  if (!payload || payload.expiresAt < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return payload;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, sessionVersion: true, createdAt: true, updatedAt: true }
  });
  
  if (!user || user.sessionVersion !== session.sessionVersion) {
    return null; // Session revoked or user deleted
  }
  
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError("You must be logged in to access this resource");
  }
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new ForbiddenError("You do not have permission to access this resource");
  }
  return user;
}
