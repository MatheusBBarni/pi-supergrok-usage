import { describe, expect, it } from "vitest";
import { formatUsageNotify } from "../extensions/format-usage-notify.js";

const now = new Date("2026-08-17T17:33:48.000Z");

describe("formatUsageNotify", () => {
  it("tells the user how to populate usage when nothing is cached", () => {
    expect(formatUsageNotify(undefined)).toBe(
      "No SuperGrok usage yet. Run /login xai (subscription) or send a Grok message.",
    );
  });

  it("formats a cached RPM window when SuperGrok billing is missing", () => {
    const text = formatUsageNotify({
      remaining: 7,
      limit: 10,
      ts: "2026-08-13T16:26:56.347Z",
      provider: "xai",
      modelId: "grok-4",
      source: "headers",
    });
    expect(text).toBe(
      [
        "xAI 7/10 RPM · headers · 2026-08-13T16:26:56.347Z",
        "Request rate window. SuperGrok weekly needs /login xai (subscription).",
      ].join("\n"),
    );
  });

  it("leads with SuperGrok billing and keeps RPM as a second line", () => {
    const text = formatUsageNotify(
      {
        remaining: 7,
        limit: 10,
        ts: "2026-08-13T16:26:56.347Z",
        provider: "xai",
        modelId: "grok-4",
        source: "headers",
      },
      {
        plan: "SuperGrok",
        percent: 1,
        period: "weekly",
        resetAt: "2026-08-24T17:33:48.000Z",
        prepaidBalance: 0,
      },
      now,
    );
    expect(text).toBe(
      [
        "SuperGrok 1% weekly · resets 7d 0h · prepaid $0.00",
        "xAI 7/10 RPM · headers · 2026-08-13T16:26:56.347Z",
      ].join("\n"),
    );
  });
});
