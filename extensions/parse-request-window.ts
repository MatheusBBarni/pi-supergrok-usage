export type RequestWindow = {
  remaining: number;
  limit: number;
};

function parseIntHeader(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!/^-?\d+$/.test(value)) {
    return undefined;
  }
  return Number.parseInt(value, 10);
}

export function parseRequestWindow(
  headers: Record<string, string>,
): RequestWindow | undefined {
  const remaining = parseIntHeader(headers["x-ratelimit-remaining-requests"]);
  const limit = parseIntHeader(headers["x-ratelimit-limit-requests"]);
  if (remaining === undefined || limit === undefined) {
    return undefined;
  }
  return { remaining, limit };
}
