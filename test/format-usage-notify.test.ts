import { describe, expect, it } from "vitest";
import { formatUsageNotify } from "../extensions/format-usage-notify.js";

describe("formatUsageNotify", () => {
  it("tells the user to send a Grok message when there is no observation", () => {
    expect(formatUsageNotify(undefined)).toBe(
      "No xAI rate window yet. Send a Grok message first.",
    );
  });

  it("formats a cached RPM window with source, timestamp, and notes", () => {
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
        "Request rate window, not SuperGrok weekly. Session tokens/cost stay in the built-in footer.",
      ].join("\n"),
    );
    expect(text).not.toMatch(/%|rst /i);
  });
});
