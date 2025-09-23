# Agents Guide - open-industrial-reference-architecture

Shared UI components, fluent builders, packs, and runtime utilities for Open Industrial. Think of this repo as the design system plus SDK that other runtimes consume.

## Scope
- Maintain atomic components (`atomic/*`) including atoms, molecules, organisms, templates, and utils.
- Provide fluent APIs (`src/fluent/*`) and packs (`src/packs/*`) that orchestrate EaC workflows.
- Expose shared runtime helpers (`src/runtimes/*`) and supporting types/tests.
- Exclude runtime-specific pages or APIs (those live in the respective runtime repos).

## Project Map
- `atomic/` - Shared component library. See [atomic library guide](atomic/Agents.md).
- `src/fluent/` - Fluent builders for EaC pipelines; coordinate with runtime teams when making changes.
- `src/packs/` - Bundled feature packs; document usage in consuming runtimes.
- `src/runtimes/` - Helpers for impulse, synaptic, api, etc.
- `tests/` - Unit and integration tests; ensure new exports have coverage.

## Commands
- `deno task check` - Linting, formatting, and type checks (required pre-PR).
- `deno task test` - Runs repository tests, including atomic component coverage.
- `deno task build` - Full validation (fmt + lint + tests) prior to publishing releases.

## Patterns
- Keep components framework-agnostic and Preact-first (no React-only APIs).
- Export everything via `.exports.ts`; prefer additive changes and follow semver.
- Promote reusable utils/hooks up the stack rather than duplicating in runtimes.
- Document new APIs in corresponding Agents guides to keep consumers informed.

## Review & Test Checklist
- Update demos/stories when adding components or altering behavior.
- Ensure downstream runtimes (web, impulse, synaptic, api) compile after changes (run targeted builds as needed).
- Confirm type coverage and tests for new APIs; add integration tests when touching fluent builders.

## Safety & Guardrails
- No license header changes or proprietary dependency additions without approval.
- Avoid heavy or non-tree-shakeable dependencies; monitor bundle size impact.
- Keep `.deps.ts` versions aligned with consuming runtimes to prevent conflicts.

## Ownership Signals
- **Primary owner:** Atomic Maintainers - Component Guild.
- **Point of contact:** #open-industrial-design-system Slack channel.
- **Escalation:** Design System Guild Lead (Diego Ramirez).

## Dependencies & Integrations
- Consumed widely by `open-industrial-web-runtime` and other runtimes via `@o-industrial/common/*` aliases.
- Fluent builders integrate with EaC SDKs; coordinate changes with platform services.
- Tests rely on shared fixtures; update them when API contracts evolve.

## Related Docs
- [Atomic library guide](atomic/Agents.md) and layer-specific guides under `atomic/*`.
- Runtime consumers: [open-industrial-web-runtime/AGENTS.md](../open-industrial-web-runtime/AGENTS.md) and other runtime Agents guides.
- [Agents template](../Agents.template.md) for creating new sub-guides.

## Changelog Expectations
- Revisit this guide on each minor release or when adding/deprecating major capability areas.
- Record notable structural updates in release notes for downstream teams.
