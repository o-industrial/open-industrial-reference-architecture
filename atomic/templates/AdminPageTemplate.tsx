import { ComponentChildren, JSX } from '../.deps.ts';

export interface AdminPageTemplateProps {
  header?: ComponentChildren;
  sidebar?: ComponentChildren;
  children?: ComponentChildren;
}

export function AdminPageTemplate({
  header,
  sidebar,
  children,
}: AdminPageTemplateProps): JSX.Element {
  return (
    <div class='w-full h-full flex flex-col'>
      {header && <header class='w-full'>{header}</header>}
      <div class='flex flex-1 overflow-hidden'>
        {sidebar && (
          <aside class='w-64 flex-shrink-0 overflow-y-auto'>{sidebar}</aside>
        )}
        <main class='flex-1 overflow-y-auto'>{children}</main>
      </div>
    </div>
  );
}

