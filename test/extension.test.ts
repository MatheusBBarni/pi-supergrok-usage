import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";
import { createExtension } from "../extensions/index.js";

function createFakePi() {
  const calls = {
    on: [] as Array<{ event: string; handler: Function }>,
    registerTool: [] as unknown[],
    registerCommand: [] as unknown[],
    registerShortcut: [] as unknown[],
    registerFlag: [] as unknown[],
  };

  const pi = {
    on(event: string, handler: Function) {
      calls.on.push({ event, handler });
    },
    registerTool(...args: unknown[]) {
      calls.registerTool.push(args);
    },
    registerCommand(...args: unknown[]) {
      calls.registerCommand.push(args);
    },
    registerShortcut(...args: unknown[]) {
      calls.registerShortcut.push(args);
    },
    registerFlag(...args: unknown[]) {
      calls.registerFlag.push(args);
    },
  };

  return { pi, calls };
}

describe("supergrok-usage extension factory", () => {
  it("registers session, response, and model hooks plus /xai-usage", async () => {
    const factory = createExtension({
      fetchBilling: async () => {
        throw new Error("no fetch in test");
      },
    });

    const { pi, calls } = createFakePi();
    factory(pi as ExtensionAPI);

    expect(calls.on.map((entry) => entry.event)).toEqual([
      "session_start",
      "after_provider_response",
      "model_select",
    ]);
    expect(calls.registerTool).toEqual([]);
    expect(calls.registerCommand.map((args) => (args as unknown[])[0])).toEqual(
      ["xai-usage"],
    );
    expect(calls.registerShortcut).toEqual([]);
    expect(calls.registerFlag).toEqual([]);

    const handler = calls.on.find((entry) => entry.event === "after_provider_response")
      ?.handler;
    expect(handler).toEqual(expect.any(Function));
    if (!handler) {
      throw new Error("after_provider_response handler missing");
    }

    await expect(
      handler(
        {
          type: "after_provider_response",
          status: 200,
          headers: {
            "x-ratelimit-remaining-requests": "7",
            "x-ratelimit-limit-requests": "10",
          },
        },
        { cwd: "/tmp/probe-test", model: { provider: "xai", id: "grok-4" } },
      ),
    ).resolves.toBeUndefined();

    await expect(
      handler(
        { type: "after_provider_response", status: 200, headers: {} },
        { cwd: "/tmp/probe-test", model: { provider: "anthropic", id: "claude" } },
      ),
    ).resolves.toBeUndefined();
    await expect(
      handler(
        { type: "after_provider_response", status: 200, headers: {} },
        { cwd: "/tmp/probe-test" },
      ),
    ).resolves.toBeUndefined();
  });
});
