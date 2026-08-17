import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";
import { createExtension } from "../extensions/index.js";
import type { SuperGrokSnapshot } from "../extensions/to-snapshot.js";

function createFakePi() {
  const handlers = new Map<string, Function>();
  const commands = new Map<string, { handler: Function }>();
  const pi = {
    on(event: string, handler: Function) {
      handlers.set(event, handler);
    },
    registerCommand(name: string, spec: { handler: Function }) {
      commands.set(name, spec);
    },
  };
  return { pi, handlers, commands };
}

const snapshot: SuperGrokSnapshot = {
  plan: "SuperGrok",
  percent: 1,
  period: "weekly",
  resetAt: "2099-01-01T00:00:00.000Z",
  prepaidBalance: 0,
};

describe("SuperGrok billing in the extension", () => {
  it("paints SG percent on session start and includes it in /xai-usage", async () => {
    let fetched: Promise<SuperGrokSnapshot> | undefined;
    const factory = createExtension({
      writeDump: async () => {},
      fetchBilling: () => {
        fetched = Promise.resolve(snapshot);
        return fetched;
      },
    });
    const { pi, handlers, commands } = createFakePi();
    factory(pi as unknown as ExtensionAPI);

    const statuses: Array<{ key: string; value: string | undefined }> = [];
    const ctx = {
      cwd: "/tmp/billing-test",
      model: { provider: "xai", id: "grok-4" },
      ui: {
        setStatus(key: string, value: string | undefined) {
          statuses.push({ key, value });
        },
        notify() {},
      },
    };

    handlers.get("session_start")?.({ type: "session_start" }, ctx);
    expect(fetched).toBeDefined();
    await fetched;
    await Promise.resolve();
    await Promise.resolve();
    expect(statuses.at(-1)?.value).toMatch(/^SG 1% · /);

    const notes: string[] = [];
    await commands.get("xai-usage")?.handler("", {
      ui: {
        notify(message: string) {
          notes.push(message);
        },
      },
    });
    expect(notes[0]).toContain("SuperGrok 1% weekly");
    expect(notes[0]).toContain("prepaid $0.00");
  });
});
