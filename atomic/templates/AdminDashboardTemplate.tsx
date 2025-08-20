import { JSX } from '../.deps.ts';

/**
 * AdminDashboardTemplate
 *
 * A simple two‑column layout for the Open Industrial admin experience.
 * It renders a top application bar, a persistent side navigation column,
 * and a scrollable main content area.  Use this template to compose
 * admin pages that require a common layout structure.
 */
export type AdminDashboardTemplateProps = {
  /** Optional app bar component (renders at the top of the page). */
  appBar?: preact.ComponentChildren;
  /** Optional navigation component (renders on the left side). */
  nav?: preact.ComponentChildren;
  /** Main page content (renders in the remaining area). */
  children?: preact.ComponentChildren;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function AdminDashboardTemplate({
  appBar,
  nav,
  children,
  ...props
}: AdminDashboardTemplateProps): JSX.Element {
  return (
    <div {...props} class="-:-:flex -:-:flex-col -:-:min-h-screen">
      {/* Top bar */}
      {appBar && <div>{appBar}</div>}
      <div class="-:-:flex -:-:flex-1">
        {/* Side navigation */}
        {nav && (
          <aside class="-:-:w-64 -:-:border-r -:-:border-slate-700 -:-:bg-slate-900">
            {nav}
          </aside>
        )}
        {/* Main content area */}
        <main class="-:-:flex-1 -:-:overflow-auto -:-:p-4">{children}</main>
      </div>
    </div>
  );
}