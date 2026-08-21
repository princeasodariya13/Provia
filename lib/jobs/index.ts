import { registerJobHandler } from "./registry";
import { ProfileAnalysisHandler } from "./handlers/profile-analysis";
import { PortfolioGenerationHandler } from "./handlers/portfolio-generation";
import { EmailDeliveryHandler } from "./handlers/email-delivery";

// Register all known handlers
registerJobHandler(ProfileAnalysisHandler);
registerJobHandler(PortfolioGenerationHandler);
registerJobHandler(EmailDeliveryHandler);

// Export public APIs
export { JobService } from "./service";
export { JobProcessor } from "./processor";
export * from "./types";
