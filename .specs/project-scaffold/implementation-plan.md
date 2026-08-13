# TDD Plan — project scaffold

## Public interface

- `extensions/index.ts` — `export default function (pi: ExtensionAPI): void`
- `package.json` `"pi.extensions": ["./extensions/index.ts"]` — Pi’s load seam (not unit-tested)

## Seams to test

- **Factory call** — fake `pi` with `on` / `registerTool` / `registerCommand` / `registerShortcut` / `registerFlag`. Assert none fire. No Pi process.

## Behaviors to test (in order)

1. **Tracer:** default export is a function; calling it with a fake `pi` registers nothing (no events, tools, commands, shortcuts, flags).

## Out of scope for this cycle

- Probe headers (#1), data-source decision (#2), footer (#3), `/usage-limit` (#4), full install/safety docs (#5)
- Booting `pi`, `setStatus`, notify, file I/O
- Asserting every `package.json` field in tests (those land in GREEN to satisfy the spec)

GREEN for slice 1 also adds the approved package files (`package.json`, lockfile, `tsconfig`, Vitest, README install stub, `.gitignore` `coverage/`) so the spec is met, not just the test.
