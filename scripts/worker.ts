import { createServer } from "http";
import { JobProcessor } from "../lib/jobs";
import { env } from "../lib/env";
import { prisma } from "../lib/db";
import { logger } from "../lib/logger";

const pollInterval = parseInt(env.JOB_POLL_INTERVAL_MS, 10);
const port = process.env.PORT || 8081;

async function startWorker() {
  if (!process.env.DATABASE_URL) {
    logger.fatal("FATAL: DATABASE_URL is missing in environment. Worker cannot connect to PostgreSQL.");
    process.exit(1);
  }

  logger.info(`Starting Provia Background Worker... (Polling interval: ${pollInterval}ms)`);

  // Start a minimal HTTP server for Render/Railway/Fly.io health checks
  const server = createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(port, () => {
    logger.info(`Worker health server listening on port ${port}`);
  });

  try {
    // This will block until SIGINT/SIGTERM is received and the loop exits gracefully
    await JobProcessor.poll(pollInterval);
  } catch (err) {
    logger.error({ err }, "Fatal error in JobProcessor.poll");
    process.exit(1);
  } finally {
    logger.info("Worker shutting down: Disconnecting from database...");
    await prisma.$disconnect();
    server.close(() => {
      logger.info("Worker shutdown complete.");
      process.exit(0);
    });
  }
}

startWorker();
