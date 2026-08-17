import { describe, expect, it } from "vitest";
import { formatCountdown } from "../extensions/format-countdown.js";

const now = new Date("2026-05-23T12:00:00.000Z");

describe("formatCountdown", () => {
  it("renders missing, past, hour, and day buckets", () => {
    expect(formatCountdown(undefined, now)).toBe("—");
    expect(formatCountdown("2026-05-23T11:00:00.000Z", now)).toBe("now");
    expect(formatCountdown("2026-05-23T12:00:00.000Z", now)).toBe("now");
    expect(formatCountdown("2026-05-23T13:05:00.000Z", now)).toBe("1h 05m");
    expect(formatCountdown("2026-05-24T11:59:00.000Z", now)).toBe("23h 59m");
    expect(formatCountdown("2026-05-24T13:30:00.000Z", now)).toBe("1d 1h");
    expect(formatCountdown("2026-05-27T13:45:00.000Z", now)).toBe("4d 1h");
  });
});
