import { z } from "zod";

export const portfolioLinkSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});

export const portfolioExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(), // ISO strings
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean(),
  description: z.string().nullable().optional(),
});

export const portfolioEducationSchema = z.object({
  institution: z.string(),
  degree: z.string().nullable().optional(),
  fieldOfStudy: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const portfolioProjectSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  repositoryUrl: z.string().nullable().optional(),
  technologies: z.array(z.string()),
});

export const portfolioCertificationSchema = z.object({
  name: z.string(),
  organization: z.string(),
  issueDate: z.string().nullable().optional(),
  expirationDate: z.string().nullable().optional(),
  credentialUrl: z.string().nullable().optional(),
});

export const portfolioSkillGroupSchema = z.object({
  category: z.string(),
  skills: z.array(z.string()),
});

export const portfolioDocumentSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  metadata: z.object({
    generatedAt: z.string(), // ISO String
    title: z.string(),
  }),
  hero: z.object({
    name: z.string(),
    headline: z.string(),
    shortIntroduction: z.string(),
    primaryLinks: z.array(portfolioLinkSchema),
  }),
  about: z.object({
    summary: z.string(),
    careerThemes: z.array(z.string()),
  }),
  experience: z.array(portfolioExperienceSchema),
  education: z.array(portfolioEducationSchema),
  skills: z.array(portfolioSkillGroupSchema),
  projects: z.array(portfolioProjectSchema),
  certifications: z.array(portfolioCertificationSchema),
  contact: z.object({
    email: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
  }),
});

export type PortfolioDocumentDTO = z.infer<typeof portfolioDocumentSchema>;
