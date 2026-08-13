import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  CONFIG_DIR_NAME,
  type ExtensionAPI,
  type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { buildDump, type HeaderDump } from "./build-dump.js";
import { formatRpmStatus } from "./format-rpm-status.js";
import { formatUsageNotify } from "./format-usage-notify.js";
import { isXaiModel } from "./is-xai-model.js";
import { parseRequestWindow } from "./parse-request-window.js";
import {
  buildObservation,
  type UsageObservation,
} from "./usage-observation.js";

const DUMP_FILE = "supergrok-usage-headers.jsonl";

export type WriteDump = (
  record: HeaderDump,
  ctx: Pick<ExtensionContext, "cwd">,
) => Promise<void> | void;

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
  ctx: Pick<ExtensionContext, "ui"> | { ui?: { setStatus?: (key: string, value: string | undefined) => void } },
  value: string | undefined,
): void {
  try {
    ctx.ui?.setStatus?.(STATUS_KEY, value);
  } catch {
    // Print/JSON modes may have no status surface.
  }
}

export function createExtension(options?: { writeDump?: WriteDump }) {
  const writeDump = options?.writeDump ?? defaultWriteDump;

  return function (pi: ExtensionAPI): void {
    let cache: UsageObservation | undefined;

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
      if (!window) {
        return;
      }

      cache = buildObservation({
        window,
        provider: ctx.model.provider,
        modelId: ctx.model.id,
      });
      setFooterStatus(ctx, formatRpmStatus(cache));
    });

    pi.on("model_select", (event, ctx) => {
      if (!isXaiModel(event.model)) {
        setFooterStatus(ctx, undefined);
        return;
      }
      if (!cache) {
        return;
      }
      setFooterStatus(ctx, formatRpmStatus(cache));
    });

    pi.registerCommand("xai-usage", {
      description: "Show the last cached xAI request rate window",
      handler: async (_args, ctx) => {
        try {
          ctx.ui.notify(formatUsageNotify(cache), "info");
        } catch {
          // Print/JSON modes may have no notify surface.
        }
      },
    });
  };
}

export default createExtension();
