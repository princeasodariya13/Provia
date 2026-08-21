import { registerJobHandler } from "./registry";
import { ProfileAnalysisHandler } from "./handlers/profile-analysis";
import { PortfolioGenerationHandler } from "./handlers/portfolio-generation";
import { EmailDeliveryHandler } from "./handlers/email-delivery";
import { ProviderSyncHandler } from "./handlers/provider-sync";
import { ResumeExtractionHandler } from "./handlers/resume-extraction";

// Register all known handlers
registerJobHandler(ProfileAnalysisHandler);
registerJobHandler(PortfolioGenerationHandler);
registerJobHandler(EmailDeliveryHandler);
registerJobHandler(ProviderSyncHandler);
registerJobHandler(ResumeExtractionHandler);

// Export public APIs
export { JobService } from "./service";
export { JobProcessor } from "./processor";
export * from "./types";
