import { describe, expect, it } from "vitest";
import { BILLING_URL, fetchBillingSnapshot } from "../extensions/fetch-billing.js";

const weeklyBody = {
  config: {
    creditUsagePercent: 1,
    currentPeriod: {
      type: "USAGE_PERIOD_TYPE_WEEKLY",
      end: "2026-08-24T17:33:48.278812+00:00",
    },
    prepaidBalance: { val: 0 },
  },
};

describe("fetchBillingSnapshot", () => {
  it("GETs the Grok credits endpoint and maps the snapshot", async () => {
    const calls: Array<{ url: string; headers: Record<string, string> }> = [];
    const snapshot = await fetchBillingSnapshot({
      token: "secret-token",
      fetchImpl: async (url, init) => {
        const headers = new Headers(init?.headers);
        calls.push({
          url: String(url),
          headers: {
            authorization: headers.get("authorization") ?? "",
            accept: headers.get("accept") ?? "",
            mode: headers.get("x-grok-client-mode") ?? "",
          },
        });
        return new Response(JSON.stringify(weeklyBody), { status: 200 });
      },
    });

    expect(calls).toEqual([
      {
        url: BILLING_URL,
        headers: {
          authorization: "Bearer secret-token",
          accept: "application/json",
          mode: "cli",
        },
      },
    ]);
    expect(snapshot).toMatchObject({
      percent: 1,
      period: "weekly",
      prepaidBalance: 0,
    });
  });

  it("does not echo tokens on HTTP or missing-auth errors", async () => {
    await expect(fetchBillingSnapshot({ token: "" })).rejects.toThrow(
      /\/login xai|grok login/i,
    );

    await expect(
      fetchBillingSnapshot({
        token: "secret-token",
        fetchImpl: async () =>
          new Response("token=secret-token person@example.test", { status: 401 }),
      }),
    ).rejects.toThrow(/HTTP 401/);

    try {
      await fetchBillingSnapshot({
        token: "secret-token",
        fetchImpl: async () =>
          new Response("token=secret-token", { status: 401 }),
      });
    } catch (error) {
      expect(String(error)).not.toContain("secret-token");
    }
  });
});
