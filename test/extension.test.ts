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
  it("registers only after_provider_response and writes a dump for xAI", async () => {
    const writes: unknown[] = [];
    const factory = createExtension({
      writeDump: async (record) => {
        writes.push(record);
      },
    });

    const { pi, calls } = createFakePi();
    factory(pi as ExtensionAPI);

    expect(calls.on.map((entry) => entry.event)).toEqual([
      "after_provider_response",
    ]);
    expect(calls.registerTool).toEqual([]);
    expect(calls.registerCommand).toEqual([]);
    expect(calls.registerShortcut).toEqual([]);
    expect(calls.registerFlag).toEqual([]);

    const handler = calls.on[0]?.handler;
    expect(typeof handler).toBe("function");

    await handler(
      {
        type: "after_provider_response",
        status: 200,
        headers: {
          "x-ratelimit-remaining": "7",
          authorization: "Bearer secret",
        },
      },
      { cwd: "/tmp/probe-test", model: { provider: "xai", id: "grok-4" } },
    );

    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatchObject({
      status: 200,
      headers: {
        "x-ratelimit-remaining": "7",
        authorization: "<redacted>",
      },
      provider: "xai",
      modelId: "grok-4",
    });
    expect(typeof (writes[0] as { ts: string }).ts).toBe("string");

    await handler(
      { type: "after_provider_response", status: 200, headers: {} },
      { cwd: "/tmp/probe-test", model: { provider: "anthropic", id: "claude" } },
    );
    await handler(
      { type: "after_provider_response", status: 200, headers: {} },
      { cwd: "/tmp/probe-test" },
    );
    expect(writes).toHaveLength(1);

    const throwingFactory = createExtension({
      writeDump: async () => {
        throw new Error("disk full");
      },
    });
    const thrown = createFakePi();
    throwingFactory(thrown.pi as ExtensionAPI);
    await expect(
      thrown.calls.on[0]?.handler(
        { type: "after_provider_response", status: 429, headers: {} },
        { cwd: "/tmp/probe-test", model: { provider: "xai", id: "grok-4" } },
      ),
    ).resolves.toBeUndefined();
  });
});
