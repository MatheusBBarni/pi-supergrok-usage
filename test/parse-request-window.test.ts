import { describe, expect, it } from "vitest";
import { parseRequestWindow } from "../extensions/parse-request-window.js";

describe("parseRequestWindow", () => {
  it("returns remaining and limit only when both request headers are integers", () => {
    expect(
      parseRequestWindow({
        "x-ratelimit-remaining-requests": "7",
        "x-ratelimit-limit-requests": "10",
        "x-ratelimit-remaining-tokens": "100",
      }),
    ).toEqual({ remaining: 7, limit: 10 });

    expect(
      parseRequestWindow({
        "x-ratelimit-remaining-requests": "7",
      }),
    ).toBeUndefined();

    expect(
      parseRequestWindow({
        "x-ratelimit-remaining-requests": "seven",
        "x-ratelimit-limit-requests": "10",
      }),
    ).toBeUndefined();

    expect(parseRequestWindow({})).toBeUndefined();
  });
});
