import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export function defaultPiAuthPath(): string {
  return join(homedir(), ".pi", "agent", "auth.json");
}

export function defaultGrokAuthPath(): string {
  const grokHome = process.env.GROK_HOME;
  if (grokHome && grokHome.length > 0) {
    return join(grokHome, "auth.json");
  }
  return join(homedir(), ".grok", "auth.json");
}

export function readXaiOauthToken(options?: {
  piAuthPath?: string;
  grokAuthPath?: string;
  readFile?: (path: string) => string;
}): string | undefined {
  const readFile = options?.readFile ?? ((path) => readFileSync(path, "utf8"));
  const piToken = readPiOauth(options?.piAuthPath ?? defaultPiAuthPath(), readFile);
  if (piToken) {
    return piToken;
  }
  return readGrokOauth(options?.grokAuthPath ?? defaultGrokAuthPath(), readFile);
}

function readJson(path: string, readFile: (path: string) => string): unknown {
  try {
    return JSON.parse(readFile(path));
  } catch {
    return undefined;
  }
}

function readPiOauth(
  path: string,
  readFile: (path: string) => string,
): string | undefined {
  const parsed = readJson(path, readFile);
  if (!parsed || typeof parsed !== "object") {
    return undefined;
  }
  const xai = (parsed as { xai?: unknown }).xai;
  if (!xai || typeof xai !== "object") {
    return undefined;
  }
  const entry = xai as { type?: unknown; access?: unknown };
  if (entry.type !== "oauth" || typeof entry.access !== "string") {
    return undefined;
  }
  const access = entry.access.trim();
  return access.length > 0 ? access : undefined;
}

function readGrokOauth(
  path: string,
  readFile: (path: string) => string,
): string | undefined {
  const parsed = readJson(path, readFile);
  if (!parsed || typeof parsed !== "object") {
    return undefined;
  }
  for (const value of Object.values(parsed as Record<string, unknown>)) {
    if (!value || typeof value !== "object") {
      continue;
    }
    const key = (value as { key?: unknown }).key;
    if (typeof key === "string" && key.trim().length > 0) {
      return key.trim();
    }
  }
  return undefined;
}
