import { PortfolioContentService } from "@/lib/portfolio/service";
import { PortfolioGenerationPayloadSchema } from "../schemas";
import { JobEntity } from "../types";

export const PortfolioGenerationHandler = {
  type: "PORTFOLIO_GENERATION" as const,
  schema: PortfolioGenerationPayloadSchema,
  handler: async (job: JobEntity<{ userId: string }>) => {
    // User isolation: Deriving from job.userId, not payload (though validated payload matches)
    const record = await PortfolioContentService.generatePortfolio(job.userId);
    
    return {
      documentId: record.id,
      version: record.version,
      status: record.status,
    };
  }
};
