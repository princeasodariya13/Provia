import { JobProcessor } from "../lib/jobs";
import { env } from "../lib/env";

const pollInterval = parseInt(env.JOB_POLL_INTERVAL_MS, 10);

console.log(`Starting Provia Background Worker... (Polling interval: ${pollInterval}ms)`);
JobProcessor.poll(pollInterval);
