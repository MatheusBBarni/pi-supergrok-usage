import { redactHeaders } from "./redact-headers.js";

export type DumpModel = {
  provider: string;
  id: string;
};

export type HeaderDump = {
  ts: string;
  status: number;
  headers: Record<string, string>;
  provider: string;
  modelId: string;
};

export function buildDump(input: {
  status: number;
  headers: Record<string, string>;
  model: DumpModel;
  now?: Date;
}): HeaderDump {
  return {
    ts: (input.now ?? new Date()).toISOString(),
    status: input.status,
    headers: redactHeaders(input.headers),
    provider: input.model.provider,
    modelId: input.model.id,
  };
}
