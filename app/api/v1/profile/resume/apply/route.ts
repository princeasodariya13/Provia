import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { APIError } from "@/lib/errors";
import { ResumeExtractionData } from "@/lib/schemas/resume";
import { AnalyticsService } from "@/lib/analytics/service";

const applySchema = z.object({
  resumeId: z.string(),
  selections: z.object({
    personalInfo: z.boolean().default(false),
    summary: z.boolean().default(false),
    experience: z.array(z.number()).default([]),
    education: z.array(z.number()).default([]),
    skills: z.array(z.number()).default([]),
    projects: z.array(z.number()).default([]),
    certifications: z.array(z.number()).default([]),
    links: z.array(z.number()).default([]),
  })
});

export const POST = withAPIHandler(async (req) => {
  const user = await requireAuth();
  const body = await req.json();
  const { resumeId, selections } = applySchema.parse(body);

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId }
  });

  if (!resume || resume.userId !== user.id) {
    throw new APIError("Resume not found", 404);
  }

  if (resume.status !== "COMPLETED" || !resume.structuredData) {
    throw new APIError("Resume extraction is not complete", 400);
  }

  const structuredData: ResumeExtractionData = JSON.parse(resume.structuredData);

  // Upsert Profile
  let profile = await prisma.professionalProfile.findUnique({
    where: { userId: user.id }
  });

  if (!profile) {
    profile = await prisma.professionalProfile.create({
      data: { userId: user.id }
    });
  }

  const updateData: any = {};
  if (selections.personalInfo && structuredData.personalInfo) {
    if (structuredData.personalInfo.fullName) updateData.fullName = structuredData.personalInfo.fullName;
    if (structuredData.personalInfo.headline) updateData.headline = structuredData.personalInfo.headline;
    if (structuredData.personalInfo.location) updateData.location = structuredData.personalInfo.location;
    if (structuredData.personalInfo.website) updateData.website = structuredData.personalInfo.website;
  }
  
  if (selections.summary && structuredData.summary) {
    updateData.bio = structuredData.summary;
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.professionalProfile.update({
      where: { id: profile.id },
      data: updateData
    });
  }

  // Handle arrays - using prisma transactions
  const transactions = [];

  // Experience
  for (const idx of selections.experience) {
    const exp = structuredData.experience?.[idx];
    if (exp) {
      transactions.push(prisma.professionalExperience.create({
        data: {
          profileId: profile.id,
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate ? new Date(exp.startDate) : null,
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          isCurrent: exp.current,
          description: exp.description || (exp.responsibilities.length > 0 ? exp.responsibilities.join("\n") : null),
          source: "RESUME",
        }
      }));
    }
  }

  // Education
  for (const idx of selections.education) {
    const edu = structuredData.education?.[idx];
    if (edu) {
      transactions.push(prisma.professionalEducation.create({
        data: {
          profileId: profile.id,
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate ? new Date(edu.startDate) : null,
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          description: edu.description,
          source: "RESUME",
        }
      }));
    }
  }

  // Skills
  for (const idx of selections.skills) {
    const skill = structuredData.skills?.[idx];
    if (skill) {
      transactions.push(prisma.professionalSkill.upsert({
        where: { profileId_name: { profileId: profile.id, name: skill.name } },
        update: { source: "RESUME" },
        create: {
          profileId: profile.id,
          name: skill.name,
          source: "RESUME",
        }
      }));
    }
  }

  // Projects
  for (const idx of selections.projects) {
    const proj = structuredData.projects?.[idx];
    if (proj) {
      transactions.push(prisma.professionalProject.create({
        data: {
          profileId: profile.id,
          name: proj.name,
          description: proj.description,
          technologies: proj.technologies.join(", "),
          url: proj.url,
          source: "RESUME",
        }
      }));
    }
  }

  // Certifications
  for (const idx of selections.certifications) {
    const cert = structuredData.certifications?.[idx];
    if (cert) {
      transactions.push(prisma.professionalCertification.create({
        data: {
          profileId: profile.id,
          name: cert.name,
          organization: cert.issuer,
          issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
          expirationDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
          credentialId: cert.credentialId,
          credentialUrl: cert.credentialUrl,
          source: "RESUME",
        }
      }));
    }
  }

  // Links
  for (const idx of selections.links) {
    const link = structuredData.links?.[idx];
    if (link) {
      transactions.push(prisma.professionalLink.create({
        data: {
          profileId: profile.id,
          title: link.platform,
          url: link.url,
          source: "RESUME",
        }
      }));
    }
  }

  if (transactions.length > 0) {
    await prisma.$transaction(transactions);
  }

  AnalyticsService.record({
    eventName: "resume.applied",
    userId: user.id,
    metadata: { resumeId: resume.id, selections }
  });

  return NextResponse.json({
    success: true,
    data: { applied: true }
  });
});
