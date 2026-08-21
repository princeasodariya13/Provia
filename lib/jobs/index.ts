import { registerJobHandler } from "./registry";
import { ProfileAnalysisHandler } from "./handlers/profile-analysis";

// Register all known handlers
registerJobHandler(ProfileAnalysisHandler);

// Export public APIs
export { JobService } from "./service";
export { JobProcessor } from "./processor";
export * from "./types";
