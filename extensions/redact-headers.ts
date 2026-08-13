const DENYLIST = /authorization|cookie|set-cookie|api[-_]?key|token|secret|bearer|password|auth/i;

export function redactHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    result[name] = DENYLIST.test(name) ? "<redacted>" : value;
  }
  return result;
}
