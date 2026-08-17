import { describe, expect, it } from "vitest";
import { formatBillingStatus } from "../extensions/format-billing-status.js";

const now = new Date("2026-08-17T17:33:48.000Z");

const billing = {
  plan: "SuperGrok",
  percent: 1,
  period: "weekly" as const,
  resetAt: "2026-08-24T17:33:48.000Z",
  prepaidBalance: 0,
};

describe("formatBillingStatus", () => {
  it("shows SuperGrok percent and reset countdown", () => {
    expect(formatBillingStatus(billing, now)).toBe("SG 1% · 7d 0h");
  });
});
