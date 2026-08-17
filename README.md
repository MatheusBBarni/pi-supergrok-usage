# pi-supergrok-usage

Pi coding-agent extension that surfaces **SuperGrok weekly usage** and the latest **xAI request rate window** in the TUI footer and via `/xai-usage`.

## Why

Pi already shows session tokens, cost, and context fill. It does **not** show SuperGrok subscription quota. This extension fetches the same Grok billing payload that [ai-usagebar](https://github.com/akitaonrails/ai-usagebar) reads through Grok Build, then also shows the request window from `after_provider_response` headers when those fields exist.

## Status

**Shipped** (`0.1.0`): SuperGrok weekly %, footer status, `/xai-usage`, and header probe dump.

On session start (and after an xAI call) the extension `GET`s `https://cli-chat-proxy.grok.com/v1/billing?format=credits` with the SuperGrok OAuth token from `/login xai` or `~/.grok/auth.json`. The footer shows `SG {percent}% · {reset}` and appends `{remaining}/{limit} RPM` when a request window is cached. It clears when the active model is not xAI. `/xai-usage` refreshes billing and shows plan, percent, period, reset, prepaid balance, and the last RPM window.

xAI `after_provider_response` headers are appended to `.pi/supergrok-usage-headers.jsonl` (gitignored). Redacted samples: [`samples/grok-billing.json`](samples/grok-billing.json), [`samples/xai-after-provider-response.json`](samples/xai-after-provider-response.json).

## Install

Requires [Pi](https://github.com/badlogic/pi-mono) and SuperGrok auth via `/login xai` (**Use a subscription**) or `grok login`. An inference `XAI_API_KEY` is not enough for weekly quota.

```bash
# from git (current)
pi install git:github.com/MatheusBBarni/pi-supergrok-usage

# from npm (when published)
pi install npm:pi-supergrok-usage

# local checkout
pi install .
pi -e .
```

## Usage

- After load, or after an xAI / Grok response, the footer shows `SG {percent}% · {reset}` when billing succeeds.
- A cached request window is appended as `{remaining}/{limit} RPM`.
- The footer **clears** when the active model is not xAI. Switching back to xAI restores the last cached billing + RPM for this process.
- `/xai-usage` refreshes SuperGrok billing and notifies plan, weekly/monthly percent, reset countdown, prepaid balance, and the last RPM window.

## Limitations

- Weekly percent comes from Grok's billing endpoint, not from rate-limit headers.
- Token-window headers (`x-ratelimit-*-tokens`) are not shown.
- Billing cache is **in-memory** with a 5-minute TTL — lost on restart or `/new`. `/xai-usage` always refetches.
- OAuth refresh is left to Pi (`/login xai`) or Grok Build (`grok login`). A 401 means sign in again.
- Pi session tokens and cost stay in the built-in footer / `/session`.

## Safety

- The access token is read only to send `Authorization: Bearer` and is never written to dumps, footer text, or notify text.
- Auth-like response header names (`authorization`, `cookie`, `api-key`, `token`, …) are redacted to `<redacted>` in `.pi/supergrok-usage-headers.jsonl`.
- The live dump lives under `.pi/` and is gitignored. Do not commit it.
- No credentials are stored in this repo.

## Approach

1. **Probe** — log xAI `after_provider_response` headers after one Grok call
2. **Decide** — SuperGrok weekly % from Grok billing; RPM from headers
3. **Ship** — footer status, `/xai-usage`, cache last known values

Grok Build 1.0.4's ACP agent does **not** expose `x.ai/billing` (method not found). ai-usagebar calls that ACP method so it never touches tokens. This extension uses the same upstream Grok uses internally (`/v1/billing?format=credits`) with the OAuth token Pi or `grok login` already stored.

## Non-goals

- Scraping Cursor private backends
- Inventing quota numbers from local token counts
- Replacing Pi’s built-in session cost / context footer
- Implementing Grok OAuth refresh

## License

MIT
