# Agents Guide - Atomic Organisms

High-level components that orchestrate molecules, manage state, and integrate with runtime services. Organisms are the bridge between design system components and application workflows.

## Scope
- Handle data fetching, mutations, and routing glue for related molecules.
- Encapsulate complex interactions (wizard flows, dashboards, editors) reusable across runtimes.
- Own state machines or context providers shared by sibling components.
- Exclude app-specific actions that belong inside runtime `apps/*` directories.

## Project Map
- Domain folders mirror business capabilities (licensing, warm-query, simulators, etc.).
- `.exports.ts` - Explicit export list; keep in sync with documentation and avoid default exports.
- Supporting hooks live under `organisms/hooks/`; consider promoting to `atomic/utils` if reused elsewhere.

## Commands
- `deno task test --filter organisms` - Run organism-focused unit/integration tests.
- `deno task test:flows` (if available) - Execute scenario tests covering multi-step interactions.

## Patterns
- Favor dependency injection via props for network clients or services; keep organisms testable via mocks.
- Use the fluent builders in `src/fluent/*` when composing EaC pipelines.
- Co-locate schemas or DTOs with the organism, but mirror them in shared types if consumed elsewhere.
- Surface analytics hooks or telemetry callbacks explicitly to allow runtimes to opt in/out.

## Review & Test Checklist
- Integration or scenario tests cover critical flows and error handling paths.
- Verify accessibility: keyboard navigation, focus management, `aria` attributes.
- Downstream runtimes compile and render the organism in at least one integration test or story.

## Safety & Guardrails
- Avoid hard-coding environment URLs or secrets; accept configuration via props or context.
- Be cautious with global state; prefer local context providers or hooks exported from `utils/`.
- Document breaking changes to props or required providers; coordinate with runtime owners before merging.

## Ownership Signals
- **Primary owner:** Atomic Maintainers - Component Guild partnering with Runtime Feature Owners.
- **Point of contact:** Feature owner in #open-industrial-runtime channel.
- **Escalation:** Runtime Architecture Lead (Mika Ito).

## Dependencies & Integrations
- Typically depend on clients from `src/runtimes/*` or EaC SDKs; ensure versions align across repos.
- Hook into licensing, identity, or telemetry services; document required scopes/claims.
- Might require fixtures from `tests/` for integration coverage.

## Related Docs
- Parent: [Atomic Library](../Agents.md).
- Complementary guides: [Molecules](../molecules/Agents.md), [Templates](../templates/Agents.md), [Utils](../utils/Agents.md).
- Runtime usage: [Web Runtime guide](../../open-industrial-web-runtime/AGENTS.md).

## Changelog Expectations
- Update after major workflow revisions or when introducing new integration points.
- Record deprecations and migration timelines to coordinate with runtime teams.
