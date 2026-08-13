import { describe, expect, it } from "vitest";
import { redactHeaders } from "../extensions/redact-headers.js";

describe("redactHeaders", () => {
  it("keeps quota headers and redacts denylisted names without mutating input", () => {
    const input = {
      "x-ratelimit-remaining": "42",
      "retry-after": "1",
      authorization: "Bearer secret-token",
      Authorization: "also-secret",
      cookie: "sid=abc",
      "x-api-key": "key-123",
    };

    const result = redactHeaders(input);

    expect(result).toEqual({
      "x-ratelimit-remaining": "42",
      "retry-after": "1",
      authorization: "<redacted>",
      Authorization: "<redacted>",
      cookie: "<redacted>",
      "x-api-key": "<redacted>",
    });
    expect(input.authorization).toBe("Bearer secret-token");
    expect(input).not.toBe(result);
  });
});
