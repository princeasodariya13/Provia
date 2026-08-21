import { JobProcessor } from "../lib/jobs";

const pollInterval = parseInt(process.env.JOB_POLL_INTERVAL_MS || "3000", 10);

console.log(`Starting Provia Background Worker... (Polling interval: ${pollInterval}ms)`);
JobProcessor.poll(pollInterval);
