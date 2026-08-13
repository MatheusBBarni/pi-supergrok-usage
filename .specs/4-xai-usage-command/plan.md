# Requirements Document — #4 `/xai-usage`

## Feature objective

Add a read-only slash command that shows the **last cached xAI request rate window**. Not a weekly SuperGrok panel.

## Expected behavior

- `pi.registerCommand("xai-usage", { description, handler })`.
- Handler reads the **same in-memory cache** as the footer (`UsageObservation`). No network. No JSONL parse.
- If cache exists, `ctx.ui.notify(..., "info")` with:
  - `xAI {remaining}/{limit} RPM · headers · {ts}`
  - `Request rate window, not SuperGrok weekly. Session tokens/cost stay in the built-in footer.`
- If cache is empty: `No xAI rate window yet. Send a Grok message first.`
- Missing `notify`: no throw.
- README: one line that `/xai-usage` shows the last cached RPM window.

## Identified edge cases

- New session / reload: empty cache (same as footer).
- Non-TUI / no UI: swallow notify errors.
- Never show SuperGrok weekly %, reset, or TPM.

## Stack

Existing `createExtension` cache + `registerCommand`. Pure formatter for the notify body.

## UI/UX

Notify only. No `custom()` panel, no widget.

## Constraints

- Data source = headers / memory (#2, #3).
- Do not implement #5 beyond the one README line.
