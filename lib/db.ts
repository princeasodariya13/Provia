import { PrismaClient } from "@prisma/client";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getDatabaseUrl = () => {
  const urlString = env.DATABASE_URL as string;
  if (!urlString) return urlString;
  
  try {
    const url = new URL(urlString);
    
    // Serverless/Next.js dev environments need lower connection limits to avoid exhaustion
    // and pool_timeout=0 prevents idle timeouts from throwing errors.
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", env.NODE_ENV === "development" ? "3" : "1");
    }
    
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "0");
    }
    
    // Automatically append pgbouncer=true for Supabase pooler URLs if not present
    if (url.hostname.includes("pooler.supabase.com") && !url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }
    
    return url.toString();
  } catch (e) {
    // Fallback if URL is malformed
    return urlString;
  }
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: getDatabaseUrl() } },
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
