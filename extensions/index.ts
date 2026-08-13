import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  CONFIG_DIR_NAME,
  type ExtensionAPI,
  type ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { buildDump, type HeaderDump } from "./build-dump.js";
import { isXaiModel } from "./is-xai-model.js";

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

export function createExtension(options?: { writeDump?: WriteDump }) {
  const writeDump = options?.writeDump ?? defaultWriteDump;

  return function (pi: ExtensionAPI): void {
    pi.on("after_provider_response", async (event, ctx) => {
      if (!isXaiModel(ctx.model)) {
        return;
      }

      const record = buildDump({
        status: event.status,
        headers: event.headers ?? {},
        model: { provider: ctx.model.provider, id: ctx.model.id },
      });

      try {
        await writeDump(record, ctx);
      } catch {
        // Probe is best-effort; never break the provider turn.
      }
    });
  };
}

export default createExtension();
