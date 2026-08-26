import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "./logger";
import { APIError } from "./errors";
import { AnalyticsService } from "./analytics/service";
import * as crypto from "crypto";

type HandlerFunc = (req: Request, ...args: unknown[]) => Promise<NextResponse | void> | NextResponse | void;

export function withAPIHandler(handler: HandlerFunc) {
  return async (req: Request, ...args: unknown[]) => {
    const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
    const start = performance.now();

    try {
      const response = await handler(req, ...args);
      const durationMs = Math.round(performance.now() - start);

      // Async event tracking for API success
      AnalyticsService.record({
        eventName: "api.request_completed",
        requestId,
        metadata: {
          path: req.url,
          method: req.method,
          durationMs,
        }
      });

      return response || NextResponse.json({ success: true });
    } catch (error: unknown) {
      const durationMs = Math.round(performance.now() - start);
      
      logger.error({ err: error, url: req.url, requestId }, "API Request Error");

      AnalyticsService.record({
        eventName: "system.error",
        requestId,
        metadata: {
          path: req.url,
          method: req.method,
          durationMs,
          error: error instanceof Error ? error.message : "Unknown Error",
        }
      });

      try {
        const fs = require('fs');
        fs.appendFileSync('c:\\Users\\Prince\\Desktop\\Provia\\Provia\\my-app\\api-error.log', new Date().toISOString() + '\\n' + (error instanceof Error ? error.stack : JSON.stringify(error)) + '\\n\\n');
      } catch(e) {}

      if (error instanceof z.ZodError || (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError')) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: error.issues,
            requestId
          },
          { status: 400 }
        );
      }

      if (error instanceof APIError) {
        const apiErr = error as APIError & { errors?: unknown };
        return NextResponse.json(
          {
            success: false,
            error: apiErr.message,
            ...(apiErr.errors ? { details: apiErr.errors } : {}),
            requestId
          },
          { status: apiErr.statusCode }
        );
      }

      // Fallback for unhandled errors
      return NextResponse.json(
        {
          success: false,
          error: "Internal Server Error",
          requestId
        },
        { status: 500 }
      );
    }
  };
}
