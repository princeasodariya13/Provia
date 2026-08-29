import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const importReposSchema = z.object({
  repositories: z.array(z.object({
    name: z.string(),
    description: z.string().nullable().optional(),
    html_url: z.string(),
    homepage: z.string().nullable().optional(),
    language: z.string().nullable().optional(),
    topics: z.array(z.string()).optional(),
    all_languages: z.array(z.string()).optional(),
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

  // First, delete any GITHUB projects that are NOT in the incoming list
  // but only if they haven't been manually edited.
  const incomingUrls = data.repositories.map(r => r.html_url);
  await prisma.professionalProject.deleteMany({
    where: {
      profileId: profile.id,
      source: "GITHUB",
      isManuallyEdited: false,
      externalId: {
        notIn: incomingUrls
      }
    }
  });

  for (const repo of data.repositories) {
    const technologies = [
      ...(repo.language ? [repo.language] : []),
      ...(repo.topics || []),
      ...(repo.all_languages || []),
    ]
      .filter(Boolean)
      .slice(0, 10)
      .join(", ");

    // Check if it exists
    const existing = await prisma.professionalProject.findFirst({
      where: { profileId: profile.id, externalId: repo.html_url },
    });

    if (existing) {
      if (!existing.isManuallyEdited) {
        await prisma.professionalProject.update({
          where: { id: existing.id },
          data: {
            description: repo.description,
            repositoryUrl: repo.html_url,
            url: repo.homepage || null,
            technologies,
          },
        });
      }
    } else {
      // Find ANY existing project with the same name, regardless of source (e.g. from RESUME)
      const nameMatch = await prisma.professionalProject.findFirst({
        where: {
          profileId: profile.id,
          name: { equals: repo.name, mode: "insensitive" },
        },
      });
      
      if (nameMatch) {
        // Merge GitHub rich data into the existing project
        if (!nameMatch.isManuallyEdited) {
          await prisma.professionalProject.update({
            where: { id: nameMatch.id },
            data: {
              // Combine technologies if both exist
              technologies: nameMatch.technologies 
                ? Array.from(new Set([...nameMatch.technologies.split(",").map(t => t.trim()), ...technologies.split(",").map(t => t.trim())])).filter(Boolean).join(", ") 
                : technologies,
              // Only overwrite description if the existing one is empty or short
              description: (!nameMatch.description || nameMatch.description.length < 20) && repo.description ? repo.description : nameMatch.description,
              repositoryUrl: repo.html_url,
              url: repo.homepage || nameMatch.url || null,
              externalId: repo.html_url, // link it to github for future syncs
            },
          });
        }
      } else {
        await prisma.professionalProject.create({
          data: {
            profileId: profile.id,
            name: repo.name,
            description: repo.description,
            repositoryUrl: repo.html_url,
            url: repo.homepage || null,
            technologies,
            source: "GITHUB",
            externalId: repo.html_url,
          },
        });
      }
    }
  }

  return NextResponse.json({ success: true });
});
