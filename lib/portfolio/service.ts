import { prisma } from "@/lib/db";
import { APIError } from "@/lib/errors";
import { PortfolioDocumentDTO, portfolioDocumentSchema } from "@/lib/schemas/portfolio";
import { logger } from "@/lib/logger";

const activeGenerations = new Set<string>();

export const PortfolioContentService = {
  async generatePortfolio(userId: string, requestedTemplateId?: string) {
    const lockKey = `${userId}:portfolio-generation`;
    if (activeGenerations.has(lockKey)) {
      throw new APIError("A portfolio generation is already in progress. Please wait.", 429);
    }

    activeGenerations.add(lockKey);

    try {
      // 1. Fetch canonical profile — the single source of truth
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
        throw new APIError("Profile not found. Please complete your profile first.", 404);
      }

      if (!profile.fullName && !profile.user?.name) {
        throw new APIError("Please add your name to your profile before generating a portfolio.", 400);
      }

      if (!profile.headline && !profile.bio) {
        throw new APIError("Please add a professional headline or bio before generating a portfolio.", 400);
      }

      // 2. Try to fetch latest AI analysis (optional — enrich if available)
      let aiSummary: string | null = null;
      let aiCareerThemes: string[] = [];

      try {
        const latestAnalysis = await prisma.aIGeneration.findFirst({
          where: {
            userId,
            generationType: "PROFILE_ANALYSIS",
            status: "COMPLETED",
            result: { not: null }
          },
          orderBy: { createdAt: 'desc' }
        });

        if (latestAnalysis?.result) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const aiData = JSON.parse(latestAnalysis.result) as any;
          aiSummary = aiData.professionalSummary || null;
          aiCareerThemes = aiData.careerThemes || [];
        }
      } catch {
        // AI analysis is optional — continue without it
        logger.info({ userId }, "No AI analysis found — generating portfolio from canonical profile data only");
      }

      // 3. Deterministic Content Mapping — profile data is the source of truth
      const toISO = (d: Date | null | undefined) => d ? d.toISOString() : null;

      const primaryLinks = profile.links.map(l => ({ title: l.title, url: l.url }));

      // Add GitHub/LinkedIn links from connections if not already present
      const connections = await prisma.connection.findMany({
        where: { userId, state: { in: ['CONNECTED', 'SYNCED'] } }
      });

      for (const conn of connections) {
        if (conn.provider === 'GITHUB' && conn.externalId) {
          const hasGithub = primaryLinks.some(l => l.url.includes('github.com'));
          if (!hasGithub) {
            primaryLinks.push({
              title: 'GitHub',
              url: `https://github.com/${conn.externalId}`
            });
          }
        }
      }

      const skillsGrouped = (() => {
        if (profile.skills.length === 0) return [];
        const grouped: Record<string, string[]> = {};
        profile.skills.forEach(s => {
          // Assign to a human-readable category based on source
          let cat = "Technical Skills";
          if (s.source === "GITHUB") cat = "Technologies & Languages";
          else if (s.source === "RESUME") cat = "Professional Skills";
          else if (s.source === "LINKEDIN") cat = "LinkedIn Skills";
          else if (s.source === "MANUAL") cat = "Additional Skills";
          if (!grouped[cat]) grouped[cat] = [];
          if (!grouped[cat].includes(s.name)) grouped[cat].push(s.name);
        });
        return Object.entries(grouped).map(([category, skills]) => ({ category, skills }));
      })();

      const displayName = profile.fullName || profile.user?.name || "";

      const deduplicateProjects = (projects: typeof profile.projects) => {
        const projectMap = new Map<string, typeof profile.projects[0]>();
        
        // Sort projects to prioritize GITHUB or manually edited over RESUME
        const sortedProjects = [...projects].sort((a, b) => {
          if (a.isManuallyEdited && !b.isManuallyEdited) return -1;
          if (!a.isManuallyEdited && b.isManuallyEdited) return 1;
          if (a.source === 'GITHUB' && b.source !== 'GITHUB') return -1;
          if (a.source !== 'GITHUB' && b.source === 'GITHUB') return 1;
          return 0;
        });

        for (const p of sortedProjects) {
          const normalizedName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          if (projectMap.has(normalizedName)) {
            const existing = projectMap.get(normalizedName)!;
            // Merge fields. existing is priority (GITHUB/MANUAL), pull missing fields from Resume
            if (!existing.description && p.description) existing.description = p.description;
            if (!existing.url && p.url) existing.url = p.url;
            if (!existing.repositoryUrl && p.repositoryUrl) existing.repositoryUrl = p.repositoryUrl;
            if (!existing.technologies && p.technologies) {
               existing.technologies = p.technologies;
            } else if (existing.technologies && p.technologies) {
               const existingTechs = existing.technologies.split(',').map(t => t.trim());
               const newTechs = p.technologies.split(',').map(t => t.trim());
               existing.technologies = Array.from(new Set([...existingTechs, ...newTechs])).filter(Boolean).join(', ');
            }
          } else {
            projectMap.set(normalizedName, { ...p });
          }
        }
        
        return Array.from(projectMap.values());
      };

      const mergedProjects = deduplicateProjects(profile.projects);

      const rawDocument: PortfolioDocumentDTO = {
        schemaVersion: "1.0.0",
        metadata: {
          generatedAt: new Date().toISOString(),
          title: `${displayName || "Professional"} — Portfolio`,
        },
        hero: {
          name: displayName,
          headline: profile.headline || profile.jobTitle || "",
          shortIntroduction: aiSummary?.substring(0, 240) || profile.bio?.substring(0, 240) || "",
          avatarUrl: profile.avatarUrl || profile.user?.image || null,
          primaryLinks,
        },
        about: {
          summary: aiSummary || profile.bio || "",
          careerThemes: aiCareerThemes,
        },
        experience: profile.experiences.map(e => ({
          title: e.title,
          company: e.company,
          location: e.location ?? null,
          startDate: toISO(e.startDate),
          endDate: toISO(e.endDate),
          isCurrent: e.isCurrent,
          description: e.description ?? null,
        })),
        education: profile.education.map(e => ({
          institution: e.institution,
          degree: e.degree ?? null,
          fieldOfStudy: e.fieldOfStudy ?? null,
          location: e.location ?? null,
          startDate: toISO(e.startDate),
          endDate: toISO(e.endDate),
          description: e.description ?? null,
        })),
        skills: skillsGrouped,
        projects: mergedProjects.map(p => ({
          name: p.name,
          description: p.description ?? null,
          url: p.url ?? null,
          repositoryUrl: p.repositoryUrl ?? null,
          technologies: p.technologies ? p.technologies.split(',').map(s => s.trim()).filter(Boolean) : [],
        })),
        certifications: profile.certifications.map(c => ({
          name: c.name,
          organization: c.organization,
          issueDate: toISO(c.issueDate),
          expirationDate: toISO(c.expirationDate),
          credentialUrl: c.credentialUrl ?? null,
        })),
        contact: {
          email: profile.user?.email || null,
          location: profile.location || null,
        },
        configuration: {
          sectionOrder: ["hero", "about", "experience", "projects", "skills", "education", "certifications", "contact"],
          hiddenSections: [],
          theme: "light",
          colors: {},
          typography: "inter",
        },
        seo: {
          title: `${displayName || "Professional"} — Portfolio`,
          description: (aiSummary || profile.bio || "").substring(0, 160),
        }
      };

      // 4. Zod Validation
      const validatedDocument = portfolioDocumentSchema.parse(rawDocument);

      // 5. Versioning & Persistence
      const lastDoc = await prisma.portfolioDocument.findFirst({
        where: { userId },
        orderBy: { version: 'desc' }
      });

      const newVersion = lastDoc ? lastDoc.version + 1 : 1;

      // Resolve templateId: use requested > existing > default
      const templateId = requestedTemplateId || lastDoc?.templateId || "editorial-v1";

      const portfolioRecord = await prisma.portfolioDocument.create({
        data: {
          userId,
          version: newVersion,
          status: "DRAFT",
          content: JSON.stringify(validatedDocument),
          templateId,
          sourceProfileId: profile.id,
        }
      });

      logger.info({ portfolioId: portfolioRecord.id, version: newVersion }, "Portfolio content generated from canonical profile data");

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
