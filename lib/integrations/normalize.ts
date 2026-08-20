import { Provider } from "@prisma/client";

export function normalizeGitHubData(rawData: Record<string, unknown>) {
  return {
    fullName: (rawData.name as string) || null,
    bio: (rawData.bio as string) || null,
    location: (rawData.location as string) || null,
    avatarUrl: (rawData.avatar_url as string) || null,
    website: (rawData.blog as string) || null,
    currentCompany: (rawData.company as string) || null,
    githubUsername: (rawData.login as string) || null,
  };
}

export function normalizeLinkedInData(rawData: Record<string, unknown>) {
  return {
    fullName: (rawData.name as string) || null,
    avatarUrl: (rawData.picture as string) || null,
    // Other fields depend on expanded scopes, this is the minimal foundation
  };
}

export function normalizeProfileData(provider: Provider, rawData: Record<string, unknown>) {
  switch (provider) {
    case "GITHUB":
      return normalizeGitHubData(rawData);
    case "LINKEDIN":
      return normalizeLinkedInData(rawData);
    default:
      return {};
  }
}
