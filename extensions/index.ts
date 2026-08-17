import {
  type ExtensionAPI,
  type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { fetchBillingSnapshot } from "./fetch-billing.js";
import { formatFooterStatus } from "./format-footer-status.js";
import { formatUsageNotify } from "./format-usage-notify.js";
import { isXaiModel } from "./is-xai-model.js";
import { parseRequestWindow } from "./parse-request-window.js";
import {
  buildObservation,
  type UsageObservation,
} from "./usage-observation.js";
import type { SuperGrokSnapshot } from "./to-snapshot.js";

const BILLING_TTL_MS = 5 * 60 * 1000;

export type FetchBilling = () => Promise<SuperGrokSnapshot>;

const STATUS_KEY = "supergrok-usage";

function setFooterStatus(
  ctx:
    | Pick<ExtensionContext, "ui">
    | { ui?: { setStatus?: (key: string, value: string | undefined) => void } },
  value: string | undefined,
): void {
  try {
    ctx.ui?.setStatus?.(STATUS_KEY, value);
  } catch {
    // Print/JSON modes may have no status surface.
  }
}

export function createExtension(options?: {
  fetchBilling?: FetchBilling;
}) {
  const fetchBilling = options?.fetchBilling ?? fetchBillingSnapshot;

  return function (pi: ExtensionAPI): void {
    let rpm: UsageObservation | undefined;
    let billing: SuperGrokSnapshot | undefined;
    let billingAt = 0;
    let inflight: Promise<SuperGrokSnapshot | undefined> | undefined;

    function footerValue(): string | undefined {
      return formatFooterStatus({ billing, rpm });
    }

    function paint(
      ctx: Parameters<typeof setFooterStatus>[0],
      model?: { provider?: string; id?: string },
    ) {
      if (!isXaiModel(model)) {
        if (model) {
          setFooterStatus(ctx, undefined);
        }
        return;
      }
      setFooterStatus(ctx, footerValue());
    }

    async function refreshBilling(force: boolean): Promise<SuperGrokSnapshot | undefined> {
      if (!force && billing && Date.now() - billingAt < BILLING_TTL_MS) {
        return billing;
      }
      if (inflight) {
        return inflight;
      }
      inflight = (async () => {
        try {
          const snapshot = await fetchBilling();
          billing = snapshot;
          billingAt = Date.now();
          return snapshot;
        } catch {
          return billing;
        } finally {
          inflight = undefined;
        }
      })();
      return inflight;
    }

    pi.on("session_start", (_event, ctx) => {
      void refreshBilling(false).then(() => paint(ctx, ctx.model));
    });

    pi.on("after_provider_response", async (event, ctx) => {
      if (!isXaiModel(ctx.model)) {
        return;
      }

      const headers = event.headers ?? {};
      const window = parseRequestWindow(headers);
      if (window) {
        rpm = buildObservation({
          window,
          provider: ctx.model.provider,
          modelId: ctx.model.id,
        });
        paint(ctx, ctx.model);
      }
      void refreshBilling(false).then(() => {
        if (window || billing) {
          paint(ctx, ctx.model);
        }
      });
    });

    pi.on("model_select", (event, ctx) => {
      if (!isXaiModel(event.model)) {
        setFooterStatus(ctx, undefined);
        return;
      }
      if (!billing && !rpm) {
        return;
      }
      paint(ctx, event.model);
    });

    pi.registerCommand("xai-usage", {
      description: "Show SuperGrok weekly usage and the last xAI request window",
      handler: async (_args, ctx) => {
        try {
          await refreshBilling(true);
        } catch {
          // Notify uses whatever is cached.
        }
        try {
          ctx.ui.notify(formatUsageNotify(rpm, billing), "info");
        } catch {
          // Print/JSON modes may have no notify surface.
        }
      },
    });
  };
}

export default createExtension();
