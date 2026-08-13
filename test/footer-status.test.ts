import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";
import { createExtension } from "../extensions/index.js";

function createFakePi() {
  const handlers = new Map<string, Function>();
  const pi = {
    on(event: string, handler: Function) {
      handlers.set(event, handler);
    },
    registerCommand() {},
  };
  return { pi, handlers };
}

function createUi() {
  const statuses: Array<{ key: string; value: string | undefined }> = [];
  return {
    statuses,
    ui: {
      setStatus(key: string, value: string | undefined) {
        statuses.push({ key, value });
      },
    },
  };
}

describe("footer status from request window", () => {
  it("sets xAI remaining/limit RPM after a complete window and ignores incomplete or non-xAI", async () => {
    const factory = createExtension({ writeDump: async () => {} });
    const { pi, handlers } = createFakePi();
    factory(pi as unknown as ExtensionAPI);

    const after = handlers.get("after_provider_response");
    expect(typeof after).toBe("function");

    const complete = createUi();
    await after?.(
      {
        type: "after_provider_response",
        status: 200,
        headers: {
          "x-ratelimit-remaining-requests": "7",
          "x-ratelimit-limit-requests": "10",
        },
      },
      {
        cwd: "/tmp/footer-test",
        model: { provider: "xai", id: "grok-4" },
        ui: complete.ui,
      },
    );
    expect(complete.statuses).toEqual([
      { key: "supergrok-usage", value: "xAI 7/10 RPM" },
    ]);

    const incomplete = createUi();
    await after?.(
      {
        type: "after_provider_response",
        status: 200,
        headers: { "x-ratelimit-remaining-requests": "7" },
      },
      {
        cwd: "/tmp/footer-test",
        model: { provider: "xai", id: "grok-4" },
        ui: incomplete.ui,
      },
    );
    expect(incomplete.statuses).toEqual([]);

    const other = createUi();
    await after?.(
      {
        type: "after_provider_response",
        status: 200,
        headers: {
          "x-ratelimit-remaining-requests": "7",
          "x-ratelimit-limit-requests": "10",
        },
      },
      {
        cwd: "/tmp/footer-test",
        model: { provider: "anthropic", id: "claude" },
        ui: other.ui,
      },
    );
    expect(other.statuses).toEqual([]);
  });
});
