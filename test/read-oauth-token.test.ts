import { describe, expect, it } from "vitest";
import { readXaiOauthToken } from "../extensions/read-oauth-token.js";

describe("readXaiOauthToken", () => {
  it("prefers Pi xAI OAuth and falls back to grok auth.json", () => {
    expect(
      readXaiOauthToken({
        piAuthPath: "/tmp/pi-auth.json",
        grokAuthPath: "/tmp/grok-auth.json",
        readFile: (path) => {
          if (path === "/tmp/pi-auth.json") {
            return JSON.stringify({
              xai: { type: "oauth", access: "pi-access-token" },
            });
          }
          throw new Error("should not read grok");
        },
      }),
    ).toBe("pi-access-token");

    expect(
      readXaiOauthToken({
        piAuthPath: "/tmp/pi-auth.json",
        grokAuthPath: "/tmp/grok-auth.json",
        readFile: (path) => {
          if (path === "/tmp/pi-auth.json") {
            return JSON.stringify({ xai: { type: "api_key", key: "sk-xai" } });
          }
          return JSON.stringify({
            "https://auth.x.ai::abc": { key: "grok-access-token" },
          });
        },
      }),
    ).toBe("grok-access-token");

    expect(
      readXaiOauthToken({
        piAuthPath: "/tmp/missing.json",
        grokAuthPath: "/tmp/missing-grok.json",
        readFile: () => {
          throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
        },
      }),
    ).toBeUndefined();
  });
});
