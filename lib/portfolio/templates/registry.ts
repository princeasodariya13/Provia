import { TemplateDefinition } from "./types";
import { editorialV1 } from "./editorial-v1";

const templates: Record<string, TemplateDefinition> = {
  [editorialV1.metadata.id]: editorialV1,
};

export const TemplateRegistry = {
  getTemplate(id: string): TemplateDefinition | undefined {
    return templates[id];
  },

  getAllMetadata() {
    return Object.values(templates).map(t => t.metadata);
  },

  getDefaultTemplateId() {
    return editorialV1.metadata.id;
  }
};
