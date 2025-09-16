# Agents Guide — open-industrial-reference-architecture

Shared UI components, fluent builders, packs, and runtime utilities for Open Industrial. Treat this as the design‑system + SDK.

## Scope
- Maintain atomic components (atoms, molecules, organisms, templates, utils).
- Provide fluent APIs (`src/fluent/*`) and packs (`src/packs/*`).
- Expose shared runtime helpers (`src/runtimes/*`).

## Project Map
- `atomic/*`: UI component libraries exported via `.exports.ts`
- `src/*`: APIs, types, utils, fluent, packs, runtimes
- `tests/`: Library tests

## Commands
- Check: `deno task check`
- Test: `deno task test`
- Build (lint+fmt+publish check): `deno task build`

## Patterns
- Keep components framework-agnostic Preact-first (no React-only APIs).
- Avoid breaking exported APIs; adhere to semver and additive changes.
- Keep `.exports.ts` tidy and stable for consumers.

## PR Checklist
- Update stories/examples if adding components (when applicable).
- Ensure downstream runtimes compile with changes.
- Type checks and tests pass.

## Safety
- No license header changes.
- Avoid heavy dependencies; keep bundle size in mind.


