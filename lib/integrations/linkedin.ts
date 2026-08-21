import { Provider } from "@prisma/client";
import { SourceConnector, IntegrationData } from "./connector";
import { APIError } from "../errors";
import { env } from "../env";

export class LinkedInConnector implements SourceConnector {
  getProviderId(): Provider {
    return "LINKEDIN";
  }

  isConfigured(): boolean {
    return !!(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET);
  }

  getAuthUrl(redirectUri: string, state: string): string {
    if (!this.isConfigured()) throw new APIError("LinkedIn provider not configured", 501);
    
    const params = new URLSearchParams({
      response_type: "code",
      client_id: env.LINKEDIN_CLIENT_ID!,
      redirect_uri: redirectUri,
      state,
      scope: "openid profile email",
    });
    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  async exchangeToken(code: string, redirectUri: string) {
    if (!this.isConfigured()) throw new APIError("LinkedIn provider not configured", 501);
    
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: env.LINKEDIN_CLIENT_ID!,
      client_secret: env.LINKEDIN_CLIENT_SECRET!,
    });

    const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      throw new APIError("Failed to exchange LinkedIn token", res.status);
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  async fetchProfile(accessToken: string): Promise<IntegrationData> {
    const res = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      throw new APIError("Unauthorized by LinkedIn", 401);
    }

    if (!res.ok) {
      throw new APIError("Failed to fetch LinkedIn profile", res.status);
    }

    const data = await res.json();
    
    return {
      externalId: data.sub,
      rawData: data,
    };
  }
}

export const linkedinConnector = new LinkedInConnector();
