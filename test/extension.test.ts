import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { describe, expect, it } from "vitest";
import factory from "../extensions/index.js";

function createFakePi() {
  const calls = {
    on: [] as unknown[],
    registerTool: [] as unknown[],
    registerCommand: [] as unknown[],
    registerShortcut: [] as unknown[],
    registerFlag: [] as unknown[],
  };

  const pi = {
    on(...args: unknown[]) {
      calls.on.push(args);
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
  it("is a function that registers nothing when called", () => {
    expect(typeof factory).toBe("function");

    const { pi, calls } = createFakePi();
    factory(pi as ExtensionAPI);

    expect(calls.on).toEqual([]);
    expect(calls.registerTool).toEqual([]);
    expect(calls.registerCommand).toEqual([]);
    expect(calls.registerShortcut).toEqual([]);
    expect(calls.registerFlag).toEqual([]);
  });
});
