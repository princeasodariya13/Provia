import { Provider } from "@prisma/client";
import { SourceConnector, IntegrationData } from "./connector";
import { APIError } from "../errors";
import { logger } from "../logger";
import { env } from "../env";

export class GitHubConnector implements SourceConnector {
  getProviderId(): Provider {
    return "GITHUB";
  }

  isConfigured(): boolean {
    return !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
  }

  getAuthUrl(redirectUri: string, state: string): string {
    if (!this.isConfigured()) throw new APIError("GitHub provider not configured", 501);

    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID!,
      redirect_uri: redirectUri,
      // read:user = full user profile (bio, company, blog, location, email if public)
      // user:email = verified primary email address
      scope: "read:user user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async exchangeToken(code: string, redirectUri: string) {
    if (!this.isConfigured()) throw new APIError("GitHub provider not configured", 501);

    const res = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) throw new APIError("Failed to exchange GitHub token", res.status);

    const data = await res.json();
    if (data.error) {
      logger.error({ error: data.error }, "GitHub token exchange error");
      throw new APIError(data.error_description || "GitHub authentication failed", 401);
    }

    return { accessToken: data.access_token, scopes: data.scope };
  }

  async fetchProfile(accessToken: string): Promise<IntegrationData> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Provia-App",
    };

    // ── 1. Core user identity ──────────────────────────────────────────────
    const userRes = await fetch("https://api.github.com/user", { headers });
    if (userRes.status === 401 || userRes.status === 403) {
      throw new APIError("Unauthorized by GitHub", 401);
    }
    if (!userRes.ok) throw new APIError("Failed to fetch GitHub profile", userRes.status);
    const userData = await userRes.json();

    // ── 2. Primary/verified email (user:email scope) ───────────────────────
    let primaryEmail: string | null = null;
    try {
      const emailRes = await fetch("https://api.github.com/user/emails", { headers });
      if (emailRes.ok) {
        const emails: { email: string; primary: boolean; verified: boolean }[] = await emailRes.json();
        const found = emails.find(e => e.primary && e.verified);
        primaryEmail = found?.email || null;
      }
    } catch (err) {
      logger.warn({ err }, "GitHub: failed to fetch emails");
    }

    // ── 3. All own repositories (up to 100, sorted by stars then update) ──
    let repos: Record<string, unknown>[] = [];
    try {
      const repoRes = await fetch(
        "https://api.github.com/user/repos?per_page=100&sort=updated&type=owner",
        { headers }
      );
      if (repoRes.ok) {
        const raw: Record<string, unknown>[] = await repoRes.json();
        repos = raw
          .map(r => ({
            id: r.id,
            name: r.name,
            full_name: r.full_name,
            description: r.description || null,
            html_url: r.html_url,
            homepage: (r.homepage as string)?.trim() || null,
            language: r.language || null,
            topics: r.topics || [],
            stargazers_count: r.stargazers_count || 0,
            forks_count: r.forks_count || 0,
            open_issues_count: r.open_issues_count || 0,
            created_at: r.created_at,
            updated_at: r.updated_at,
            pushed_at: r.pushed_at,
            visibility: r.visibility,
            fork: r.fork,
            archived: r.archived,
            disabled: r.disabled,
            default_branch: r.default_branch,
            size: r.size,
          }))
          // Show non-forks first; include forks only if they have topics/description
          .filter(r => !r.archived && !r.disabled)
          .sort((a, b) =>
            (!a.fork ? 0 : 1) - (!b.fork ? 0 : 1) ||
            ((b.stargazers_count as number) - (a.stargazers_count as number))
          )
          .slice(0, 40);
      }
    } catch (err) {
      logger.warn({ err }, "GitHub: failed to fetch repositories");
    }

    // ── 4. Language stats across all repos ───────────────────────────────
    const languageCount: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language && typeof repo.language === "string") {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    }
    // Sort by repo count descending
    const topLanguages = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    // ── 5. Public organizations ────────────────────────────────────────────
    let organizations: { login: string; avatar_url: string; description: string | null }[] = [];
    try {
      const orgRes = await fetch("https://api.github.com/user/orgs?per_page=10", { headers });
      if (orgRes.ok) {
        const rawOrgs: Record<string, unknown>[] = await orgRes.ok ? await orgRes.json() : [];
        organizations = rawOrgs.map(o => ({
          login: o.login as string,
          avatar_url: o.avatar_url as string,
          description: (o.description as string) || null,
        }));
      }
    } catch (err) {
      logger.warn({ err }, "GitHub: failed to fetch organizations");
    }

    // ── 6. Pinned repos via GraphQL (optional enrichment) ─────────────────
    let pinnedRepos: { name: string; description: string | null; url: string; primaryLanguage: string | null; stargazerCount: number }[] = [];
    try {
      const graphqlQuery = {
        query: `{
          user(login: "${userData.login}") {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name
                  description
                  url
                  primaryLanguage { name }
                  stargazerCount
                }
              }
            }
          }
        }`,
      };
      const gqlRes = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(graphqlQuery),
      });
      if (gqlRes.ok) {
        const gqlData = await gqlRes.json();
        const nodes = gqlData?.data?.user?.pinnedItems?.nodes || [];
        pinnedRepos = nodes.map((n: Record<string, unknown>) => ({
          name: n.name as string,
          description: (n.description as string) || null,
          url: n.url as string,
          primaryLanguage: (n.primaryLanguage as Record<string, string>)?.name || null,
          stargazerCount: (n.stargazerCount as number) || 0,
        }));
      }
    } catch (err) {
      logger.warn({ err }, "GitHub: failed to fetch pinned repos via GraphQL");
    }

    // ── 7. Aggregate derived skills from repos + topics ───────────────────
    const skillsSet = new Set<string>([...topLanguages]);
    for (const repo of repos) {
      for (const topic of (repo.topics as string[]) || []) {
        if (
          topic.length <= 30 &&
          !/awesome|tutorial|learning|course|demo|test|example|beginner/i.test(topic)
        ) {
          skillsSet.add(topic);
        }
      }
    }

    return {
      externalId: userData.id.toString(),
      rawData: {
        // Identity
        login: userData.login,
        name: userData.name,
        bio: userData.bio,
        email: primaryEmail || userData.email || null,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        blog: userData.blog,
        company: userData.company,
        location: userData.location,
        twitter_username: userData.twitter_username,
        // Stats
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        created_at: userData.created_at,
        // Enrichment
        repositories: repos,
        pinned_repositories: pinnedRepos,
        top_languages: topLanguages,
        organizations,
        derived_skills: Array.from(skillsSet),
        primary_email: primaryEmail,
      },
    };
  }
}

export const githubConnector = new GitHubConnector();
