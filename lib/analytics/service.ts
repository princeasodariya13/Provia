import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export type AnalyticsEventName =
  | "auth.registered"
  | "auth.login_succeeded"
  | "auth.login_failed"
  | "auth.logout"
  | "auth.email_verified"
  | "auth.password_changed"
  | "auth.account_deleted"
  | "integration.connect_started"
  | "integration.import_succeeded"
  | "integration.import_failed"
  | "ai.analysis_started"
  | "ai.analysis_completed"
  | "ai.analysis_failed"
  | "portfolio.generated"
  | "portfolio.version_created"
  | "portfolio.publish_started"
  | "portfolio.published"
  | "portfolio.unpublished"
  | "portfolio.public_viewed"
  | "portfolio.share_initiated"
  | "api.request_completed"
  | "api.request_failed"
  | "system.error";

export interface AnalyticsEventPayload {
  eventName: AnalyticsEventName;
  userId?: string;
  requestId?: string;
  entityType?: string;
  entityId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export class AnalyticsService {
  /**
   * Safely records an analytics event without blocking or throwing.
   */
  static async record(payload: AnalyticsEventPayload): Promise<void> {
    try {
      // Data minimization and sanitization check:
      // Ensure no raw passwords, secrets, or huge payloads enter metadata.
      const sanitizedMetadata = payload.metadata ? JSON.stringify(payload.metadata, (key, value) => {
        const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'key', 'credential', 'cookie', 'jwt'];
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          return "[REDACTED]";
        }
        return value;
      }) : null;

      await prisma.analyticsEvent.create({
        data: {
          eventName: payload.eventName,
          userId: payload.userId,
          requestId: payload.requestId,
          entityType: payload.entityType,
          entityId: payload.entityId,
          metadata: sanitizedMetadata,
        },
      });
    } catch (error) {
      // We swallow the error so analytics failure NEVER breaks the app
      logger.error({ 
        msg: "Failed to record analytics event",
        err: error instanceof Error ? error.message : String(error),
        eventName: payload.eventName
      });
    }
  }
}
