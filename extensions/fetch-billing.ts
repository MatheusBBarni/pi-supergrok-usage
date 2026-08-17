import { readXaiOauthToken } from "./read-oauth-token.js";
import { toSnapshot, type SuperGrokSnapshot } from "./to-snapshot.js";

export const BILLING_URL =
  "https://cli-chat-proxy.grok.com/v1/billing?format=credits";

export class BillingError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "BillingError";
    this.status = status;
  }
}

export async function fetchBillingSnapshot(options?: {
  token?: string;
  getToken?: () => string | undefined;
  fetchImpl?: typeof fetch;
  url?: string;
}): Promise<SuperGrokSnapshot> {
  const token = (options?.token ?? options?.getToken?.() ?? readXaiOauthToken())?.trim();
  if (!token) {
    throw new BillingError(
      "No SuperGrok OAuth token. Run /login xai (subscription) or `grok login`.",
    );
  }

  const fetchImpl = options?.fetchImpl ?? fetch;
  const url = options?.url ?? BILLING_URL;
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "x-grok-client-mode": "cli",
        "x-grok-client-version": "1.0.4",
      },
    });
  } catch {
    throw new BillingError("Grok billing request failed");
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new BillingError(
        `Grok billing HTTP ${response.status}. Run /login xai with a subscription.`,
        response.status,
      );
    }
    throw new BillingError(`Grok billing HTTP ${response.status}`, response.status);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new BillingError("Grok billing response is not JSON");
  }

  try {
    return toSnapshot(body);
  } catch (error) {
    throw new BillingError(
      error instanceof Error
        ? error.message
        : "Grok billing response does not match the expected schema",
    );
  }
}
