import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { APIError } from "@/lib/errors";
import { RateLimiterService } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/ip";
import { AnalyticsService } from "@/lib/analytics/service";
import { env } from "@/lib/env";

export const GET = withAPIHandler(async (req) => {
  const user = await requireAuth();
  const ip = getClientIp(req);
  
  // Rate limiting (max 3 exports per window)
  const windowSecs = parseInt(env.AUTH_RATE_LIMIT_WINDOW_SECONDS); // typically 900s or 3600s
  const rateLimitResult = await RateLimiterService.check(
    `account:export:${user.id}`,
    3,
    windowSecs
  );

  if (!rateLimitResult.allowed) {
    AnalyticsService.record({ 
      eventName: "account.export_rate_limited", 
      userId: user.id,
      metadata: { ip } 
    });
    throw new APIError("Too many requests. Please try again later.", 429);
  }

  // Fetch full user data scoped to user.id
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      // passwordHash is EXPLICITLY OMITTED
      profile: {
        include: {
          experiences: true,
          education: true,
          skills: true,
          projects: true,
          certifications: true,
          links: true,
        }
      },
      connections: {
        select: {
          id: true,
          provider: true,
          state: true,
          externalId: true,
          lastSyncAt: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
          // accessToken and refreshToken are EXPLICITLY OMITTED
          rawSnapshots: {
            select: {
              id: true,
              data: true,
              createdAt: true,
            }
          }
        }
      },
      generations: {
        select: {
          id: true,
          generationType: true,
          provider: true,
          model: true,
          promptVersion: true,
          status: true,
          failureReason: true,
          result: true,
          usage: true,
          createdAt: true,
          completedAt: true,
        }
      },
      portfolios: {
        select: {
          id: true,
          version: true,
          status: true,
          content: true,
          templateId: true,
          templateConfig: true,
          createdAt: true,
          updatedAt: true,
          publications: {
            select: {
              id: true,
              publicSlug: true,
              isActive: true,
              publishedAt: true,
              updatedAt: true,
            }
          }
        }
      },
      resumes: {
        select: {
          id: true,
          originalFileName: true,
          mimeType: true,
          fileSize: true,
          status: true,
          structuredData: true,
          extractionError: true,
          isActive: true,
          version: true,
          createdAt: true,
          updatedAt: true,
        }
      }
    }
  });

  if (!fullUser) {
    throw new APIError("User data not found", 404);
  }

  // Fetch analytics events associated with the user
  const analyticsEvents = await prisma.analyticsEvent.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      eventName: true,
      metadata: true,
      createdAt: true,
      // requestId is EXPLICITLY OMITTED
    },
    orderBy: { createdAt: "desc" }
  });

  // Construct explicitly sanitized DTO
  const exportPayload = {
    exportVersion: "1.0",
    exportedAt: new Date().toISOString(),
    user: {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      emailVerified: fullUser.emailVerified,
      role: fullUser.role,
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt,
    },
    profile: fullUser.profile ? {
      fullName: fullUser.profile.fullName,
      headline: fullUser.profile.headline,
      bio: fullUser.profile.bio,
      location: fullUser.profile.location,
      avatarUrl: fullUser.profile.avatarUrl,
      website: fullUser.profile.website,
      currentCompany: fullUser.profile.currentCompany,
      jobTitle: fullUser.profile.jobTitle,
      githubUsername: fullUser.profile.githubUsername,
      languages: fullUser.profile.languages,
      userEdits: fullUser.profile.userEdits ? JSON.parse(fullUser.profile.userEdits) : null,
      createdAt: fullUser.profile.createdAt,
      updatedAt: fullUser.profile.updatedAt,
      experiences: fullUser.profile.experiences,
      education: fullUser.profile.education,
      skills: fullUser.profile.skills,
      projects: fullUser.profile.projects,
      certifications: fullUser.profile.certifications,
      links: fullUser.profile.links,
    } : null,
    connections: fullUser.connections.map(c => ({
      id: c.id,
      provider: c.provider,
      state: c.state,
      externalId: c.externalId,
      lastSyncAt: c.lastSyncAt,
      errorMessage: c.errorMessage,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      rawSnapshots: c.rawSnapshots.map(s => ({
        id: s.id,
        createdAt: s.createdAt,
        data: s.data ? JSON.parse(s.data) : null,
      }))
    })),
    generations: fullUser.generations,
    portfolios: fullUser.portfolios.map(p => ({
      ...p,
      content: p.content ? JSON.parse(p.content) : null,
      templateConfig: p.templateConfig ? JSON.parse(p.templateConfig) : null,
    })),
    analytics: analyticsEvents.map(a => ({
      id: a.id,
      eventName: a.eventName,
      createdAt: a.createdAt,
      metadata: a.metadata ? JSON.parse(a.metadata) : null,
    })),
    resumes: fullUser.resumes.map(r => ({
      id: r.id,
      filename: r.originalFileName,
      mimeType: r.mimeType,
      size: r.fileSize,
      status: r.status,
      structuredData: r.structuredData ? JSON.parse(r.structuredData) : null,
      extractionError: r.extractionError,
      isActive: r.isActive,
      version: r.version,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  };

  AnalyticsService.record({ 
    eventName: "account.export_completed", 
    userId: user.id 
  });

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="provia-account-data-${new Date().toISOString().split("T")[0]}.json"`
    }
  });
});
