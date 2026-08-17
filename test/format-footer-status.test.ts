import { describe, expect, it } from "vitest";
import { formatFooterStatus } from "../extensions/format-footer-status.js";

const now = new Date("2026-08-17T17:33:48.000Z");
const billing = {
  plan: "SuperGrok",
  percent: 1,
  period: "weekly" as const,
  resetAt: "2026-08-24T17:33:48.000Z",
  prepaidBalance: 0,
};

describe("formatFooterStatus", () => {
  it("prefers SuperGrok billing and keeps RPM as a suffix", () => {
    expect(formatFooterStatus({ now })).toBeUndefined();
    expect(
      formatFooterStatus({ rpm: { remaining: 7, limit: 10 }, now }),
    ).toBe("xAI 7/10 RPM");
    expect(formatFooterStatus({ billing, now })).toBe("SG 1% · 7d 0h");
    expect(
      formatFooterStatus({
        billing,
        rpm: { remaining: 8300, limit: 8300 },
        now,
      }),
    ).toBe("SG 1% · 7d 0h · 8300/8300 RPM");
  });
});
