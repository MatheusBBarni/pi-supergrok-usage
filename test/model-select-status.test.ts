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

describe("model_select footer status", () => {
  it("clears off xAI, restores cached RPM, and stays clear without a cache", async () => {
    const factory = createExtension({
      fetchBilling: async () => {
        throw new Error("no fetch in test");
      },
    });
    const { pi, handlers } = createFakePi();
    factory(pi as unknown as ExtensionAPI);

    const after = handlers.get("after_provider_response");
    const onSelect = handlers.get("model_select");
    expect(typeof after).toBe("function");
    expect(typeof onSelect).toBe("function");

    const ui = createUi();
    const ctx = {
      cwd: "/tmp/model-select-test",
      model: { provider: "xai", id: "grok-4" },
      ui: ui.ui,
    };

    await after?.(
      {
        type: "after_provider_response",
        status: 200,
        headers: {
          "x-ratelimit-remaining-requests": "7",
          "x-ratelimit-limit-requests": "10",
        },
      },
      ctx,
    );
    expect(ui.statuses).toEqual([
      { key: "supergrok-usage", value: "xAI 7/10 RPM" },
    ]);

    await onSelect?.(
      {
        type: "model_select",
        model: { provider: "anthropic", id: "claude" },
        source: "set",
      },
      ctx,
    );
    expect(ui.statuses.at(-1)).toEqual({
      key: "supergrok-usage",
      value: undefined,
    });

    await onSelect?.(
      {
        type: "model_select",
        model: { provider: "xai", id: "grok-4" },
        source: "set",
      },
      ctx,
    );
    expect(ui.statuses.at(-1)).toEqual({
      key: "supergrok-usage",
      value: "xAI 7/10 RPM",
    });

    const empty = createFakePi();
    const emptyUi = createUi();
    factory(empty.pi as unknown as ExtensionAPI);
    await empty.handlers.get("model_select")?.(
      {
        type: "model_select",
        model: { provider: "xai", id: "grok-4" },
        source: "set",
      },
      { cwd: "/tmp/model-select-test", ui: emptyUi.ui },
    );
    expect(emptyUi.statuses).toEqual([]);

    expect(() =>
      onSelect?.(
        {
          type: "model_select",
          model: { provider: "openai", id: "gpt" },
          source: "set",
        },
        { cwd: "/tmp/model-select-test" },
      ),
    ).not.toThrow();
  });
});
