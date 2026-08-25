import { Provider } from "@prisma/client";
import { SourceConnector, IntegrationData } from "./connector";
import { APIError } from "../errors";
import { env } from "../env";
import { logger } from "../logger";

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
      // openid profile email → OIDC standard scopes (available to all apps)
      // These give us: sub, name, given_name, family_name, picture, email,
      //                locale, email_verified, and linkedin profile URL
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
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!res.ok) throw new APIError("Failed to exchange LinkedIn token", res.status);

    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || undefined,
    };
  }

  async fetchProfile(accessToken: string): Promise<IntegrationData> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // ── 1. OIDC UserInfo — available to ALL LinkedIn OAuth apps ─────────────
    // Returns: sub, name, given_name, family_name, picture, email,
    //          locale, email_verified, linkedin.com profile URL (in `sub`)
    const userinfoRes = await fetch("https://api.linkedin.com/v2/userinfo", { headers });
    if (userinfoRes.status === 401 || userinfoRes.status === 403) {
      throw new APIError("Unauthorized by LinkedIn", 401);
    }
    if (!userinfoRes.ok) {
      throw new APIError("Failed to fetch LinkedIn profile", userinfoRes.status);
    }
    const userinfo = await userinfoRes.json();

    // ── 2. LinkedIn Basic Profile (v2/me) — may be available depending on app ─
    // Fields: id, localizedFirstName, localizedLastName, localizedHeadline,
    //         vanityName (custom profile URL slug), profilePicture
    // Note: This endpoint requires r_liteprofile scope for full access.
    // We attempt it gracefully and fall back if not authorized.
    let liProfile: Record<string, unknown> = {};
    try {
      const meRes = await fetch(
        "https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,localizedHeadline,vanityName,profilePicture(displayImage~:playableStreams))",
        { headers }
      );
      if (meRes.ok) {
        liProfile = await meRes.json();
        logger.info("LinkedIn: /v2/me profile fetched successfully");
      } else {
        logger.info(
          { status: meRes.status },
          "LinkedIn: /v2/me not available with current scopes — using OIDC data only"
        );
      }
    } catch (err) {
      logger.warn({ err }, "LinkedIn: /v2/me request failed");
    }

    // ── 3. Compose the richest possible profile from both sources ──────────
    const givenName = (userinfo.given_name as string) || "";
    const familyName = (userinfo.family_name as string) || "";
    const fullName =
      (userinfo.name as string) ||
      `${givenName} ${familyName}`.trim() ||
      ((liProfile.localizedFirstName as string)
        ? `${liProfile.localizedFirstName} ${liProfile.localizedLastName || ""}`.trim()
        : null);

    // Headline — only available via /v2/me (r_liteprofile scope)
    const headline = (liProfile.localizedHeadline as string) || null;

    // Vanity URL (e.g. "prince-sharma") — only via /v2/me
    const vanityName = (liProfile.vanityName as string) || null;
    const linkedinProfileUrl = vanityName
      ? `https://www.linkedin.com/in/${vanityName}`
      : null;

    // Profile picture — prefer high-res from v2/me, fall back to OIDC picture
    const oidcPicture = (userinfo.picture as string) || null;

    return {
      externalId: userinfo.sub as string,
      rawData: {
        // OIDC standard fields
        sub: userinfo.sub,
        name: fullName,
        given_name: givenName,
        family_name: familyName,
        picture: oidcPicture,
        email: userinfo.email || null,
        email_verified: userinfo.email_verified || false,
        locale: userinfo.locale || null,

        // LinkedIn-specific fields (from /v2/me if available)
        headline,
        vanity_name: vanityName,
        linkedin_profile_url: linkedinProfileUrl,

        // Raw responses for future use / debugging (server-side only)
        _oidc_raw: userinfo,
        _v2me_raw: Object.keys(liProfile).length > 0 ? liProfile : null,

        // Availability note for the UI
        _scope_note:
          "LinkedIn OIDC scope provides identity fields only. " +
          "Experience, education, and skills require LinkedIn partnership (r_liteprofile/r_member_social scopes).",
      },
    };
  }
}

export const linkedinConnector = new LinkedInConnector();
