import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { AnalyticsService } from "../analytics/service";
import { getJobHandler } from "./registry";
import { JobService } from "./service";
import { JobType } from "./types";
import * as crypto from "crypto";
import { JobStatus } from "@prisma/client";

export const JobProcessor = {
  /**
   * Tries to claim exactly one job that is QUEUED and available.
   * Uses an atomic update with a condition.
   */
  async claimNextJob(workerId?: string) {
    const now = new Date();

    try {
      // 1. Atomically find, lock, and update a single queued job
      // Using PostgreSQL FOR UPDATE SKIP LOCKED to prevent lock contention
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const claimedJobs: any[] = await prisma.$queryRawUnsafe(`
        UPDATE "Job"
        SET status = 'PROCESSING',
            "lockedAt" = $1,
            "startedAt" = $1,
            "workerId" = $2,
            attempts = attempts + 1,
            "updatedAt" = $1
        WHERE id = (
          SELECT id
          FROM "Job"
          WHERE status = 'QUEUED'
            AND "availableAt" <= $1
          ORDER BY "createdAt" ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
      `, now, workerId || null);

      if (!claimedJobs || claimedJobs.length === 0) {
        return null;
      }

      const claimed = claimedJobs[0];
      return JobService.mapToEntity(claimed);
    } catch (error) {
      logger.error({ err: error }, "Failed to claim next job with SKIP LOCKED");
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
      
      await AnalyticsService.record({
        eventName: "job.stuck_detected",
        userId: job.userId,
        entityId: job.id,
        entityType: "job",
        metadata: { jobType: job.type, attempts: job.attempts }
      });

      if (job.attempts < job.maxAttempts) {
        // Requeue
        await prisma.job.updateMany({
          where: { id: job.id, status: "PROCESSING" },
          data: {
            status: JobStatus.QUEUED,
            lockedAt: null,
            workerId: null,
            availableAt: new Date(Date.now() + 5000) // Small delay
          }
        });
      } else {
        // Mark failed (DLQ)
        await prisma.job.updateMany({
          where: { id: job.id, status: "PROCESSING" },
          data: {
            status: JobStatus.FAILED,
            failedAt: new Date(),
            deadLetteredAt: new Date(),
            errorCode: "TIMEOUT",
            errorMessage: "Job stuck in processing and exceeded max attempts"
          }
        });
        
        await AnalyticsService.record({
          eventName: "job.dead_lettered",
          userId: job.userId,
          entityId: job.id,
          entityType: "job",
          metadata: { jobType: job.type, errorCode: "TIMEOUT" }
        });
      }
    }
  },

  async processNextJob(workerId?: string): Promise<boolean> {
    const job = await this.claimNextJob(workerId);
    if (!job) return false;

    logger.info({ jobId: job.id, type: job.type, attempt: job.attempts, workerId }, "job.started");
    await AnalyticsService.record({
      eventName: "job.started",
      userId: job.userId,
      entityId: job.id,
      entityType: "job",
      metadata: { jobType: job.type, attempt: job.attempts, workerId }
    });

    const startMs = performance.now();

    try {
      const handler = getJobHandler(job.type as JobType);
      if (!handler) {
        throw new Error(`Handler not found for type ${job.type}`);
      }

      if (workerId) {
        await prisma.workerStatus.updateMany({
          where: { workerId },
          data: { currentJobId: job.id }
        });
      }

      const result = await handler.handler(job);
      const durationMs = Math.round(performance.now() - startMs);

      // Complete
      await prisma.job.updateMany({
        where: { id: job.id, status: "PROCESSING" },
        data: {
          status: JobStatus.COMPLETED,
          completedAt: new Date(),
          result: result ? JSON.stringify(result) : null,
          durationMs
        }
      });

      if (workerId) {
        await prisma.workerStatus.updateMany({
          where: { workerId },
          data: { jobsProcessed: { increment: 1 }, currentJobId: null }
        });
      }

      logger.info({ jobId: job.id, type: job.type, durationMs }, "job.completed");
      await AnalyticsService.record({
        eventName: "job.completed",
        userId: job.userId,
        entityId: job.id,
        entityType: "job",
        metadata: { jobType: job.type, durationMs, workerId }
      });

    } catch (error) {
      // Fail
      const errMessage = error instanceof Error ? error.message : "Unknown error";
      const durationMs = Math.round(performance.now() - startMs);
      
      if (job.attempts < job.maxAttempts) {
        // Backoff: 5s, 30s, etc.
        const backoffSeconds = job.attempts === 1 ? 5 : Math.pow(6, job.attempts - 1);
        
        await prisma.job.updateMany({
          where: { id: job.id, status: "PROCESSING" },
          data: {
            status: JobStatus.QUEUED,
            errorCode: "RETRYABLE_ERROR",
            errorMessage: errMessage,
            lockedAt: null,
            workerId: null,
            durationMs,
            availableAt: new Date(Date.now() + backoffSeconds * 1000)
          }
        });
        
        if (workerId) {
          await prisma.workerStatus.updateMany({
            where: { workerId },
            data: { currentJobId: null }
          });
        }
        
        logger.warn({ jobId: job.id, type: job.type, err: errMessage, durationMs }, "job.retry_scheduled");
        await AnalyticsService.record({
          eventName: "job.retry",
          userId: job.userId,
          entityId: job.id,
          entityType: "job",
          metadata: { jobType: job.type, durationMs, errorCode: "RETRYABLE_ERROR" }
        });

      } else {
        await prisma.job.updateMany({
          where: { id: job.id, status: "PROCESSING" },
          data: {
            status: JobStatus.FAILED,
            failedAt: new Date(),
            deadLetteredAt: new Date(),
            errorCode: "PERMANENT_ERROR",
            errorMessage: errMessage,
            durationMs
          }
        });

        if (workerId) {
          await prisma.workerStatus.updateMany({
            where: { workerId },
            data: { jobsFailed: { increment: 1 }, currentJobId: null }
          });
        }

        logger.error({ jobId: job.id, type: job.type, err: errMessage, durationMs }, "job.failed");
        await AnalyticsService.record({
          eventName: "job.failed",
          userId: job.userId,
          entityId: job.id,
          entityType: "job",
          metadata: { jobType: job.type, durationMs, errorCode: "PERMANENT_ERROR" }
        });
        await AnalyticsService.record({
          eventName: "job.dead_lettered",
          userId: job.userId,
          entityId: job.id,
          entityType: "job",
          metadata: { jobType: job.type, durationMs, errorCode: "PERMANENT_ERROR" }
        });
      }
    }

    return true; // We processed a job
  },

  async poll(intervalMs: number = 3000) {
    const workerId = crypto.randomUUID();
    
    await prisma.workerStatus.upsert({
      where: { workerId },
      update: { status: "ONLINE", lastHeartbeatAt: new Date() },
      create: { workerId, status: "ONLINE" }
    });

    logger.info({ workerId }, "Job processor started polling");
    let isRunning = true;

    let lastHeartbeat = Date.now();

    // Graceful shutdown
    const stop = async () => {
      logger.info("Job processor stopping...");
      isRunning = false;
      await prisma.workerStatus.updateMany({
        where: { workerId },
        data: { status: "OFFLINE", lastHeartbeatAt: new Date() }
      });
    };
    process.on("SIGINT", stop);
    process.on("SIGTERM", stop);

    while (isRunning) {
      try {
        if (Date.now() - lastHeartbeat > 10000) {
          await prisma.workerStatus.updateMany({
            where: { workerId },
            data: { lastHeartbeatAt: new Date(), status: "ONLINE" }
          });
          lastHeartbeat = Date.now();
        }

        await this.recoverStaleJobs();
        const processed = await this.processNextJob(workerId);
        
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
