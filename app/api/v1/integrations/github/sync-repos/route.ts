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

  const incomingUrls = data.repositories.map(r => r.html_url);
  
  const projectsToUnlinkOrDelete = await prisma.professionalProject.findMany({
    where: {
      profileId: profile.id,
      externalId: {
        notIn: incomingUrls,
        contains: "github.com"
      }
    }
  });

  for (const proj of projectsToUnlinkOrDelete) {
    if (proj.source === "GITHUB" && !proj.isManuallyEdited) {
      await prisma.professionalProject.delete({ where: { id: proj.id } });
    } else {
      await prisma.professionalProject.update({
        where: { id: proj.id },
        data: { externalId: null } // unlink it from GitHub
      });
    }
  }

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
      const updateData: any = {};
      
      // Always inherit missing links from GitHub even if manually edited
      if (!existing.url && repo.homepage) updateData.url = repo.homepage;
      if (!existing.repositoryUrl && repo.html_url) updateData.repositoryUrl = repo.html_url;

      if (!existing.isManuallyEdited) {
        updateData.description = repo.description;
        updateData.repositoryUrl = repo.html_url;
        updateData.url = repo.homepage || null;
        updateData.technologies = technologies;
      }
      
      if (Object.keys(updateData).length > 0) {
        await prisma.professionalProject.update({
          where: { id: existing.id },
          data: updateData,
        });
      }
    } else {
      // Find ANY existing project with a similar normalized name
      const allProjects = await prisma.professionalProject.findMany({ where: { profileId: profile.id } });
      const repoNormalized = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameMatch = allProjects.find(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === repoNormalized);
      
      if (nameMatch) {
        // Merge GitHub rich data into the existing project
        const updateData: any = {
          externalId: repo.html_url, // ALWAYS link it to github for future syncs
          repositoryUrl: nameMatch.repositoryUrl || repo.html_url,
          url: nameMatch.url || repo.homepage || null, // Always add url if missing
        };
        
        if (!nameMatch.isManuallyEdited) {
          updateData.technologies = nameMatch.technologies 
            ? Array.from(new Set([...nameMatch.technologies.split(",").map(t => t.trim()), ...technologies.split(",").map(t => t.trim())])).filter(Boolean).join(", ") 
            : technologies;
          updateData.description = (!nameMatch.description || nameMatch.description.length < 20) && repo.description ? repo.description : nameMatch.description;
          updateData.url = repo.homepage || nameMatch.url || null;
          updateData.source = "GITHUB"; // Upgrade the source so it gets precedence
        }

        await prisma.professionalProject.update({
          where: { id: nameMatch.id },
          data: updateData,
        });
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
