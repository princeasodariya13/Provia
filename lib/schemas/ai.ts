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

export const resumeExtractionSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().nullable().describe("The full name of the person."),
    headline: z.string().nullable().describe("A brief professional headline if present."),
    summary: z.string().nullable().describe("A professional summary or objective."),
    location: z.string().nullable().describe("City, state, or country."),
    email: z.string().nullable().describe("Email address."),
    website: z.string().nullable().describe("Personal website or portfolio URL."),
  }),
  experience: z.array(z.object({
    company: z.string().describe("Name of the company."),
    title: z.string().describe("Job title."),
    location: z.string().nullable().describe("Location of the job."),
    startDate: z.string().nullable().describe("Start date (e.g. YYYY-MM or YYYY)."),
    endDate: z.string().nullable().describe("End date (e.g. YYYY-MM, YYYY, or 'Present')."),
    isCurrent: z.boolean().describe("True if this is the current job."),
    description: z.string().nullable().describe("Full description of responsibilities and achievements."),
  })).describe("List of work experiences in chronological or reverse-chronological order."),
  education: z.array(z.object({
    institution: z.string().describe("Name of the school or university."),
    degree: z.string().nullable().describe("Degree obtained (e.g. BS, BA, MS, PhD)."),
    fieldOfStudy: z.string().nullable().describe("Major or field of study."),
    startDate: z.string().nullable().describe("Start date."),
    endDate: z.string().nullable().describe("End date or graduation year."),
    description: z.string().nullable().describe("Additional details, GPA, honors."),
  })).describe("List of educational qualifications."),
  skills: z.array(z.object({
    name: z.string().describe("Name of the skill (e.g. React, Python, Project Management)."),
  })).describe("List of technical and professional skills."),
  projects: z.array(z.object({
    name: z.string().describe("Name of the project."),
    description: z.string().nullable().describe("Description of the project."),
    url: z.string().nullable().describe("Link to the project if available."),
    technologies: z.string().nullable().describe("Technologies used, separated by commas."),
  })).describe("List of notable projects."),
  certifications: z.array(z.object({
    name: z.string().describe("Name of the certification."),
    organization: z.string().describe("Issuing organization."),
    issueDate: z.string().nullable().describe("Date issued."),
    credentialUrl: z.string().nullable().describe("URL to the credential."),
  })).describe("List of certifications."),
  links: z.array(z.object({
    platform: z.string().describe("Platform name (e.g. LinkedIn, GitHub)."),
    url: z.string().describe("URL to the profile."),
  })).describe("List of external links."),
});

export type ResumeExtraction = z.infer<typeof resumeExtractionSchema>;
