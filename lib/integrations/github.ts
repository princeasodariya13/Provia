import { Provider } from "@prisma/client";
import { SourceConnector, IntegrationData } from "./connector";
import { APIError } from "../errors";
import { logger } from "../logger";

export class GitHubConnector implements SourceConnector {
  getProviderId(): Provider {
    return "GITHUB";
  }

  isConfigured(): boolean {
    return !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  }

  getAuthUrl(redirectUri: string, state: string): string {
    if (!this.isConfigured()) throw new APIError("GitHub provider not configured", 501);
    
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      redirect_uri: redirectUri,
      scope: "read:user",
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
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      throw new APIError("Failed to exchange GitHub token", res.status);
    }

    const data = await res.json();
    if (data.error) {
      logger.error({ error: data.error }, "GitHub token exchange error");
      throw new APIError(data.error_description || "GitHub authentication failed", 401);
    }

    return {
      accessToken: data.access_token,
      scopes: data.scope,
    };
  }

  async fetchProfile(accessToken: string): Promise<IntegrationData> {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Provia-App",
      },
    });

    if (res.status === 401 || res.status === 403) {
      throw new APIError("Unauthorized by GitHub", 401);
    }

    if (!res.ok) {
      throw new APIError("Failed to fetch GitHub profile", res.status);
    }

    const data = await res.json();
    
    return {
      externalId: data.id.toString(),
      rawData: data,
    };
  }
}

export const githubConnector = new GitHubConnector();
