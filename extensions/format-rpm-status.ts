import type { RequestWindow } from "./parse-request-window.js";

export function formatRpmStatus(window: RequestWindow): string {
  return `xAI ${window.remaining}/${window.limit} RPM`;
}
