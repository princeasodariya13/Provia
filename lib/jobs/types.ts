export type JobType = "PROFILE_ANALYSIS" | "PORTFOLIO_GENERATION" | "PROVIDER_SYNC" | "EMAIL_DELIVERY";

export type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface CreateJobParams<T = Record<string, unknown>> {
  userId: string;
  type: JobType;
  payload: T;
  idempotencyKey?: string; // Derived key for unique enforcement if needed
}

export interface JobDefinition<T> {
  type: JobType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any; // Zod schema
  handler: (job: JobEntity<T>) => Promise<unknown>;
}

export interface JobEntity<T = Record<string, unknown>> {
  id: string;
  userId: string;
  type: string;
  status: JobStatus;
  payload: T;
  result: unknown | null;
  errorCode: string | null;
  errorMessage: string | null;
  attempts: number;
  maxAttempts: number;
  availableAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  idempotencyKey: string | null;
}
