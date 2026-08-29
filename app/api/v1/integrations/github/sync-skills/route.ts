import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const importSkillsSchema = z.object({
  skills: z.array(z.string()),
});

export const POST = withAPIHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();
  const data = importSkillsSchema.parse(body);

  const profile = await prisma.professionalProfile.findFirst({
    where: { userId: user.id },
  });

  if (!profile) {
    return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
  }

  // Delete skills that are not in the new list, but ONLY ones from GITHUB
  await prisma.professionalSkill.deleteMany({
    where: {
      profileId: profile.id,
      source: "GITHUB",
      name: {
        notIn: data.skills
      }
    }
  });

  for (const skillName of data.skills) {
    await prisma.professionalSkill.upsert({
      where: {
        profileId_name: { profileId: profile.id, name: skillName },
      },
      update: {}, 
      create: {
        profileId: profile.id,
        name: skillName,
        source: "GITHUB",
      },
    });
  }

  return NextResponse.json({ success: true });
});
