import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const importReposSchema = z.object({
  repositories: z.array(z.object({
    name: z.string(),
    description: z.string().nullable().optional(),
    htmlUrl: z.string(),
    homepageUrl: z.string().nullable().optional(),
    language: z.string().nullable().optional(),
    topics: z.array(z.string()).optional(),
  }))
});

export const POST = withAPIHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();
  const data = importReposSchema.parse(body);

  const profile = await prisma.professionalProfile.findFirst({
    where: { userId: user.id }
  });

  if (!profile) {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }

  for (const repo of data.repositories) {
    const technologies = [
      ...(repo.language ? [repo.language] : []),
      ...(repo.topics || []),
    ]
      .filter(Boolean)
      .slice(0, 10)
      .join(", ");

    // Check if it exists
    const existing = await prisma.professionalProject.findFirst({
      where: { profileId: profile.id, externalId: repo.htmlUrl },
    });

    if (existing) {
      if (!existing.isManuallyEdited) {
        await prisma.professionalProject.update({
          where: { id: existing.id },
          data: {
            description: repo.description,
            repositoryUrl: repo.htmlUrl,
            url: repo.homepageUrl || null,
            technologies,
          },
        });
      }
    } else {
      const nameMatch = await prisma.professionalProject.findFirst({
        where: {
          profileId: profile.id,
          name: { equals: repo.name, mode: "insensitive" },
          isManuallyEdited: true,
        },
      });
      if (!nameMatch) {
        await prisma.professionalProject.create({
          data: {
            profileId: profile.id,
            name: repo.name,
            description: repo.description,
            repositoryUrl: repo.htmlUrl,
            url: repo.homepageUrl || null,
            technologies,
            source: "GITHUB",
            externalId: repo.htmlUrl,
          },
        });
      }
    }
  }

  return NextResponse.json({ success: true });
});
