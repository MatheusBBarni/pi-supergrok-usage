import { describe, expect, it } from "vitest";
import { formatUsageNotify } from "../extensions/format-usage-notify.js";

describe("formatUsageNotify", () => {
  it("tells the user to send a Grok message when there is no observation", () => {
    expect(formatUsageNotify(undefined)).toBe(
      "No xAI rate window yet. Send a Grok message first.",
    );
  });
});
