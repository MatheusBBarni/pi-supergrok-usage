import { describe, expect, it } from "vitest";
import { formatRpmStatus } from "../extensions/format-rpm-status.js";

describe("formatRpmStatus", () => {
  it("formats remaining/limit as an xAI RPM window", () => {
    expect(formatRpmStatus({ remaining: 7, limit: 10 })).toBe("xAI 7/10 RPM");
    expect(formatRpmStatus({ remaining: 8300, limit: 8300 })).toBe(
      "xAI 8300/8300 RPM",
    );
    expect(formatRpmStatus({ remaining: 7, limit: 10 })).not.toMatch(
      /SuperGrok|%|rst/i,
    );
  });
});
