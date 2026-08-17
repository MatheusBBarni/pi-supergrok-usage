import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  CONFIG_DIR_NAME,
  type ExtensionAPI,
  type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { buildDump, type HeaderDump } from "./build-dump.js";
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

const DUMP_FILE = "supergrok-usage-headers.jsonl";
const BILLING_TTL_MS = 5 * 60 * 1000;

export type WriteDump = (
  record: HeaderDump,
  ctx: Pick<ExtensionContext, "cwd">,
) => Promise<void> | void;

export type FetchBilling = () => Promise<SuperGrokSnapshot>;

function defaultWriteDump(
  record: HeaderDump,
  ctx: Pick<ExtensionContext, "cwd">,
): void {
  const dir = join(ctx.cwd, CONFIG_DIR_NAME);
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, DUMP_FILE), `${JSON.stringify(record)}\n`, "utf8");
}

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
  writeDump?: WriteDump;
  fetchBilling?: FetchBilling;
}) {
  const writeDump = options?.writeDump ?? defaultWriteDump;
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
      const record = buildDump({
        status: event.status,
        headers,
        model: { provider: ctx.model.provider, id: ctx.model.id },
      });

      try {
        await writeDump(record, ctx);
      } catch {
        // Probe is best-effort; never break the provider turn.
      }

      const window = parseRequestWindow(headers);
      if (window) {
        rpm = buildObservation({
          window,
          provider: ctx.model.provider,
          modelId: ctx.model.id,
        });
      }

      if (window) {
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
