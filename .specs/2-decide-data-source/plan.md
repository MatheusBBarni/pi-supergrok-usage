# Requirements Document — #2 decide data source

## Feature objective

Choose the real data path for SuperGrok / xAI usage in this extension, based on the #1 probe.

## Decision

**Path 2 — RPM/TPM headers only.**

Passive `after_provider_response` sniffing on xAI responses. Label the data as a **rate window**, never as weekly SuperGrok quota.

| Tree branch | Result |
|---|---|
| 1. Weekly % + reset in headers | No |
| 2. Only RPM/TPM (or short-window) limits | **Yes** |
| 3. No useful headers | No |

## Evidence

One `grok-4.6` call (HTTP 200, OAuth `/login xai`). Sample: `samples/xai-after-provider-response.json`.

| Field | Present |
|---|---|
| `x-ratelimit-limit-requests` / `remaining-requests` | yes (`8300` / `8300`) |
| `x-ratelimit-limit-tokens` / `remaining-tokens` | yes (`53000000` / `53000000`) |
| `retry-after` / weekly % / reset date / subscription quota | **no** |

No public/stable xAI account-usage API was verified. Stretch API research is **out of scope** for #3/#4.

## What we will show

| State | Copy |
|---|---|
| After an xAI response with request-window headers | `xAI 8300/8300 RPM` (`remaining/limit` from `x-ratelimit-*-requests`) |
| Unknown, missing headers, or active model is not xAI | **clear** the status (no `SuperGrok ?`) |

Never:

- `SuperGrok`
- a percent (`93%`)
- an invented reset (`rst Aug 17`)
- weekly / subscription wording for this data

Tokens window (`x-ratelimit-*-tokens`) is **not** shown in the footer. Request remaining is the number people hit first.

## Follow-up issues

- **#3 Footer** — keep. Rewrite examples to the RPM window copy above. Data source = headers only.
- **#4 `/usage-limit`** — keep. Show last RPM remaining/limit, last observation timestamp, `source=headers`. No weekly %, no reset unless a header appears later.
- **#5 Package** — keep. Limitations section must say this is a request rate window, not SuperGrok weekly quota.

## Non-goals

- Scraping Cursor private APIs
- Inventing weekly % from local token totals
- Storing raw access tokens
- Calling an unverified usage API in #3/#4

## Stack / UI / constraints

Decision only. No production code in this slice.
