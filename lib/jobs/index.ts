import { registerJobHandler } from "./registry";
import { ProfileAnalysisHandler } from "./handlers/profile-analysis";
import { PortfolioGenerationHandler } from "./handlers/portfolio-generation";

// Register all known handlers
registerJobHandler(ProfileAnalysisHandler);
registerJobHandler(PortfolioGenerationHandler);

// Export public APIs
export { JobService } from "./service";
export { JobProcessor } from "./processor";
export * from "./types";
