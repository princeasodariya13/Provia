import { TemplateDefinition } from "./types";
import { editorialV1 } from "./editorial-v1";
import { engineerTemplate, engineerMetadata } from "./engineer";
import { aideveloperTemplate, aideveloperMetadata } from "./ai-developer";
import { motionengineerTemplate, motionengineerMetadata } from "./motion-engineer";
import { modernTemplate, modernMetadata } from "./modern";
import { madhukarTemplate, madhukarMetadata } from "./madhukar";
import { immersive3dTemplate, immersive3dMetadata } from "./immersive-3d";
import { modernfullstackTemplate, modernfullstackMetadata } from "./modern-fullstack";

const templates: Record<string, TemplateDefinition> = {
  [editorialV1.metadata.id]: editorialV1,
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
