import { JSX } from '../.deps.ts';

export type AdminDashboardTemplateProps = {
  appBar?: preact.ComponentChildren;
  nav?: preact.ComponentChildren;
  children?: preact.ComponentChildren;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function AdminDashboardTemplate({
  appBar,
  nav,
  children,
  ...props
}: AdminDashboardTemplateProps): JSX.Element {
  return (
    <div
      {...props}
      class="-:-:flex -:-:flex-col -:-:min-h-screen -:-:bg-slate-950 -:-:text-slate-100"
    >
      {appBar && <div class="-:-:z-40">{appBar}</div>}

      <div class="-:-:flex -:-:flex-1 -:-:min-h-0">
        {nav && (
          <aside class="-:-:w-64 -:-:flex-shrink-0 -:-:border-r -:-:border-slate-700 -:-:bg-slate-900 -:-:min-h-0">
            {/* make the nav scroll independently and stick under the app bar */}
            <div class="-:-:sticky -:-:top-0 h-full -:-:overflow-y-auto">
              {nav}
            </div>
          </aside>
        )}

        <main class="-:-:flex-1 -:-:overflow-auto -:-:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
