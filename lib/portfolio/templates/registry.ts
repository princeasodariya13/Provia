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

export const TemplateRegistry = {
  getTemplate(id: string): TemplateDefinition | undefined {
    // Backward compatibility for templates stored during initial development
    const aliases: Record<string, string> = {
      "engineer": "classic-professional",
      "ai-developer": "ai-technology",
      "motion-engineer": "motion-creative",
      "modern": "modern-minimal",
      "madhukar": "creative-editorial"
    };
    
    return templates[id] || templates[aliases[id]];
  },

  getAllMetadata() {
    return Object.values(templates).map(t => t.metadata);
  },

  getDefaultTemplateId() {
    return editorialV1.metadata.id;
  }
};
