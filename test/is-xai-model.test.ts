import { describe, expect, it } from "vitest";
import { isXaiModel } from "../extensions/is-xai-model.js";

describe("isXaiModel", () => {
  it("is true only when model.provider is xai", () => {
    expect(isXaiModel({ provider: "xai", id: "grok-4" })).toBe(true);
    expect(isXaiModel({ provider: "anthropic", id: "claude" })).toBe(false);
    expect(isXaiModel(undefined)).toBe(false);
    expect(isXaiModel({ provider: "XAI", id: "grok-4" })).toBe(false);
  });
});
