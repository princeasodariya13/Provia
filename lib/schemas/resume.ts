import { z } from "zod";

export const ResumeExtractionSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().nullable().optional(),
    headline: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    website: z.string().url().nullable().optional(),
  }).nullable().optional(),
  summary: z.string().nullable().optional(),
  experience: z.array(z.object({
    company: z.string(),
    title: z.string(),
    location: z.string().nullable().optional(),
    employmentType: z.string().nullable().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    current: z.boolean().default(false),
    description: z.string().nullable().optional(),
    responsibilities: z.array(z.string()).default([]),
    achievements: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
  })).default([]),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string().nullable().optional(),
    fieldOfStudy: z.string().nullable().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    grade: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  })).default([]),
  skills: z.array(z.object({
    name: z.string(),
    category: z.string().nullable().optional(),
    proficiency: z.string().nullable().optional(),
  })).default([]),
  projects: z.array(z.object({
    name: z.string(),
    description: z.string().nullable().optional(),
    technologies: z.array(z.string()).default([]),
    url: z.string().url().nullable().optional(),
    achievements: z.array(z.string()).default([]),
  })).default([]),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    issueDate: z.string().nullable().optional(),
    expiryDate: z.string().nullable().optional(),
    credentialId: z.string().nullable().optional(),
    credentialUrl: z.string().url().nullable().optional(),
  })).default([]),
  achievements: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  links: z.array(z.object({
    platform: z.string(),
    url: z.string().url(),
  })).default([]),
});

export type ResumeExtractionData = z.infer<typeof ResumeExtractionSchema>;
