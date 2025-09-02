import { ComponentChildren, JSX } from '../.deps.ts';

export interface AdminNavPanelProps {
  children?: ComponentChildren;
}

export function AdminNavPanel({ children }: AdminNavPanelProps): JSX.Element {
  return (
    <nav class='w-64 h-full flex flex-col gap-1 p-2 bg-neutral-900 overflow-y-auto'>
      {children}
    </nav>
  );
}

