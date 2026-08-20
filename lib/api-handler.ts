import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "./logger";
import { APIError } from "./errors";

type HandlerFunc = (req: Request, ...args: unknown[]) => Promise<NextResponse | void> | NextResponse | void;

export function withAPIHandler(handler: HandlerFunc) {
  return async (req: Request, ...args: unknown[]) => {
    try {
      const response = await handler(req, ...args);
      return response || NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error({ err: error, url: req.url }, "API Request Error");

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: error.issues,
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
          },
          { status: apiErr.statusCode }
        );
      }

      // Fallback for unhandled errors
      return NextResponse.json(
        {
          success: false,
          error: "Internal Server Error",
        },
        { status: 500 }
      );
    }
  };
}
