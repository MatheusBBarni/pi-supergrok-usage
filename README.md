# pi-supergrok-usage

Pi coding-agent extension that surfaces **xAI / SuperGrok usage limits** in the TUI (footer status and optional `/usage-limit` panel).

## Why

Pi already shows session tokens, cost, and context fill. It does **not** show SuperGrok-style weekly quota (e.g. “93% · resets Aug 17”). This extension aims to close that gap when the data is available from xAI response headers or a public usage API.

## Status

**Planning.** No extension code yet. See [Issues](../../issues) for the build plan.

## Approach

1. **Probe** — log xAI `after_provider_response` headers after one Grok call
2. **Decide** — weekly % + reset, RPM/TPM only, or nothing useful
3. **Ship** — footer status, optional command/panel, cache last known value

## Prerequisites (when built)

- [Pi](https://github.com/badlogic/pi-mono) coding agent
- xAI auth via `/login xai` (SuperGrok / X Premium) or `XAI_API_KEY`

## Non-goals

- Scraping Cursor private backends
- Inventing quota numbers from local token counts
- Replacing Pi’s built-in session cost / context footer

## License

MIT
