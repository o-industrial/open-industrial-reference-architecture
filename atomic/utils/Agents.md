# Agents Guide - Atomic Utils

Shared hooks, helpers, and constants that support the atomic component stack. Utilities keep styling, color, and data plumbing consistent across layers.

## Scope
- Expose reusable helpers (color maps, path builders, translation helpers) for atoms through templates.
- Host hooks that encapsulate shared logic without tying to a specific runtime.
- Maintain configuration objects consumed by Storybook demos and downstream apps.
- Exclude business logic that belongs in runtime services or organisms.

## Project Map
- `.exports.ts` - Curated export list for utils; ensure additions maintain backwards compatibility.
- `buildLinearPath.ts`, `buildSmoothPath.ts`, `buildStepPath.ts` - SVG path helpers for visualization components.
- `getIntentStyles.ts`, `neonColors.ts`, `impulseSourceColorMap.ts` - Styling and theming utilities.
- `hooks/` - Collection of shared hooks; promote to higher-level packages if used outside atomic contexts.

## Commands
- `deno task test --filter utils` - Run targeted tests covering helper logic.
- `deno task fmt` - Ensure formatting stays consistent, especially for large constant maps.

## Patterns
- Keep utilities pure and side-effect free; accept configuration via parameters rather than reading globals.
- Document return types and edge cases with JSDoc for IDE support.
- Avoid overloading utils with multiple responsibilities; split modules when APIs grow.
- Prefer exporting named functions/constants; avoid default exports to keep tree-shaking effective.

## Review & Test Checklist
- Unit tests cover boundary conditions and error paths for helpers.
- Verify downstream components compile when updating utility signatures.
- Update changelog notes in consuming layers if behavior shifts (e.g., new color tokens).

## Safety & Guardrails
- No direct DOM access or runtime-specific dependencies.
- Validate performance for helpers called per-frame or per-pixel (e.g., path builders) before merging.
- Coordinate version bumps with runtimes when introducing breaking constant changes.

## Ownership Signals
- **Primary owner:** Atomic Maintainers - Component Guild.
- **Point of contact:** #open-industrial-design-system Slack channel.
- **Escalation:** Design System Guild Lead (Diego Ramirez).

## Dependencies & Integrations
- Shared across all atomic layers; changes may ripple into multiple runtimes.
- Some utilities mirror logic in `open-industrial-web-runtime/src/state`; keep them synchronized.
- Document alignment with Tailwind tokens or theme definitions when relevant.

## Related Docs
- Parent guide: [Atomic Library](../Agents.md).
- Layer guides consuming these utilities: [Atoms](../atoms/Agents.md), [Molecules](../molecules/Agents.md), [Organisms](../organisms/Agents.md), [Templates](../templates/Agents.md).

## Changelog Expectations
- Revisit after significant color/token updates or when deprecating hooks.
- Maintain a brief change log in PR descriptions linking back to this guide.
