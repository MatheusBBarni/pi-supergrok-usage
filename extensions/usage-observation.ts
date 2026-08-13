import type { RequestWindow } from "./parse-request-window.js";

export type UsageObservation = RequestWindow & {
  ts: string;
  provider: string;
  modelId: string;
  source: "headers";
};

export function buildObservation(input: {
  window: RequestWindow;
  provider: string;
  modelId: string;
  now?: Date;
}): UsageObservation {
  return {
    remaining: input.window.remaining,
    limit: input.window.limit,
    ts: (input.now ?? new Date()).toISOString(),
    provider: input.provider,
    modelId: input.modelId,
    source: "headers",
  };
}
