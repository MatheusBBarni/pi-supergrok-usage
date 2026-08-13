# TDD Plan — #1 probe headers

## Public interface

- `redactHeaders(headers)` — `extensions/redact-headers.ts`
- `isXaiModel(model)` — `extensions/is-xai-model.ts`
- `buildDump({ status, headers, model, now? })` — `extensions/build-dump.ts`
- `export default function (pi)` — `extensions/index.ts` (registers the hook, writes JSONL)

## Seams

- Pure helpers (no fs, no Pi)
- Factory: fake `pi` + fake `ctx` + **injected writer** (or mocked `fs`) so tests never touch a real `.pi/`

## Behaviors to test (in order)

1. **Tracer:** `redactHeaders` keeps quota headers, replaces denylisted names (case-insensitive) with `"<redacted>"`, does not mutate the input.
2. `isXaiModel` is true only when `model.provider === "xai"` (false for missing model, other providers).
3. `buildDump` returns `{ ts, status, headers, provider, modelId }` with redacted headers and ISO-8601 `ts`.
4. Factory registers **only** `after_provider_response`. Handler writes one JSONL line for xAI; writes nothing when model is missing or not xAI; write errors are swallowed.

## Out of scope

- Footer, command, notify, classification (`weekly` / `ratelimit`)
- Live Grok call and `samples/` (after all slices are GREEN, not a unit test)
- Issues #2–#5
