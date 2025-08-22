import { EverythingAsCode, JSX } from '../.deps.ts';

/**
 * Props for the enterprise list component.
 */
export type EnterpriseListProps = {
  /** Array of EaC records representing enterprises */
  enterprises: EverythingAsCode[];
  /** Optional handler called when an enterprise is clicked */
  onSelect?: (enterprise: EverythingAsCode) => void;
} & JSX.HTMLAttributes<HTMLUListElement>;

/**
 * Renders a list of enterprises.  Each list item shows the name and optional
 * description.  Clicking an item invokes `onSelect`.
 */
export function EnterpriseList({
  enterprises,
  onSelect,
  ...props
}: EnterpriseListProps): JSX.Element {
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
