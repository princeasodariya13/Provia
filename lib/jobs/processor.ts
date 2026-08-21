import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { getJobHandler } from "./registry";
import { JobService } from "./service";
import { JobType } from "./types";
import { env } from "@/lib/env";

export const JobProcessor = {
  /**
   * Tries to claim exactly one job that is QUEUED and available.
   * Uses an atomic update with a condition.
   */
  async claimNextJob() {
    const now = new Date();

    // 1. Find a candidate
    const candidate = await prisma.job.findFirst({
      where: {
        status: "QUEUED",
        availableAt: { lte: now }
      },
      orderBy: { createdAt: "asc" },
      select: { id: true, attempts: true }
    });

    if (!candidate) return null;

    // 2. Try to atomically claim it
    try {
      const claimed = await prisma.job.update({
        where: {
          id: candidate.id,
          status: "QUEUED" // Only update if still QUEUED!
        },
        data: {
          status: "PROCESSING",
          lockedAt: now,
          startedAt: now,
          attempts: candidate.attempts + 1,
        }
      });

      return JobService.mapToEntity(claimed);
    } catch (error) {
      // If someone else claimed it, Prisma will throw a P2025 error (Record to update not found).
      return null;
    }
  },

  /**
   * Recovers jobs that have been stuck in PROCESSING longer than the timeout.
   */
  async recoverStaleJobs(timeoutMs: number = 5 * 60 * 1000) {
    const cutoff = new Date(Date.now() - timeoutMs);
    
    const staleJobs = await prisma.job.findMany({
      where: {
        status: "PROCESSING",
        lockedAt: { lt: cutoff }
      }
    });

    for (const job of staleJobs) {
      logger.warn({ jobId: job.id, type: job.type }, "Recovering stale job");
      
      if (job.attempts < job.maxAttempts) {
        // Requeue
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "QUEUED",
            lockedAt: null,
            availableAt: new Date(Date.now() + 5000) // Small delay
          }
        });
      } else {
        // Mark failed
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            failedAt: new Date(),
            errorCode: "TIMEOUT",
            errorMessage: "Job stuck in processing and exceeded max attempts"
          }
        });
      }
    }
  },

  async processNextJob(): Promise<boolean> {
    const job = await this.claimNextJob();
    if (!job) return false;

    logger.info({ jobId: job.id, type: job.type, attempt: job.attempts }, "job.started");
    const startMs = performance.now();

    try {
      const handler = getJobHandler(job.type as JobType);
      if (!handler) {
        throw new Error(`Handler not found for type ${job.type}`);
      }

      const result = await handler.handler(job);

      // Complete
      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          result: result ? JSON.stringify(result) : null,
        }
      });

      logger.info({ 
        jobId: job.id, 
        type: job.type, 
        durationMs: Math.round(performance.now() - startMs) 
      }, "job.completed");

    } catch (error) {
      // Fail
      const errMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (job.attempts < job.maxAttempts) {
        // Backoff: 5s, 30s, etc.
        const backoffSeconds = job.attempts === 1 ? 5 : Math.pow(6, job.attempts - 1);
        
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "QUEUED",
            errorCode: "RETRYABLE_ERROR",
            errorMessage: errMessage,
            lockedAt: null,
            availableAt: new Date(Date.now() + backoffSeconds * 1000)
          }
        });
        
        logger.warn({ 
          jobId: job.id, 
          type: job.type, 
          err: errMessage,
          durationMs: Math.round(performance.now() - startMs) 
        }, "job.retry_scheduled");

      } else {
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            failedAt: new Date(),
            errorCode: "PERMANENT_ERROR",
            errorMessage: errMessage,
          }
        });

        logger.error({ 
          jobId: job.id, 
          type: job.type, 
          err: errMessage,
          durationMs: Math.round(performance.now() - startMs) 
        }, "job.failed");
      }
    }

    return true; // We processed a job
  },

  async poll(intervalMs: number = 3000) {
    logger.info("Job processor started polling");
    let isRunning = true;

    // Graceful shutdown
    const stop = () => {
      logger.info("Job processor stopping...");
      isRunning = false;
    };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);

    while (isRunning) {
      try {
        await this.recoverStaleJobs();
        const processed = await this.processNextJob();
        
        if (!processed && isRunning) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
      } catch (error) {
        logger.error({ err: error }, "Job processor encountered an error");
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
};
