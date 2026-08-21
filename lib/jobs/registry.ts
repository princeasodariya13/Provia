import { JobDefinition, JobType } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers = new Map<JobType, JobDefinition<any>>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerJobHandler<T>(def: JobDefinition<T>) {
  handlers.set(def.type, def);
}

export function getJobHandler(type: JobType) {
  return handlers.get(type);
}
