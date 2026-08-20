import { z } from "zod";

export const professionalAnalysisSchema = z.object({
  professionalSummary: z.string().describe("A cohesive summary of the professional's identity and career trajectory."),
  strengths: z.array(z.string()).describe("Top 3-5 core professional strengths."),
  technicalSkills: z.array(z.string()).describe("Categorized or grouped technical skills based on their profile."),
  experienceHighlights: z.array(z.string()).describe("Most impressive achievements or roles."),
  projectHighlights: z.array(z.string()).describe("Key projects and their impact."),
  careerThemes: z.array(z.string()).describe("Overarching themes of their career (e.g. 'Frontend Optimization', 'Startup Leadership')."),
});

export type ProfessionalAnalysis = z.infer<typeof professionalAnalysisSchema>;
