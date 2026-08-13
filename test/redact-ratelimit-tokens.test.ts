import { describe, expect, it } from "vitest";
import { redactHeaders } from "../extensions/redact-headers.js";

describe("redactHeaders", () => {
  it("keeps x-ratelimit token window fields", () => {
    expect(
      redactHeaders({
        "x-ratelimit-limit-tokens": "128000",
        "x-ratelimit-remaining-tokens": "127900",
        "x-auth-token": "secret",
      }),
    ).toEqual({
      "x-ratelimit-limit-tokens": "128000",
      "x-ratelimit-remaining-tokens": "127900",
      "x-auth-token": "<redacted>",
    });
  });
});
