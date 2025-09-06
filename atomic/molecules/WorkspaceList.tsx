import { EverythingAsCode, JSX } from '../.deps.ts';

/**
 * Props for the workspace list component.
 */
export type WorkspaceListProps = {
  /** Array of EaC records representing workspaces (enterprises) */
  workspaces: EverythingAsCode[];
  /** Optional handler called when a workspace is clicked */
  onSelect?: (enterprise: EverythingAsCode) => void;
} & JSX.HTMLAttributes<HTMLUListElement>;

/**
 * Renders a list of workspaces. Each list item shows the name and optional
 * description. Clicking an item invokes `onSelect`.
 */
export function WorkspaceList({
  workspaces: enterprises,
  onSelect,
  ...props
}: WorkspaceListProps): JSX.Element {
  return (
    <ul {...props} class="-:-:space-y-2">
      {enterprises.map((eac) => (
        <li
          key={eac.EnterpriseLookup}
          class="-:-:p-3 -:-:rounded-md -:-:cursor-pointer -:-:bg-slate-700 hover:-:-:bg-slate-600"
          onClick={() => onSelect?.(eac)}
        >
          <div class="-:-:font-semibold">
            {eac.Details?.Name ?? eac.EnterpriseLookup}
          </div>
          {eac.Details?.Description && (
            <div class="-:-:text-sm -:-:text-slate-400">
              {eac.Details.Description}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

// Backwards-compatibility aliases
export type EnterpriseListProps = WorkspaceListProps;
export const EnterpriseList = WorkspaceList;

