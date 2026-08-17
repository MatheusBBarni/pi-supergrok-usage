import { formatCountdown } from "./format-countdown.js";
import type { SuperGrokSnapshot } from "./to-snapshot.js";

export function formatBillingStatus(
  snapshot: SuperGrokSnapshot,
  now: Date = new Date(),
): string {
  const reset = formatCountdown(snapshot.resetAt, now);
  if (reset === "—") {
    return `SG ${snapshot.percent}%`;
  }
  return `SG ${snapshot.percent}% · ${reset}`;
}
