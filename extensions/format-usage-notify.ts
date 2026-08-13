import type { UsageObservation } from "./usage-observation.js";

export function formatUsageNotify(
  observation: UsageObservation | undefined,
): string {
  if (!observation) {
    return "No xAI rate window yet. Send a Grok message first.";
  }
  return "";
}
