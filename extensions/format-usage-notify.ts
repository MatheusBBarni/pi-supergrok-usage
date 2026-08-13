import type { UsageObservation } from "./usage-observation.js";

export function formatUsageNotify(
  observation: UsageObservation | undefined,
): string {
  if (!observation) {
    return "No xAI rate window yet. Send a Grok message first.";
  }
  return [
    `xAI ${observation.remaining}/${observation.limit} RPM · ${observation.source} · ${observation.ts}`,
    "Request rate window, not SuperGrok weekly. Session tokens/cost stay in the built-in footer.",
  ].join("\n");
}
