import { Provider } from "@prisma/client";

export interface IntegrationData {
  externalId: string;
  rawData: unknown;
}

export interface SourceConnector {
  getProviderId(): Provider;
  isConfigured(): boolean;
  getAuthUrl(redirectUri: string, state: string): string;
  exchangeToken(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken?: string; scopes?: string }>;
  fetchProfile(accessToken: string): Promise<IntegrationData>;
}
