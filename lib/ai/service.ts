import { prisma } from "@/lib/db";
import { APIError } from "@/lib/errors";
import { geminiProvider } from "./providers/gemini";
import { professionalAnalysisSchema } from "@/lib/schemas/ai";
import { PROFILE_ANALYSIS_PROMPT_V1 } from "./prompts/profile-analysis-v1";
import { logger } from "@/lib/logger";
import { AnalyticsService } from "@/lib/analytics/service";

const activeGenerations = new Set<string>();

export const AIService = {
  getProvider() {
    return geminiProvider;
  },

  async analyzeProfile(userId: string) {
    const provider = this.getProvider();
    
    if (!provider.isConfigured()) {
      throw new APIError("AI Provider is not configured", 501);
    }

    const lockKey = `${userId}:profile-analysis`;
    if (activeGenerations.has(lockKey)) {
      throw new APIError("A generation is already in progress. Please wait.", 429);
    }

    activeGenerations.add(lockKey);
    let generationRecord;

    try {
      // 1. Fetch effective profile
      const profile = await prisma.professionalProfile.findUnique({
        where: { userId },
        include: {
          experiences: true,
          education: true,
          skills: true,
          projects: true,
        }
      });

      if (!profile) {
        throw new APIError("Profile not found", 404);
      }

      // Basic readiness check
      if (!profile.fullName && (!profile.experiences || profile.experiences.length === 0)) {
        throw new APIError("Profile must have at least a name or experience to analyze", 400);
      }

      // 2. Input Sanitization
      const safeData = {
        name: profile.fullName,
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        experiences: profile.experiences.map(e => ({
          title: e.title,
          company: e.company,
          description: e.description?.substring(0, 500)
        })),
        education: profile.education.map(e => ({
          institution: e.institution,
          degree: e.degree,
        })),
        skills: profile.skills.map(s => s.name).slice(0, 50),
        projects: profile.projects.map(p => ({
          name: p.name,
          description: p.description?.substring(0, 300)
        })),
      };

      // 3. Prompt Building
      const prompt = PROFILE_ANALYSIS_PROMPT_V1.replace(
        "{{PROFILE_DATA}}", 
        JSON.stringify(safeData, null, 2)
      );

      // 4. Create DB Lifecycle Record
      generationRecord = await prisma.aIGeneration.create({
        data: {
          userId,
          generationType: "PROFILE_ANALYSIS",
          provider: provider.name,
          model: "unknown",
          promptVersion: "profile-analysis-v1",
          status: "PROCESSING"
        }
      });

      AnalyticsService.record({
        eventName: "ai.analysis_started",
        userId,
        metadata: { provider: provider.name, promptVersion: "profile-analysis-v1" }
      });

      // 5. Invoke Provider with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new APIError("AI Provider timeout", 504)), 30000)
      );

      const response = await Promise.race([
        provider.generateStructured(prompt, professionalAnalysisSchema),
        timeoutPromise
      ]) as Awaited<ReturnType<typeof provider.generateStructured>>;

      // 6. Complete Lifecycle
      const completedRecord = await prisma.aIGeneration.update({
        where: { id: generationRecord.id },
        data: {
          status: "COMPLETED",
          model: response.model,
          result: JSON.stringify(response.result),
          usage: JSON.stringify(response.usage),
          completedAt: new Date(),
        }
      });

      logger.info({ generationId: completedRecord.id, usage: response.usage }, "AI profile analysis completed successfully");

      AnalyticsService.record({
        eventName: "ai.analysis_completed",
        userId,
        metadata: { provider: provider.name, model: response.model, usage: response.usage }
      });

      return completedRecord;

    } catch (error) {
      if (generationRecord) {
        await prisma.aIGeneration.update({
          where: { id: generationRecord.id },
          data: {
            status: "FAILED",
            failureReason: error instanceof Error ? error.message : "Unknown",
            completedAt: new Date()
          }
        });

        AnalyticsService.record({
          eventName: "ai.analysis_failed",
          userId,
          metadata: { reason: error instanceof Error ? error.message : "Unknown" }
        });
      }
      throw error;
    } finally {
      activeGenerations.delete(lockKey);
    }
  }
};
