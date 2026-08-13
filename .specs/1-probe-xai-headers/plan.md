# Requirements Document — #1 probe headers

## Feature objective

Prove whether SuperGrok / xAI exposes usable quota data on normal chat requests by logging **redacted** `after_provider_response` headers for **xAI only**. No footer, no command, no classification.

## Expected behavior

- Factory registers **only** `pi.on("after_provider_response", …)`.
- Write **only** when `ctx.model?.provider === "xai"`. Missing model or any other provider → no write.
- Path: `{ctx.cwd}/{CONFIG_DIR_NAME}/supergrok-usage-headers.jsonl` (project `.pi/…`, gitignored).
- Each line: `{ ts, status, headers, provider, modelId }`
  - `ts`: ISO-8601 UTC
  - `headers`: copy of `event.headers` after redact
  - `provider`: `ctx.model.provider` (`"xai"`)
  - `modelId`: `ctx.model.id`
- Redact: if header **name** matches `/authorization|cookie|set-cookie|api[-_]?key|token|secret|bearer|password|auth/i`, keep the key, set value to `"<redacted>"`.
- `mkdir` recursive, append one JSON line. On write error: swallow (no throw, no notify).
- Modules (import-only; manifest stays `./extensions/index.ts`):
  - `extensions/redact-headers.ts`
  - `extensions/is-xai-model.ts`
  - `extensions/build-dump.ts`
  - `extensions/index.ts` — register hook + write
- After GREEN: one small Grok call through this extension; check in a redacted sample at `samples/xai-after-provider-response.json`; close #1 with conclusion (weekly % / RPM-TPM / nothing).

## Identified edge cases

- Non-xAI provider: no file, no throw.
- `ctx.model` undefined: no write.
- Empty / missing headers: still write `{ headers: {} }` (absence is valid).
- Header names treated case-insensitively for the denylist.
- `.pi/` missing: create it.
- Write failure: swallow.
- Live dump stays gitignored; only the redacted sample is committed.

## Stack

Existing package: TypeScript, Vitest, `@earendil-works/pi-coding-agent` (`CONFIG_DIR_NAME`, `ExtensionAPI`, `after_provider_response`). Node `fs` at the write edge only.

## UI/UX

None.

## Constraints

- No footer, command, notify, Cursor scraping, npm publish.
- Do not implement #2–#5.
- Existing “registers nothing” test **must change**: factory now registers exactly one hook.
- Sample must contain no secrets.
