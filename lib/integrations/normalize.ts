import { Provider } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// GitHub Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NormalizedGitHubRepo {
  name: string;
  description: string | null;
  htmlUrl: string;
  homepageUrl: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  forks: number;
  createdAt: string | null;
  updatedAt: string | null;
  fork: boolean;
}

export interface NormalizedGitHubPinnedRepo {
  name: string;
  description: string | null;
  url: string;
  primaryLanguage: string | null;
  stargazerCount: number;
}

export interface NormalizedGitHubData {
  // Identity
  fullName: string | null;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  website: string | null;
  currentCompany: string | null;
  githubUsername: string | null;
  email: string | null;
  twitterUsername: string | null;
  githubProfileUrl: string | null;
  // Stats
  publicRepos: number;
  followers: number;
  following: number;
  // Enrichment
  repositories: NormalizedGitHubRepo[];
  pinnedRepositories: NormalizedGitHubPinnedRepo[];
  topLanguages: string[];
  organizations: string[];
  derivedSkills: string[];
}

export function normalizeGitHubData(rawData: Record<string, unknown>): NormalizedGitHubData {
  const repos = (rawData.repositories as Record<string, unknown>[] | undefined) || [];
  const pinned = (rawData.pinned_repositories as Record<string, unknown>[] | undefined) || [];
  const orgs = (rawData.organizations as Record<string, unknown>[] | undefined) || [];
  const topLangs = (rawData.top_languages as string[] | undefined) || [];
  const derivedSkills = (rawData.derived_skills as string[] | undefined) || [];

  const normalizedRepos: NormalizedGitHubRepo[] = repos.map(r => ({
    name: (r.name as string) || "",
    description: (r.description as string | null) || null,
    htmlUrl: (r.html_url as string) || "",
    homepageUrl: (r.homepage as string | null) || null,
    language: (r.language as string | null) || null,
    topics: (r.topics as string[]) || [],
    stars: (r.stargazers_count as number) || 0,
    forks: (r.forks_count as number) || 0,
    createdAt: (r.created_at as string | null) || null,
    updatedAt: (r.updated_at as string | null) || null,
    fork: (r.fork as boolean) || false,
  }));

  const normalizedPinned: NormalizedGitHubPinnedRepo[] = pinned.map(p => ({
    name: (p.name as string) || "",
    description: (p.description as string | null) || null,
    url: (p.url as string) || "",
    primaryLanguage: (p.primaryLanguage as string | null) || null,
    stargazerCount: (p.stargazerCount as number) || 0,
  }));

  const normalizedOrgs = orgs.map(o => (o.login as string) || "").filter(Boolean);

  return {
    fullName: (rawData.name as string) || null,
    bio: (rawData.bio as string) || null,
    location: (rawData.location as string) || null,
    avatarUrl: (rawData.avatar_url as string) || null,
    website: (rawData.blog as string) || null,
    currentCompany: (rawData.company as string) || null,
    githubUsername: (rawData.login as string) || null,
    email: (rawData.primary_email as string) || (rawData.email as string) || null,
    twitterUsername: (rawData.twitter_username as string) || null,
    githubProfileUrl: (rawData.html_url as string) || null,
    publicRepos: (rawData.public_repos as number) || 0,
    followers: (rawData.followers as number) || 0,
    following: (rawData.following as number) || 0,
    repositories: normalizedRepos,
    pinnedRepositories: normalizedPinned,
    topLanguages: topLangs,
    organizations: normalizedOrgs,
    derivedSkills,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LinkedIn Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NormalizedLinkedInData {
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  email: string | null;
  headline: string | null;         // only with r_liteprofile scope
  linkedinProfileUrl: string | null; // only with r_liteprofile scope (vanityName)
  locale: string | null;
}

export function normalizeLinkedInData(rawData: Record<string, unknown>): NormalizedLinkedInData {
  return {
    fullName: (rawData.name as string) || null,
    firstName: (rawData.given_name as string) || null,
    lastName: (rawData.family_name as string) || null,
    avatarUrl: (rawData.picture as string) || null,
    email: (rawData.email as string) || null,
    headline: (rawData.headline as string) || null,
    linkedinProfileUrl: (rawData.linkedin_profile_url as string) || null,
    locale: (rawData.locale as string) || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dispatcher
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeProfileData(provider: Provider, rawData: Record<string, unknown>) {
  switch (provider) {
    case "GITHUB":
      return normalizeGitHubData(rawData);
    case "LINKEDIN":
      return normalizeLinkedInData(rawData);
    default:
      return {} as Record<string, unknown>;
  }
}
