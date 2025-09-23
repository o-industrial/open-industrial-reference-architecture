# Agents Guide - Atomic Molecules

Composable clusters of atoms that encapsulate small units of behavior (forms, cards, status displays). Molecules add light state or wiring while remaining reusable.

## Scope
- Combine atoms into richer UI elements with minimal local state.
- Provide context-specific behavior such as validation, formatting, or data previews.
- Avoid direct network access or business workflows; escalate to organisms when needed.

## Project Map
- Directory slices (`eac`, `azure`, `flows`, `marketing`, etc.) group molecules by domain; keep naming consistent with downstream runtimes.
- `.exports.ts` - Append exports as new molecules are added; prefer grouped exports per domain.
- Representative files: `license-card/`, `simulators/`, `warm-query/`, etc. Review existing patterns before introducing a new category.

## Commands
- `deno task test --filter molecules` - Execute targeted unit or integration tests for molecules.
- `deno task check` - Verify types and lint when adjusting props or domain-specific logic.

## Patterns
- Compose atoms through props; keep styling override hooks minimal and well-documented.
- Guard optional dependencies (e.g., Azure SDK types) behind lazy imports or dependency injection.
- Prefer hooks from `atomic/utils` for formatting, colors, and route helpers to avoid drift.
- When molecules expose callbacks, type them explicitly and document expected side effects.

## Review & Test Checklist
- Include unit tests for domain logic (e.g., form validators, derived metrics).
- Validate story/demo coverage for new molecules to assist design reviews.
- Ensure molecules remain tree-shakeable: verify exports are referenced from `.exports.ts` only once.

## Safety & Guardrails
- Avoid importing from organisms/templates to prevent circular dependencies.
- Do not embed service credentials or runtime-only environment variables.
- Keep third-party packages scoped to `.deps.ts`; discuss additions with maintainers before merging.

## Ownership Signals
- **Primary owner:** Atomic Maintainers - Component Guild.
- **Point of contact:** Domain maintainers in #open-industrial-design-system.
- **Escalation:** Design System Guild Lead (Diego Ramirez).

## Dependencies & Integrations
- May rely on shared hooks in `atomic/utils/hooks/*` for shared state handling.
- Consumed by web runtime features such as admin dashboards, licensing flows, and simulators.
- Coordinate schema or DTO changes with API/runtime teams to prevent mismatches.

## Related Docs
- Parent guide: [Atomic Library](../Agents.md).
- Related layers: [Atoms](../atoms/Agents.md), [Organisms](../organisms/Agents.md), [Templates](../templates/Agents.md), [Utils](../utils/Agents.md).

## Changelog Expectations
- Update this guide when introducing new domain directories or changing domain ownership.
- Capture notable dependency introductions (e.g., new Azure SDK usage) for audit purposes.
