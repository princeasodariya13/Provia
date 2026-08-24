-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "deadLetteredAt" TIMESTAMP(3),
ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "workerId" TEXT;

-- CreateTable
CREATE TABLE "WorkerStatus" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentJobId" TEXT,
    "jobsProcessed" INTEGER NOT NULL DEFAULT 0,
    "jobsFailed" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ONLINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkerStatus_workerId_key" ON "WorkerStatus"("workerId");

-- CreateIndex
CREATE INDEX "WorkerStatus_lastHeartbeatAt_idx" ON "WorkerStatus"("lastHeartbeatAt");

-- CreateIndex
CREATE INDEX "Job_deadLetteredAt_idx" ON "Job"("deadLetteredAt");

-- CreateIndex
CREATE INDEX "Job_workerId_idx" ON "Job"("workerId");
