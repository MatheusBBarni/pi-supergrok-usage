import { describe, expect, it } from "vitest";
import { toSnapshot } from "../extensions/to-snapshot.js";

const weekly = {
  config: {
    creditUsagePercent: 42.5,
    currentPeriod: {
      type: "USAGE_PERIOD_TYPE_WEEKLY",
      end: "2026-08-10T00:00:00Z",
    },
    prepaidBalance: { val: 1250 },
  },
  subscription_tier: "SuperGrok Heavy",
};

describe("toSnapshot", () => {
  it("maps the weekly Grok billing shape", () => {
    expect(toSnapshot(weekly)).toEqual({
      plan: "SuperGrok Heavy",
      percent: 43,
      period: "weekly",
      resetAt: "2026-08-10T00:00:00.000Z",
      prepaidBalance: 12.5,
    });
  });

  it("treats omitted percent under a typed current period as zero", () => {
    expect(
      toSnapshot({
        config: {
          currentPeriod: {
            type: "USAGE_PERIOD_TYPE_WEEKLY",
            end: "2026-08-13T00:00:00Z",
          },
          monthlyLimit: { val: 1000 },
          used: { val: 900 },
        },
      }),
    ).toMatchObject({ percent: 0, period: "weekly" });
  });

  it("derives monthly percent from legacy counters", () => {
    expect(
      toSnapshot({
        config: {
          monthlyLimit: { val: "2000" },
          used: { val: 500 },
          billingPeriodEnd: "2026-09-01T00:00:00Z",
        },
      }),
    ).toMatchObject({
      plan: "SuperGrok",
      percent: 25,
      period: "monthly",
      resetAt: "2026-09-01T00:00:00.000Z",
    });
  });

  it("rejects percentages and resets outside the supported range", () => {
    expect(() =>
      toSnapshot({ config: { creditUsagePercent: 101 } }),
    ).toThrow(/outside the supported range/);
    expect(() =>
      toSnapshot({
        config: {
          creditUsagePercent: 5,
          currentPeriod: { end: "not-a-date" },
        },
      }),
    ).toThrow(/RFC 3339/);
  });
});
