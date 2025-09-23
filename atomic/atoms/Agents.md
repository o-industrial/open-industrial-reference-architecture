# Agents Guide - Atomic Atoms

Styling-agnostic UI primitives and inputs tailored for Open Industrial. Atoms must stay lightweight, composable, and framework-friendly.

## Scope
- Presentational components without side effects (buttons, inputs, icons, badges).
- Provide prop contracts consumed by molecules and organisms.
- House token helpers or enums that express visual variants for primitives.
- Exclude data fetching, routing, or runtime state management.

## Project Map
- `.exports.ts` - Barrel export for all atoms; keep alphabetical ordering.
- `Action.tsx` - Action button/link primitive.
- `AgreementCheckbox.tsx`, `Badge.tsx`, `LoadingSpinner.tsx`, etc. - Representative atoms; new atoms should follow similar structure.
- `forms/`, `marketing/` - Subdirectories for domain-specific primitives; evaluate reuse before adding new folders.

## Commands
- `deno task test --filter atoms` - Run focused tests or snapshots for atoms (add filter to match naming convention).
- `deno task check` - Ensure linting and type checks pass after modifying props or exports.

## Patterns
- Favor functional components with clear prop typing (`ComponentProps<"button">`, etc.).
- Use Tailwind utility class strings for styling; expose variant enums through props instead of hard-coded class names.
- Keep accessibility in mind: provide `aria-*` passthrough props, label associations, and keyboard interactions.
- Document new props in JSDoc atop the component to aid downstream IDE tooling.

## Review & Test Checklist
- Story or usage example updated/added when the component is new or behavior changes.
- Snapshot or rendering test covers visual variants; prefer Playwright visual tests when available.
- Breaking prop contract changes include migration notes and bump version tags where relevant.

## Safety & Guardrails
- Avoid importing from molecules/organisms; dependencies should be one-directional (atoms -> higher layers only).
- Do not attach global event listeners or timers; atoms must be side-effect free.
- Keep bundle size small: confirm any icon or asset imports are tree-shakeable.

## Ownership Signals
- **Primary owner:** Atomic Maintainers - Component Guild.
- **Point of contact:** #open-industrial-design-system Slack channel.
- **Escalation:** Design System Guild Lead (Diego Ramirez).

## Dependencies & Integrations
- Styling tokens come from `atomic/utils/neonColors.ts` and `getIntentStyles.ts`.
- Accessible to runtimes through `@o-industrial/common/atoms`; update alias mappings when adding new exports.

## Related Docs
- Parent: [Atomic Library guide](../Agents.md).
- Sibling layers: [Molecules](../molecules/Agents.md), [Organisms](../organisms/Agents.md), [Templates](../templates/Agents.md), [Utils](../utils/Agents.md).

## Changelog Expectations
- Review this guide whenever adding a new atom or introducing a significant variant.
- Note deprecated atoms and their replacements to guide consuming runtimes.
