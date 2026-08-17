import { formatBillingStatus } from "./format-billing-status.js";
import { formatRpmStatus } from "./format-rpm-status.js";
import type { RequestWindow } from "./parse-request-window.js";
import type { SuperGrokSnapshot } from "./to-snapshot.js";

export function formatFooterStatus(input: {
  billing?: SuperGrokSnapshot;
  rpm?: RequestWindow;
  now?: Date;
}): string | undefined {
  const now = input.now ?? new Date();
  if (input.billing && input.rpm) {
    return `${formatBillingStatus(input.billing, now)} · ${input.rpm.remaining}/${input.rpm.limit} RPM`;
  }
  if (input.billing) {
    return formatBillingStatus(input.billing, now);
  }
  if (input.rpm) {
    return formatRpmStatus(input.rpm);
  }
  return undefined;
}
