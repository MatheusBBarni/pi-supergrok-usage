# Requirements Document — project scaffold

## Feature objective

Turn this empty repo into an **installable, unpublished Pi package** (`0.0.0`) with a **silent** extension stub and a **Vitest** harness, so later issues (#1–#5) have a place to land. No probe, footer, or `/usage-limit` in this slice.

## Expected behavior

- `package.json` name is **`pi-supergrok-usage`** (confirmed free on npm).
- Version **`0.0.0`**. `"type": "module"`. MIT. Author **Matheus B. Barni**. repo/homepage/bugs point at `https://github.com/MatheusBBarni/pi-supergrok-usage`.
- Keywords: `pi-package`, `pi-extension`, `pi-coding-agent`, `xai`, `grok`, `supergrok`.
- `publishConfig.access`: `public`. Do **not** publish.
- `"pi": { "extensions": ["./extensions/index.ts"] }` — **file**, not directory.
- `files`: `extensions/`, `README.md`, `LICENSE` only.
- `extensions/index.ts` default-exports `function (pi: ExtensionAPI) { }` — no `on`, no tools, no commands, no `setStatus`.
- `peerDependencies`: `@earendil-works/pi-coding-agent: "*"`, **optional**.
- `devDependencies`: same package **pinned to `0.84.1`**, plus `typescript`, `vitest`, `@types/node`.
- Scripts: `"test": "vitest run"`, `"typecheck": "tsc --noEmit"` only.
- Ship **`.ts`**. `tsconfig`: `strict`, `noEmit`, `NodeNext`, `ES2022`, include `extensions/` + `test/`.
- npm + committed `package-lock.json`.
- One smoke test in **`test/`**: default export is a function; calling it with a fake `pi` registers nothing.
- README: keep why / approach / non-goals; replace “no extension code” with **scaffold / not shipped**; add install one-liners (`pi install git:github.com/MatheusBBarni/pi-supergrok-usage`, future `pi install npm:pi-supergrok-usage`, local `pi install .` / `pi -e .`). Full usage / limitations / redaction stay on **#5**.

## Identified edge cases

- Extra files under `extensions/` must **not** auto-load (explicit entry).
- Tests must **not** be in the Pi load path or the npm tarball.
- `npm install` of this package must not fail if Pi is not in that folder’s `node_modules`.
- Factory must stay silent so it does not steal #3’s footer.

## Stack

TypeScript, Node ESM, Vitest, npm, Pi extension API (`@earendil-works/pi-coding-agent@0.84.1` for types).

## UI/UX

None. Silent load.

## Constraints / dependencies

- No `dist/`, no `pi -p` smoke script, no probe logging, no footer, no command.
- Do not close or implement issues #1–#5.
- Work **in this repo** (not a throwaway probe file).
- `.gitignore` already has `node_modules/`, `.env`, `.pi/`, `*.log`. Keep those; add typical TS/Vitest noise if needed (`coverage/`).
