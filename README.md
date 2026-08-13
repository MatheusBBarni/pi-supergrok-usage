# pi-supergrok-usage

Pi coding-agent extension that surfaces the latest **xAI request rate window** in the TUI footer and via `/xai-usage`.

## Why

Pi already shows session tokens, cost, and context fill. It does **not** show xAI provider quota. This extension reads `after_provider_response` headers after a Grok call and shows the request window when those fields exist.

## Status

**Shipped** (unpublished `0.0.0`): probe dump, footer status, and `/xai-usage`.

xAI `after_provider_response` headers are appended to `.pi/supergrok-usage-headers.jsonl` (gitignored). After an xAI call the footer shows `xAI {remaining}/{limit} RPM` and clears when the active model is not xAI. `/xai-usage` shows the last cached RPM window. Redacted sample: [`samples/xai-after-provider-response.json`](samples/xai-after-provider-response.json).

## Install

Requires [Pi](https://github.com/badlogic/pi-mono) and xAI auth via `/login xai` (SuperGrok / X Premium) or `XAI_API_KEY`.

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

- After an xAI / Grok response that includes both `x-ratelimit-remaining-requests` and `x-ratelimit-limit-requests`, the footer shows `xAI {remaining}/{limit} RPM`.
- The footer **clears** when the active model is not xAI. Switching back to xAI restores the last cached window for this process.
- `/xai-usage` notifies the last cached window (`remaining/limit`, `source=headers`, timestamp) plus a short note. If nothing is cached yet: `No xAI rate window yet. Send a Grok message first.`

## Limitations

This is an xAI **request rate window** from `x-ratelimit-*-requests`, not SuperGrok weekly quota.

- No weekly percent
- No reset date
- Token-window headers (`x-ratelimit-*-tokens`) are not shown
- Cache is **in-memory** — lost on restart or `/new`
- Pi session tokens and cost stay in the built-in footer / `/session`

## Safety

- Auth-like response header names (`authorization`, `cookie`, `api-key`, `token`, …) are redacted to `<redacted>` in `.pi/supergrok-usage-headers.jsonl`.
- The live dump lives under `.pi/` and is gitignored. Do not commit it.
- No credentials are stored in this repo.

## Approach

1. **Probe** — log xAI `after_provider_response` headers after one Grok call
2. **Decide** — weekly % + reset, RPM/TPM only, or nothing useful
3. **Ship** — footer status, `/xai-usage`, cache last known value

## Non-goals

- Scraping Cursor private backends
- Inventing quota numbers from local token counts
- Replacing Pi’s built-in session cost / context footer

## License

MIT
