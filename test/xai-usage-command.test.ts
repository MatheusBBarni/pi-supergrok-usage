import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";
import { createExtension } from "../extensions/index.js";

function createFakePi() {
  const handlers = new Map<string, Function>();
  const commands = new Map<string, { description?: string; handler: Function }>();
  const pi = {
    on(event: string, handler: Function) {
      handlers.set(event, handler);
    },
    registerCommand(
      name: string,
      spec: { description?: string; handler: Function },
    ) {
      commands.set(name, spec);
    },
  };
  return { pi, handlers, commands };
}

describe("/xai-usage command", () => {
  it("notifies empty copy, then cached window, and ignores missing notify", async () => {
    const factory = createExtension({
      fetchBilling: async () => {
        throw new Error("no fetch in test");
      },
    });
    const { pi, handlers, commands } = createFakePi();
    factory(pi as ExtensionAPI);

    const command = commands.get("xai-usage");
    expect(command).toBeDefined();
    expect(typeof command?.handler).toBe("function");

    const notes: Array<{ message: string; level?: string }> = [];
    await command?.handler("", {
      ui: {
        notify(message: string, level?: string) {
          notes.push({ message, level });
        },
      },
    });
    expect(notes).toEqual([
      {
        message:
          "No SuperGrok usage yet. Run /login xai (subscription) or send a Grok message.",
        level: "info",
      },
    ]);

    await handlers.get("after_provider_response")?.(
      {
        type: "after_provider_response",
        status: 200,
        headers: {
          "x-ratelimit-remaining-requests": "7",
          "x-ratelimit-limit-requests": "10",
        },
      },
      {
        cwd: "/tmp/xai-usage-test",
        model: { provider: "xai", id: "grok-4" },
        ui: { setStatus() {} },
      },
    );

    notes.length = 0;
    await command?.handler("", {
      ui: {
        notify(message: string, level?: string) {
          notes.push({ message, level });
        },
      },
    });
    expect(notes).toHaveLength(1);
    expect(notes[0]?.level).toBe("info");
    expect(notes[0]?.message).toContain("xAI 7/10 RPM · headers ·");
    expect(notes[0]?.message).toContain(
      "Request rate window. SuperGrok weekly needs /login xai (subscription).",
    );

    await expect(
      command?.handler("", { cwd: "/tmp/xai-usage-test" }),
    ).resolves.toBeUndefined();
  });
});
