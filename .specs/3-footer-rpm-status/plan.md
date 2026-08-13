# Requirements Document — #3 footer status

## Feature objective

Show the latest known xAI **request rate window** in Pi’s footer via `ctx.ui.setStatus`. Not weekly SuperGrok.

## Expected behavior

- After an xAI `after_provider_response` that has **both** `x-ratelimit-remaining-requests` and `x-ratelimit-limit-requests`:
  - parse them as integers
  - store in **memory**: `{ remaining, limit, ts, provider, modelId, source: "headers" }`
  - `ctx.ui.setStatus("supergrok-usage", "xAI {remaining}/{limit} RPM")`
- Incomplete / missing request-window headers: **do not** change cache or status.
- Non-xAI `after_provider_response`: no cache write (probe already skips JSONL).
- `model_select`:
  - not xAI → `setStatus("supergrok-usage", undefined)`
  - xAI and cache exists → restore the same `xAI {remaining}/{limit} RPM` string
  - xAI and no cache → stay clear
- Session start: stay clear until the first complete xAI observation (memory cache).
- Keep the #1 JSONL dump on the same hook (best-effort, swallow write errors).
- Status key: `"supergrok-usage"`.
- README: one line that the footer shows `xAI {remaining}/{limit} RPM` after an xAI call and clears when the model is not xAI. Install block unchanged.

## Identified edge cases

- Header values that are not integers: treat as incomplete (keep last good cache).
- `ctx.ui` / `setStatus` missing (print mode): no throw.
- Cache does not survive process restart or `/new` (new extension instance).
- Never show `SuperGrok`, `%`, reset, or TPM in the footer.
- No secrets in status text.

## Stack

Existing probe modules + `model_select` + `ctx.ui.setStatus`. Pure helpers for parse + format.

## UI/UX

Footer status only. No command, no notify, no panel.

## Constraints

- Data source = headers only (#2).
- Do not implement #4/#5 beyond the one README line.
- OAuth and API key share the same header path.
