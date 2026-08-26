import { TemplateDefinition } from "./types";
import { editorialV1 } from "./editorial-v1";
import { premiumV1 } from "./premium-v1";
import { engineerTemplate } from "./engineer";
import { engineerMetadata } from "./engineer/metadata";
import { aideveloperTemplate } from "./ai-developer";
import { aideveloperMetadata } from "./ai-developer/metadata";
import { motionengineerTemplate } from "./motion-engineer";
import { motionengineerMetadata } from "./motion-engineer/metadata";
import { modernTemplate } from "./modern";
import { modernMetadata } from "./modern/metadata";
import { madhukarTemplate } from "./madhukar";
import { madhukarMetadata } from "./madhukar/metadata";
import { immersive3dTemplate } from "./immersive-3d";
import { immersive3dMetadata } from "./immersive-3d/metadata";
import { modernfullstackTemplate } from "./modern-fullstack";
import { modernfullstackMetadata } from "./modern-fullstack/metadata";

const templates: Record<string, TemplateDefinition> = {
  [editorialV1.metadata.id]: editorialV1,
  [premiumV1.metadata.id]: premiumV1,
  [engineerMetadata.id]: { metadata: engineerMetadata, component: engineerTemplate },
  [aideveloperMetadata.id]: { metadata: aideveloperMetadata, component: aideveloperTemplate },
  [motionengineerMetadata.id]: { metadata: motionengineerMetadata, component: motionengineerTemplate },
  [modernMetadata.id]: { metadata: modernMetadata, component: modernTemplate },
  [madhukarMetadata.id]: { metadata: madhukarMetadata, component: madhukarTemplate },
  [immersive3dMetadata.id]: { metadata: immersive3dMetadata, component: immersive3dTemplate },
  [modernfullstackMetadata.id]: { metadata: modernfullstackMetadata, component: modernfullstackTemplate },
};

// Legacy ID aliases for backward compatibility with stored templateIds
const ALIASES: Record<string, string> = {
  "premium-v1": "premium-v1", // Self-alias (stable)
  // Old developer-named IDs → stable canonical IDs
  "engineer": "classic-professional",
  "ai-developer": "ai-technology",
  "motion-engineer": "motion-creative",
  "modern": "modern-minimal",
  "madhukar": "creative-editorial",
  "immersive-3d": "immersive-3d", // Self-alias (stable)
  "modern-fullstack": "modern-fullstack", // Self-alias (stable)
  "editorial-v1": "editorial-v1", // Self-alias (stable)
};

export const TemplateRegistry = {
  getTemplate(id: string): TemplateDefinition | undefined {
    return templates[id] || templates[ALIASES[id]];
  },

  getAllMetadata() {
    return Object.values(templates).map(t => t.metadata);
  },

  getDefaultTemplateId() {
    return "editorial-v1";
  },

  isValidTemplateId(id: string): boolean {
    return !!(templates[id] || templates[ALIASES[id]]);
  }
};
