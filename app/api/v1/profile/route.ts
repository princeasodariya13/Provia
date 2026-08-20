import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileUpdateSchema } from "@/lib/schemas/profile";
import { APIError } from "@/lib/errors";

export const GET = withAPIHandler(async () => {
  const user = await requireAuth();

  let profile = await prisma.professionalProfile.findUnique({
    where: { userId: user.id },
    include: {
      experiences: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      links: true,
    }
  });

  if (!profile) {
    profile = await prisma.professionalProfile.create({
      data: { userId: user.id },
      include: {
        experiences: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
        links: true,
      }
    });
  }

  return NextResponse.json({
    success: true,
    data: profile,
  });
});

export const PUT = withAPIHandler(async (req: Request) => {
  const user = await requireAuth();
  const body = await req.json();

  const data = profileUpdateSchema.parse(body);

  let existingProfile = await prisma.professionalProfile.findUnique({
    where: { userId: user.id },
  });

  if (!existingProfile) {
    existingProfile = await prisma.professionalProfile.create({
      data: { userId: user.id }
    });
  }

  // Calculate new userEdits tracking map for scalar fields
  let userEdits: Record<string, boolean> = {};
  try {
    if (existingProfile.userEdits) {
      userEdits = JSON.parse(existingProfile.userEdits);
    }
  } catch (e) {
    // Ignore invalid JSON
  }

  if (data.fullName !== undefined && data.fullName !== existingProfile.fullName) userEdits.fullName = true;
  if (data.headline !== undefined && data.headline !== existingProfile.headline) userEdits.headline = true;
  if (data.bio !== undefined && data.bio !== existingProfile.bio) userEdits.bio = true;
  if (data.location !== undefined && data.location !== existingProfile.location) userEdits.location = true;
  if (data.website !== undefined && data.website !== existingProfile.website) userEdits.website = true;

  // We perform an atomic transaction to completely replace nested lists, while preserving 'source' and 'externalId' if they existed.
  // To do this cleanly, we delete all items not present in the update array, update existing ones, and create new ones.

  await prisma.$transaction(async (tx) => {
    // Update scalar fields
    await tx.professionalProfile.update({
      where: { userId: user.id },
      data: {
        fullName: data.fullName !== undefined ? data.fullName : undefined,
        headline: data.headline !== undefined ? data.headline : undefined,
        bio: data.bio !== undefined ? data.bio : undefined,
        location: data.location !== undefined ? data.location : undefined,
        website: data.website !== undefined ? data.website : undefined,
        userEdits: JSON.stringify(userEdits),
      }
    });

    // Helper to sync relational arrays
    if (data.experiences) {
      const incomingIds = data.experiences.filter(e => e.id).map(e => e.id as string);
      await tx.professionalExperience.deleteMany({
        where: { profileId: existingProfile.id, id: { notIn: incomingIds } }
      });
      for (const item of data.experiences) {
        if (item.id) {
          await tx.professionalExperience.update({
            where: { id: item.id, profileId: existingProfile.id },
            data: { ...item, id: undefined, isManuallyEdited: true }
          });
        } else {
          await tx.professionalExperience.create({
            data: { ...item, profileId: existingProfile.id, source: "MANUAL", isManuallyEdited: true }
          });
        }
      }
    }

    if (data.education) {
      const incomingIds = data.education.filter(e => e.id).map(e => e.id as string);
      await tx.professionalEducation.deleteMany({
        where: { profileId: existingProfile.id, id: { notIn: incomingIds } }
      });
      for (const item of data.education) {
        if (item.id) {
          await tx.professionalEducation.update({
            where: { id: item.id, profileId: existingProfile.id },
            data: { ...item, id: undefined, isManuallyEdited: true }
          });
        } else {
          await tx.professionalEducation.create({
            data: { ...item, profileId: existingProfile.id, source: "MANUAL", isManuallyEdited: true }
          });
        }
      }
    }

    if (data.skills) {
      const incomingNames = data.skills.map(s => s.name);
      await tx.professionalSkill.deleteMany({
        where: { profileId: existingProfile.id, name: { notIn: incomingNames } }
      });
      for (const item of data.skills) {
        await tx.professionalSkill.upsert({
          where: { profileId_name: { profileId: existingProfile.id, name: item.name } },
          update: {},
          create: { name: item.name, profileId: existingProfile.id, source: "MANUAL" }
        });
      }
    }

    if (data.projects) {
      const incomingIds = data.projects.filter(e => e.id).map(e => e.id as string);
      await tx.professionalProject.deleteMany({
        where: { profileId: existingProfile.id, id: { notIn: incomingIds } }
      });
      for (const item of data.projects) {
        if (item.id) {
          await tx.professionalProject.update({
            where: { id: item.id, profileId: existingProfile.id },
            data: { ...item, id: undefined, isManuallyEdited: true }
          });
        } else {
          await tx.professionalProject.create({
            data: { ...item, profileId: existingProfile.id, source: "MANUAL", isManuallyEdited: true }
          });
        }
      }
    }

    if (data.certifications) {
      const incomingIds = data.certifications.filter(e => e.id).map(e => e.id as string);
      await tx.professionalCertification.deleteMany({
        where: { profileId: existingProfile.id, id: { notIn: incomingIds } }
      });
      for (const item of data.certifications) {
        if (item.id) {
          await tx.professionalCertification.update({
            where: { id: item.id, profileId: existingProfile.id },
            data: { ...item, id: undefined, isManuallyEdited: true }
          });
        } else {
          await tx.professionalCertification.create({
            data: { ...item, profileId: existingProfile.id, source: "MANUAL", isManuallyEdited: true }
          });
        }
      }
    }

    if (data.links) {
      const incomingIds = data.links.filter(e => e.id).map(e => e.id as string);
      await tx.professionalLink.deleteMany({
        where: { profileId: existingProfile.id, id: { notIn: incomingIds } }
      });
      for (const item of data.links) {
        if (item.id) {
          await tx.professionalLink.update({
            where: { id: item.id, profileId: existingProfile.id },
            data: { ...item, id: undefined, isManuallyEdited: true }
          });
        } else {
          await tx.professionalLink.create({
            data: { ...item, profileId: existingProfile.id, source: "MANUAL", isManuallyEdited: true }
          });
        }
      }
    }
  });

  return NextResponse.json({
    success: true,
    data: { message: "Profile updated successfully" },
  });
});
