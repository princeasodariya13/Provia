import { prisma } from "@/lib/db";
import { CreateJobParams, JobEntity, JobType } from "./types";
import { getJobHandler } from "./registry";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export const JobService = {
  async createJob<T>(params: CreateJobParams<T>): Promise<JobEntity<T>> {
    const handler = getJobHandler(params.type);
    if (!handler) {
      throw new APIError(`No handler registered for job type ${params.type}`, 400);
    }

    // Validate payload
    const safePayload = handler.schema.parse(params.payload);

    // Basic idempotency check for QUEUED or PROCESSING jobs of the same type and userId
    const existingActive = await prisma.job.findFirst({
      where: {
        userId: params.userId,
        type: params.type,
        status: { in: ["QUEUED", "PROCESSING"] }
      }
    });

    if (existingActive) {
      // Just return the existing job if one is already active to prevent duplicate execution
      logger.info({ jobId: existingActive.id, type: params.type }, "Job idempotent return");
      return this.mapToEntity<T>(existingActive);
    }

    const job = await prisma.job.create({
      data: {
        userId: params.userId,
        type: params.type,
        payload: JSON.stringify(safePayload),
        status: "QUEUED",
      }
    });

    logger.info({ jobId: job.id, type: job.type, userId: job.userId }, "job.created");

    return this.mapToEntity<T>(job);
  },

  async getJob(id: string, userId?: string) {
    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) return null;
    if (userId && job.userId !== userId) return null;

    return this.mapToEntity(job);
  },

  async retryJob(id: string, userId: string) {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job || job.userId !== userId) {
      throw new APIError("Job not found", 404);
    }

    if (job.status !== "FAILED") {
      throw new APIError("Only FAILED jobs can be retried", 400);
    }

    const updated = await prisma.job.update({
      where: { id },
      data: {
        status: "QUEUED",
        attempts: 0, // Explicit retry resets attempts
        availableAt: new Date(),
        errorCode: null,
        errorMessage: null,
      }
    });

    logger.info({ jobId: job.id, type: job.type, userId: job.userId }, "job.retry_scheduled");

    return this.mapToEntity(updated);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapToEntity<T>(prismaJob: any): JobEntity<T> {
    return {
      id: prismaJob.id,
      userId: prismaJob.userId,
      type: prismaJob.type as JobType,
      status: prismaJob.status,
      payload: prismaJob.payload ? JSON.parse(prismaJob.payload) : null,
      result: prismaJob.result ? JSON.parse(prismaJob.result) : null,
      errorCode: prismaJob.errorCode,
      errorMessage: prismaJob.errorMessage,
      attempts: prismaJob.attempts,
      maxAttempts: prismaJob.maxAttempts,
      availableAt: prismaJob.availableAt,
      startedAt: prismaJob.startedAt,
      completedAt: prismaJob.completedAt,
      failedAt: prismaJob.failedAt,
      createdAt: prismaJob.createdAt,
      updatedAt: prismaJob.updatedAt,
    };
  }
};
