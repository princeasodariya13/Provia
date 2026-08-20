import { prisma } from "@/lib/db";
import { APIError } from "@/lib/errors";
import { PortfolioDocumentDTO, portfolioDocumentSchema } from "@/lib/schemas/portfolio";
import { ProfessionalAnalysis } from "@/lib/schemas/ai";
import { logger } from "@/lib/logger";

const activeGenerations = new Set<string>();

export const PortfolioContentService = {
  async generatePortfolio(userId: string) {
    const lockKey = `${userId}:portfolio-generation`;
    if (activeGenerations.has(lockKey)) {
      throw new APIError("A portfolio generation is already in progress. Please wait.", 429);
    }

    activeGenerations.add(lockKey);

    try {
      // 1. Fetch canonical profile (Step 15)
      const profile = await prisma.professionalProfile.findUnique({
        where: { userId },
        include: {
          experiences: { orderBy: { startDate: 'desc' } },
          education: { orderBy: { startDate: 'desc' } },
          skills: true,
          projects: true,
          certifications: true,
          links: true,
          user: true,
        }
      });

      if (!profile) {
        throw new APIError("Profile not found", 404);
      }

      // 2. Fetch latest AI analysis (Step 16)
      const latestAnalysis = await prisma.aIGeneration.findFirst({
        where: { 
          userId, 
          generationType: "PROFILE_ANALYSIS", 
          status: "COMPLETED",
          result: { not: null }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!latestAnalysis || !latestAnalysis.result) {
        throw new APIError("AI analysis required. Please complete profile analysis first.", 400);
      }

      const aiData = JSON.parse(latestAnalysis.result) as ProfessionalAnalysis;

      // 3. Deterministic Content Mapping
      // We map the raw DB fields to the DTO safely, transforming dates to ISO strings.
      
      const toISO = (d: Date | null) => d ? d.toISOString() : null;

      const primaryLinks = profile.links.map(l => ({ title: l.title, url: l.url }));

      const skillsGrouped = [
        {
          category: "Technical Skills",
          skills: aiData.technicalSkills || profile.skills.map(s => s.name)
        }
      ];

      const rawDocument: PortfolioDocumentDTO = {
        schemaVersion: "1.0.0",
        metadata: {
          generatedAt: new Date().toISOString(),
          title: `${profile.fullName || "Professional"} - Portfolio`,
        },
        hero: {
          name: profile.fullName || "",
          headline: profile.headline || "",
          shortIntroduction: aiData.professionalSummary?.substring(0, 120) + "..." || profile.bio?.substring(0, 120) || "",
          primaryLinks,
        },
        about: {
          summary: aiData.professionalSummary || profile.bio || "",
          careerThemes: aiData.careerThemes || [],
        },
        experience: profile.experiences.map(e => ({
          title: e.title,
          company: e.company,
          location: e.location,
          startDate: toISO(e.startDate),
          endDate: toISO(e.endDate),
          isCurrent: e.isCurrent,
          description: e.description,
        })),
        education: profile.education.map(e => ({
          institution: e.institution,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          location: e.location,
          startDate: toISO(e.startDate),
          endDate: toISO(e.endDate),
          description: e.description,
        })),
        skills: skillsGrouped,
        projects: profile.projects.map(p => ({
          name: p.name,
          description: p.description,
          url: p.url,
          repositoryUrl: p.repositoryUrl,
          technologies: p.technologies ? p.technologies.split(',').map(s => s.trim()) : [],
        })),
        certifications: profile.certifications.map(c => ({
          name: c.name,
          organization: c.organization,
          issueDate: toISO(c.issueDate),
          expirationDate: toISO(c.expirationDate),
          credentialUrl: c.credentialUrl,
        })),
        contact: {
          email: profile.user?.email || null,
          location: profile.location || null,
        }
      };

      // 4. Zod Validation
      const validatedDocument = portfolioDocumentSchema.parse(rawDocument);

      // 5. Versioning & Persistence
      // Get highest version
      const lastDoc = await prisma.portfolioDocument.findFirst({
        where: { userId },
        orderBy: { version: 'desc' }
      });
      
      const newVersion = lastDoc ? lastDoc.version + 1 : 1;

      const portfolioRecord = await prisma.portfolioDocument.create({
        data: {
          userId,
          version: newVersion,
          status: "DRAFT",
          content: JSON.stringify(validatedDocument),
          sourceProfileId: profile.id,
          sourceAiGenerationId: latestAnalysis.id,
        }
      });

      logger.info({ portfolioId: portfolioRecord.id, version: newVersion }, "Portfolio content generated deterministically");

      return portfolioRecord;

    } catch (error) {
      throw error;
    } finally {
      activeGenerations.delete(lockKey);
    }
  },

  async getLatestPortfolio(userId: string) {
    const doc = await prisma.portfolioDocument.findFirst({
      where: { userId },
      orderBy: { version: 'desc' }
    });
    return doc;
  }
};
