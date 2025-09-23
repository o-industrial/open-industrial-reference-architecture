# Agents Guide - Atomic Templates

Layout-level building blocks that frame pages, route shells, and workspace experiences. Templates orchestrate organisms and provide consistent UX scaffolding.

## Scope
- Define page-level skeletons (headers, sidebars, footers) consumed by runtimes.
- Handle routing breadcrumbs, lazy loading slots, and responsive breakpoints.
- Provide shared page contexts (theme providers, feature-flag boundaries).
- Exclude runtime-specific data fetching; delegate to organisms or consuming apps.

## Project Map
- Directory structure mirrors runtime surfaces (admin, marketing, docs, workspace, etc.).
- `.exports.ts` - Register templates for consumption via alias imports; maintain alphabetical order.
- Supporting utilities (e.g., layout hooks) should live under `atomic/utils` when reused broadly.

## Commands
- `deno task test --filter templates` - Run layout-focused tests (render snapshots, accessibility checks).
- `deno task check` - Confirm types remain compatible with runtime router expectations.

## Patterns
- Compose organisms via slot props; avoid hard-wiring specific data sources.
- Provide configuration props for analytics, navigation, and feature flags to keep templates generic.
- Ensure responsive design using Tailwind breakpoints or CSS grid helpers defined centrally.
- Embed accessibility primitives (landmarks, skip links) so runtimes get them by default.

## Review & Test Checklist
- Visual regression or screenshot tests capture layout changes.
- Verify responsive states across key breakpoints (mobile, tablet, desktop).
- Document props and expected child components in component-level JSDoc.

## Safety & Guardrails
- Do not import runtime-specific routes or state stores; expose integration points via props.
- Keep heavy dependencies (maps, charts) out of templates; delegate to organisms for opt-in loading.
- Maintain SSR compatibility—avoid direct `window`/`document` usage during initial render.

## Ownership Signals
- **Primary owner:** Atomic Maintainers - Component Guild.
- **Point of contact:** Runtime UX leads via #open-industrial-design-system.
- **Escalation:** Runtime Architecture Lead (Mika Ito).

## Dependencies & Integrations
- Work with routing helpers from `atomic/utils/translateFromReactFlow.ts` and similar utilities.
- Consumed directly by `open-industrial-web-runtime/apps/*` via alias imports.
- Coordinate with Tailwind configuration in `open-industrial-web-runtime/tailwind.config.ts`.

## Related Docs
- Parent: [Atomic Library](../Agents.md).
- Sibling layers: [Atoms](../atoms/Agents.md), [Molecules](../molecules/Agents.md), [Organisms](../organisms/Agents.md), [Utils](../utils/Agents.md).

## Changelog Expectations
- Review on each major layout overhaul or navigation redesign.
- Note deprecations of template props and recommended replacements.
