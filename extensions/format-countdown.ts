export function formatCountdown(
  resetAt: string | undefined,
  now: Date = new Date(),
): string {
  if (!resetAt) {
    return "—";
  }
  const resetMs = Date.parse(resetAt);
  if (Number.isNaN(resetMs)) {
    return "—";
  }
  const secs = Math.floor((resetMs - now.getTime()) / 1000);
  if (secs <= 0) {
    return "now";
  }
  const days = Math.floor(secs / 86_400);
  const hours = Math.floor((secs % 86_400) / 3_600);
  const mins = Math.floor((secs % 3_600) / 60);
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  return `${hours}h ${String(mins).padStart(2, "0")}m`;
}
