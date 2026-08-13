import { describe, expect, it } from "vitest";
import { buildDump } from "../extensions/build-dump.js";

describe("buildDump", () => {
  it("returns ts, status, redacted headers, provider, and modelId", () => {
    const now = new Date("2026-08-13T12:00:00.000Z");
    const dump = buildDump({
      status: 200,
      headers: {
        "x-ratelimit-remaining": "99",
        authorization: "Bearer secret",
      },
      model: { provider: "xai", id: "grok-4" },
      now,
    });

    expect(dump).toEqual({
      ts: "2026-08-13T12:00:00.000Z",
      status: 200,
      headers: {
        "x-ratelimit-remaining": "99",
        authorization: "<redacted>",
      },
      provider: "xai",
      modelId: "grok-4",
    });
  });
});
