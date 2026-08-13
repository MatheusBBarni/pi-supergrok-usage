# Requirements Document — #5 package docs

## Feature objective

Make the extension installable and safe to read as a public package. Layout already exists; this slice is README + confirm gitignore.

## Expected behavior

README gains:

- **Usage**
  - After an xAI call, footer: `xAI {remaining}/{limit} RPM`
  - Clears when the active model is not xAI
  - `/xai-usage` shows the last cached window (empty until a Grok call in this process)
- **Limitations** (must match #2)
  - Data is an xAI **request rate window** from `x-ratelimit-*-requests`
  - Not SuperGrok weekly quota; no %; no reset date
  - Token-window headers are not shown
  - Cache is in-memory (lost on restart / `/new`)
- **Safety**
  - Auth-like header names redacted in `.pi/supergrok-usage-headers.jsonl`
  - Live dump is gitignored; do not commit it
  - No credentials in the repo
- Keep Install, Why, Approach, Non-goals (Cursor scrape / fabricated quota / replacing Pi session footer), License
- Status: shipped probe + footer + `/xai-usage`; unpublished `0.0.0`

`.gitignore` already has `.pi/`, `.env`, `*.log`. No code changes unless a hole is found.

## Identified edge cases

- Do not publish to npm.
- Do not invent weekly numbers in the docs.

## Stack / UI

Markdown only.

## Constraints

- No new features. MIT already present.
