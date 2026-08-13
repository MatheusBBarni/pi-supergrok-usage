# TDD Plan — #4 `/xai-usage`

## Public interface

- `formatUsageNotify(observation | undefined)` → notify body string
- `createExtension` registers command `xai-usage`

## Seams

- Pure formatter
- Factory: fake `pi.registerCommand` + fake `ctx.ui.notify` + existing cache from a simulated xAI response

## Behaviors to test (in order)

1. **Tracer:** `formatUsageNotify(undefined)` is `No xAI rate window yet. Send a Grok message first.`
2. `formatUsageNotify(observation)` is the compact two-line copy (RPM · headers · ts + notes). No SuperGrok/`%`/reset.
3. Factory registers `xai-usage`. Handler notifies empty copy before any observation; after a complete xAI window, notifies the cached copy. Missing `notify` does not throw.

## Out of scope

- Custom TUI panel, disk cache, #5 limitations essay
