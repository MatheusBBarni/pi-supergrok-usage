# TDD Plan — #3 footer status

## Public interface

- `parseRequestWindow(headers)` → `{ remaining, limit } | undefined` — both ints or nothing
- `formatRpmStatus(window)` → `"xAI {remaining}/{limit} RPM"`
- `createExtension({ writeDump? })` — also registers `model_select`; updates/clears `setStatus`

## Seams

- Pure parse/format (no Pi, no fs)
- Factory: fake `pi` + fake `ctx.ui.setStatus` + injected writer

## Behaviors to test (in order)

1. **Tracer:** `parseRequestWindow` returns `{ remaining, limit }` only when both `x-ratelimit-remaining-requests` and `x-ratelimit-limit-requests` are integers; otherwise `undefined`.
2. `formatRpmStatus` returns `xAI {remaining}/{limit} RPM` (literal, no SuperGrok/`%`/reset).
3. Factory on xAI response with a complete window: caches and `setStatus("supergrok-usage", "xAI 7/10 RPM")`. Incomplete headers: no status change. Non-xAI: no status write.
4. `model_select` off xAI clears status; back to xAI restores the cached string; back to xAI with empty cache stays clear. Missing `setStatus` does not throw.

## Out of scope

- `/usage-limit` (#4), full limitations essay (#5)
- Disk cache, TPM, weekly copy
- Live Grok call (already proven in #1)
