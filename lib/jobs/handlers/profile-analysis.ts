import { AIService } from "@/lib/ai/service";
import { ProfileAnalysisPayloadSchema } from "../schemas";
import { JobEntity } from "../types";

export const ProfileAnalysisHandler = {
  type: "PROFILE_ANALYSIS" as const,
  schema: ProfileAnalysisPayloadSchema,
  handler: async (job: JobEntity<{ userId: string }>) => {
    // Rely on existing AIService
    // It will throw if the provider times out or fails, triggering the job retry mechanism.
    const record = await AIService.analyzeProfile(job.payload.userId);
    
    return {
      generationId: record.id,
      status: record.status,
    };
  }
};
