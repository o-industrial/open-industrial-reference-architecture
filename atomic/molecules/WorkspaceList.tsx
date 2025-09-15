import { EverythingAsCode, IntentTypes, JSX } from '../.deps.ts';
import { Badge } from '../atoms/Badge.tsx';

/**
 * Props for the workspace list component.
 */
export type WorkspaceListProps = {
  /** Array of EaC records representing workspaces (enterprises) */
  workspaces: EverythingAsCode[];
  /** Optional handler called when a workspace is clicked */
  onSelect?: (enterprise: EverythingAsCode) => void;
} & Omit<JSX.HTMLAttributes<HTMLUListElement>, 'onSelect'>;

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
          <div class="-:-:flex -:-:items-start -:-:justify-between -:-:gap-3">
            <div class="-:-:min-w-0">
              <div class="-:-:font-semibold">
                {eac.Details?.Name ?? eac.EnterpriseLookup}
              </div>
              {eac.Details?.Description && (
                <div class="-:-:text-sm -:-:text-slate-400 -:-:truncate">
                  {eac.Details.Description}
                </div>
              )}
            </div>
            {((eac as any)?.$Owner?.Username) && (
              <Badge
                intentType={IntentTypes.Info}
                title={`Owner: ${(eac as any).$Owner.Username}`}
                class="-:-:text-xs -:-:whitespace-nowrap"
              >
                Owner: {(eac as any).$Owner.Username}
              </Badge>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

// Backwards-compatibility aliases
export type EnterpriseListProps = WorkspaceListProps;
export const EnterpriseList = WorkspaceList;
