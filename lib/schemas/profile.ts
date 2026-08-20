import { z } from "zod";

const emptyStringToNull = (val: string | null | undefined) => val === '' ? null : val;

export const experienceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().nullable().optional(),
  startDate: z.string().datetime().nullable().optional().transform(val => val ? new Date(val) : val),
  endDate: z.string().datetime().nullable().optional().transform(val => val ? new Date(val) : val),
  isCurrent: z.boolean().default(false),
  description: z.string().nullable().optional(),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().nullable().optional(),
  fieldOfStudy: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startDate: z.string().datetime().nullable().optional().transform(val => val ? new Date(val) : val),
  endDate: z.string().datetime().nullable().optional().transform(val => val ? new Date(val) : val),
  description: z.string().nullable().optional(),
});

export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Skill name is required"),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().nullable().optional(),
  url: z.string().url().nullable().optional().or(z.literal('')),
  repositoryUrl: z.string().url().nullable().optional().or(z.literal('')),
  technologies: z.string().nullable().optional(),
  startDate: z.string().datetime().nullable().optional().transform(val => val ? new Date(val) : val),
  endDate: z.string().datetime().nullable().optional().transform(val => val ? new Date(val) : val),
});

export const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Certification name is required"),
  organization: z.string().min(1, "Organization is required"),
  issueDate: z.string().datetime().nullable().optional().transform(val => val ? new Date(val) : val),
  expirationDate: z.string().datetime().nullable().optional().transform(val => val ? new Date(val) : val),
  credentialId: z.string().nullable().optional(),
  credentialUrl: z.string().url().nullable().optional().or(z.literal('')),
});

export const linkSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL").min(1),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().nullable().optional(),
  headline: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  website: z.string().url().nullable().optional().or(z.literal('')),
  
  experiences: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  projects: z.array(projectSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  links: z.array(linkSchema).optional(),
});
