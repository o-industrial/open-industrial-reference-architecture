import { IntentTypes, JSX, useMemo } from '../.deps.ts';
import { Action, ActionStyleTypes } from '../atoms/Action.tsx';

export type AdminNavItem = {
  href: string;
  label: string;
};

export type AdminNavProps = {
  items: AdminNavItem[];
} & JSX.HTMLAttributes<HTMLElement>;

export function AdminNav({
  items,
  ...rest
}: AdminNavProps): JSX.Element {
  // Fallback to browser location if not provided (SSR-safe)
  const path = location?.pathname || '/admin';

  return (
    <nav aria-label="Admin" {...rest} class="-:-:p-3 -:-:space-y-1">
      {items.map((it) => {
        const isActive =
          path === it.href ||
          (it.href !== '/admin' && path.startsWith(it.href));

        return (
          <Action
            key={it.href}
            href={it.href}
            aria-current={isActive ? 'page' : undefined}
            intentType={IntentTypes.Info}
            styleType={ActionStyleTypes.Thin}
          >
            {it.label}
          </Action>
        );
      })}
    </nav>
  );
}
