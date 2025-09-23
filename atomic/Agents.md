# Agents Guide - Atomic Library

Central catalog of design-system building blocks shared across Open Industrial runtimes. This guide explains how the atomic layers work together and how to extend them safely.

## Scope
- Owns atomic layers (`atoms`, `molecules`, `organisms`, `templates`, `utils`) exported for downstream runtimes.
- Maintains `.exports.ts` and `.deps.ts` manifests for controlled publishing through `@o-industrial/*` entry points.
- Provides patterns for composition, styling tokens, and data plumbing that other apps follow.
- Excludes application-specific state or logic; those belong in the consuming runtime.

## Project Map
- `atoms/` - Low-level UI primitives. See [atoms guide](atoms/Agents.md).
- `molecules/` - Composed primitives with light state. See [molecules guide](molecules/Agents.md).
- `organisms/` - Stateful, data-aware components. See [organisms guide](organisms/Agents.md).
- `templates/` - Page-shell layouts, routing scaffolds. See [templates guide](templates/Agents.md).
- `utils/` - Shared hooks, helpers, and theme utilities. See [utils guide](utils/Agents.md).
- `.exports.ts` - Curated export barrel; keep stable ordering and avoid breaking changes.
- `.deps.ts` - Central dependency surface; pin shared versions for components and tests.

## Commands
- `deno task check` - Runs formatting, linting, and type checks for the entire repo.
- `deno task test --filter atomic` - Recommended scoped test run while iterating on atomic layers.
- `deno task build` - Full validation before publishing changes that affect downstream runtimes.

## Patterns
- Follow atomic design layering: atoms stay presentation-only; stateful logic belongs in organisms/templates.
- Prefer composable props over hard-coded styling; rely on tailwind tokens and `neonColors` utilities in `utils/`.
- Expose new exports through `.exports.ts` and update documentation links immediately.
- Keep components Preact-friendly; avoid React-only APIs and DOM assumptions that break SSR.

## Review & Test Checklist
- New components include usage examples or stories where applicable.
- All affected `deno task test` suites pass locally (add targeted tests when introducing logic).
- Downstream runtime smoke tests run if exports change (at minimum, build the web runtime).
- Breaking changes are version-gated or documented with migration notes.

## Safety & Guardrails
- Do not introduce runtime-specific dependencies (Azure SDK, licensing clients) into atomic layers.
- Keep bundle footprint lean; confirm tree-shaking works when adding new third-party utilities.
- Respect licensing headers and avoid copying proprietary assets into this library.

## Ownership Signals
- **Primary owner:** Atomic Maintainers - Component Guild.
- **Point of contact:** #open-industrial-design-system Slack channel.
- **Escalation:** Design System Guild Lead (Diego Ramirez).

## Dependencies & Integrations
- Consumed by `open-industrial-web-runtime` and other runtimes through `@o-industrial/common/*` aliases.
- Depends on shared styling tokens defined in `atomic/utils/neonColors.ts` and related helpers.
- Storybook demos (planned) and integration tests should reference these exports for parity.

## Related Docs
- Parent guide: [open-industrial-reference-architecture/Agents.md](../Agents.md).
- Sibling detail guides: [atoms](atoms/Agents.md), [molecules](molecules/Agents.md), [organisms](organisms/Agents.md), [templates](templates/Agents.md), [utils](utils/Agents.md).
- Cross-runtime usage: [open-industrial-web-runtime/AGENTS.md](../../open-industrial-web-runtime/AGENTS.md).

## Changelog Expectations
- Revisit this guide every minor release or when adding a new atomic layer.
- Log notable structural changes in the repo root changelog or PR notes to keep consumers informed.
