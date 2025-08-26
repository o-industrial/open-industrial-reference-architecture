import { JSX, useEffect, useState } from '../.deps.ts';

export type AdminNavItem = {
  href: string;
  label: string;
};

export type AdminNavProps = {
  items: AdminNavItem[];
  title?: string; // optional small heading
  footer?: preact.ComponentChildren; // optional footer slot (version, links)
} & JSX.HTMLAttributes<HTMLElement>;

export function AdminNav({
  items,
  title = 'Admin',
  footer,
  ...rest
}: AdminNavProps): JSX.Element {
  const initialPath =
    typeof location !== 'undefined' && location?.pathname
      ? location.pathname
      : '/admin';

  const [path, setPath] = useState(initialPath);

  useEffect(() => {
    const onPop = () => setPath(location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const linkCls = (isActive: boolean) =>
    [
      '-:-:block -:-:w-full -:-:px-3 -:-:py-2 -:-:rounded-md',
      '-:-:text-sm -:-:leading-5',
      isActive
        ? '-:-:bg-slate-800 -:-:text-white -:-:ring-1 -:-:ring-slate-700'
        : '-:-:text-slate-300 hover:-:-:text-white hover:-:-:bg-slate-800',
      'focus-visible:-:-:outline-none focus-visible:-:-:ring-2 focus-visible:-:-:ring-cyan-500',
      '-:-:transition-colors',
    ].join(' ');

  return (
    <nav
      aria-label="Admin"
      {...rest}
      class="-:-:flex -:-:flex-col h-full -:-:p-3"
    >
      <div class="-:-:px-3 -:-:pt-1 -:-:pb-2 -:-:text-[11px] -:-:uppercase -:-:tracking-widest -:-:text-slate-400">
        {title}
      </div>

      {/* Wrap list in flex-1 so footer stays pinned */}
      <div class="-:-:flex-1 -:-:space-y-1">
        <ul class="-:-:space-y-1">
          {items.map((it) => {
            const isActive =
              path === it.href || (it.href !== '/admin' && path.startsWith(it.href));
            return (
              <li key={it.href}>
                <a
                  href={it.href}
                  aria-current={isActive ? 'page' : undefined}
                  class={linkCls(isActive)}
                >
                  {it.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {footer && (
        <div class="-:-:mt-4 -:-:px-3 -:-:text-xs -:-:text-slate-500">
          {footer}
        </div>
      )}
    </nav>
  );
}
