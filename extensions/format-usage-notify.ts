import { formatCountdown } from "./format-countdown.js";
import type { SuperGrokSnapshot } from "./to-snapshot.js";
import type { UsageObservation } from "./usage-observation.js";

const PERIOD_LABEL: Record<SuperGrokSnapshot["period"], string> = {
  weekly: "weekly",
  monthly: "monthly",
  unknown: "current period",
};

export function formatUsageNotify(
  observation: UsageObservation | undefined,
  billing?: SuperGrokSnapshot,
  now: Date = new Date(),
): string {
  const lines: string[] = [];
  if (billing) {
    const reset = formatCountdown(billing.resetAt, now);
    const resetPart = reset === "—" ? "" : ` · resets ${reset}`;
    const prepaid =
      billing.prepaidBalance === undefined
        ? ""
        : ` · prepaid $${billing.prepaidBalance.toFixed(2)}`;
    lines.push(
      `${billing.plan} ${billing.percent}% ${PERIOD_LABEL[billing.period]}${resetPart}${prepaid}`,
    );
  }
  if (observation) {
    lines.push(
      `xAI ${observation.remaining}/${observation.limit} RPM · ${observation.source} · ${observation.ts}`,
    );
  }
  if (lines.length === 0) {
    return "No SuperGrok usage yet. Run /login xai (subscription) or send a Grok message.";
  }
  if (!billing) {
    lines.push(
      "Request rate window. SuperGrok weekly needs /login xai (subscription).",
    );
  }
  return lines.join("\n");
}
